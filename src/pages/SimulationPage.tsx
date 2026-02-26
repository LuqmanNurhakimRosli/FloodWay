import { useRef, useState, useEffect, Suspense, useMemo, type CSSProperties } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Droplets, AlertTriangle, CheckCircle, Info,
    Activity, Wind, Thermometer, Settings2, RotateCcw, Layers, Eye, Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Keyframe animations (scoped to this component) ──────────────
const SIM_KEYFRAMES = `
  @keyframes simBadgePulse { 0%,100%{opacity:1} 50%{opacity:0.65} }
  @keyframes simRainFall   { from{background-position:0 0} to{background-position:0 32px} }
  @keyframes simGaugeShimmer { 0%,100%{opacity:.28} 50%{opacity:.95} }
  @keyframes simBlinkCrit  { 0%,100%{background:rgba(239,68,68,0.08)} 50%{background:rgba(239,68,68,0.20)} }
  @keyframes simRotateBadge{ 0%,100%{opacity:1} 50%{opacity:0.70} }
`;

// ─── Types ────────────────────────────────────────────────────────
type FloodLevel = 'normal' | 'medium' | 'high';

// ─── Config ───────────────────────────────────────────────────────
const FLOOD_CONFIG = {
    normal: {
        label: 'Normal', emoji: '☀️',
        waterY: -12, targetY: -12,
        color: new THREE.Color('#22d3ee'), opacity: 0,
        waveSpeed: 0.3, waveHeight: 0.05,
        skyColor: '#03080f', fogColor: '#03080f', fogDensity: 0.010,
        rainfall: 0, windSpeed: '5 km/h', temp: '28°C',
        riskLabel: 'Safe', riskColor: '#22c55e',
        riskBg: 'rgba(34,197,94,0.09)', riskBorder: 'rgba(74,222,128,0.28)',
        statusMsg: 'All clear. No flood risk detected in the area.',
        statusBg: 'rgba(34,197,94,0.06)', statusBorder: 'rgba(74,222,128,0.20)',
        statusBorderLeft: '#22c55e', statusText: '#86efac',
        particleCount: 0, waterLevel: '0.0m', gaugeWidth: '2%',
        levelActiveBg: 'rgba(34,197,94,0.09)', levelActiveBorder: 'rgba(74,222,128,0.30)',
        levelActiveText: '#86efac',
        levelActiveShadow: '0 0 20px rgba(34,197,94,0.1),0 6px 14px rgba(0,0,0,0.4)',
    },
    medium: {
        label: 'Medium', emoji: '🌧️',
        waterY: -1.8, targetY: -1.8,
        color: new THREE.Color('#3b82f6'), opacity: 0.62,
        waveSpeed: 1.0, waveHeight: 0.20,
        skyColor: '#040a15', fogColor: '#0a1628', fogDensity: 0.014,
        rainfall: 120, windSpeed: '45 km/h', temp: '24°C',
        riskLabel: 'Warning', riskColor: '#f59e0b',
        riskBg: 'rgba(245,158,11,0.09)', riskBorder: 'rgba(251,191,36,0.28)',
        statusMsg: 'Moderate flooding. First floors submerged. Evacuate low-lying areas immediately.',
        statusBg: 'rgba(245,158,11,0.07)', statusBorder: 'rgba(251,191,36,0.20)',
        statusBorderLeft: '#f59e0b', statusText: '#fcd34d',
        particleCount: 80, waterLevel: '1.5m', gaugeWidth: '44%',
        levelActiveBg: 'rgba(245,158,11,0.09)', levelActiveBorder: 'rgba(251,191,36,0.30)',
        levelActiveText: '#fde68a',
        levelActiveShadow: '0 0 20px rgba(245,158,11,0.1),0 6px 14px rgba(0,0,0,0.4)',
    },
    high: {
        label: 'High', emoji: '🌊',
        waterY: 2.8, targetY: 2.8,
        color: new THREE.Color('#1d4ed8'), opacity: 0.80,
        waveSpeed: 2.0, waveHeight: 0.38,
        skyColor: '#080d18', fogColor: '#080d18', fogDensity: 0.014,
        rainfall: 150, windSpeed: '50 km/h', temp: '21°C',
        riskLabel: 'Critical', riskColor: '#ef4444',
        riskBg: 'rgba(239,68,68,0.10)', riskBorder: 'rgba(248,113,113,0.28)',
        statusMsg: 'CRITICAL: Severe flooding active. Multiple floors submerged. EVACUATE NOW.',
        statusBg: 'rgba(239,68,68,0.08)', statusBorder: 'rgba(248,113,113,0.25)',
        statusBorderLeft: '#ef4444', statusText: '#fca5a5',
        particleCount: 200, waterLevel: '4.2m', gaugeWidth: '90%',
        levelActiveBg: 'rgba(239,68,68,0.10)', levelActiveBorder: 'rgba(248,113,113,0.30)',
        levelActiveText: '#fca5a5',
        levelActiveShadow: '0 0 20px rgba(216, 156, 156, 0.12),0 6px 14px rgba(0,0,0,0.4)',
    },
};

// ─── 3D: City Model ───────────────────────────────────────────────
function CityModel() {
    const { scene } = useGLTF('/city.glb');
    const cloned = useMemo(() => {
        const c = scene.clone(true);
        c.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                const applyMat = (m: THREE.Material) => {
                    const mat = (m as THREE.MeshStandardMaterial).clone();
                    mat.roughness = 0.4; mat.metalness = 0.25;
                    return mat;
                };
                if (Array.isArray(mesh.material)) mesh.material = mesh.material.map(applyMat);
                else if (mesh.material) mesh.material = applyMat(mesh.material);
            }
        });
        return c;
    }, [scene]);
    return (
        <group position={[0, -3, 0]} scale={[0.7, 0.7, 0.7]}>
            <primitive object={cloned} />
        </group>
    );
}

// ─── 3D: Water ───────────────────────────────────────────────────
function WaterPlane({ level }: { level: FloodLevel }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const cfg = FLOOD_CONFIG[level];
    const currentY = useRef(-12);
    const clockRef = useRef(0);

    const shader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 }, uColor: { value: cfg.color.clone() },
            uOpacity: { value: 0 }, uWaveH: { value: 0.05 }, uSpeed: { value: 0.3 },
        },
        vertexShader: `
      uniform float uTime,uWaveH,uSpeed; varying vec2 vUv; varying float vElev;
      void main(){
        vUv=uv; vec3 p=position;
        float w1=sin(p.x*1.6+uTime*uSpeed)*uWaveH;
        float w2=sin(p.z*1.3+uTime*uSpeed*0.75+1.5)*uWaveH*0.6;
        float w3=cos((p.x+p.z)*0.9+uTime*uSpeed*1.4)*uWaveH*0.35;
        p.y+=w1+w2+w3; vElev=(w1+w2+w3)/(uWaveH*2.0);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,
        fragmentShader: `
      uniform vec3 uColor; uniform float uOpacity,uTime; varying vec2 vUv; varying float vElev;
      void main(){
        vec3 deep=uColor*0.55; vec3 shallow=uColor*1.5+vec3(0.0,0.12,0.35);
        float foam=smoothstep(0.45,0.92,vElev);
        vec3 col=mix(deep,shallow,vElev*0.5+0.5);
        col=mix(col,vec3(0.82,0.92,1.0),foam*0.6);
        col+=sin(vUv.y*40.0+uTime*0.5)*0.015;
        gl_FragColor=vec4(col,uOpacity*(0.82+foam*0.18));
      }`,
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
    }), []);

    useFrame((_, dt) => {
        if (!meshRef.current || !matRef.current) return;
        clockRef.current += dt;
        currentY.current = THREE.MathUtils.lerp(currentY.current, cfg.targetY, dt * 1.4);
        meshRef.current.position.y = currentY.current;
        const m = matRef.current;
        m.uniforms.uTime.value = clockRef.current;
        m.uniforms.uOpacity.value = THREE.MathUtils.lerp(m.uniforms.uOpacity.value, cfg.opacity, dt * 1.8);
        m.uniforms.uColor.value.lerp(cfg.color, dt * 2.5);
        m.uniforms.uWaveH.value = THREE.MathUtils.lerp(m.uniforms.uWaveH.value, cfg.waveHeight, dt * 1.5);
        m.uniforms.uSpeed.value = THREE.MathUtils.lerp(m.uniforms.uSpeed.value, cfg.waveSpeed, dt * 1.5);
    });

    return (
        <mesh ref={meshRef} position={[0, -12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[32, 32, 96, 96]} />
            <shaderMaterial ref={matRef} {...shader} />
        </mesh>
    );
}

// ─── 3D: Rain ────────────────────────────────────────────────────
function RainSystem({ level }: { level: FloodLevel }) {
    const count = FLOOD_CONFIG[level].particleCount;
    const ref = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const pos = useMemo<[number, number, number][]>(() =>
        Array.from({ length: 200 }, () => [(Math.random() - 0.5) * 26, Math.random() * 20, (Math.random() - 0.5) * 26]), []);
    const speeds = useMemo(() => pos.map(() => 0.08 + Math.random() * 0.18), [pos]);

    useFrame(() => {
        if (!ref.current) return;
        ref.current.count = count;
        const ws = FLOOD_CONFIG[level].waveSpeed;
        for (let i = 0; i < count; i++) {
            pos[i][1] -= speeds[i] * (1 + ws * 0.4);
            if (pos[i][1] < -5) pos[i][1] = 16;
            dummy.position.set(...pos[i]); dummy.scale.set(0.018, 0.22, 0.018); dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, 200]}>
            <cylinderGeometry args={[1, 1, 1, 4]} />
            <meshBasicMaterial color="#b8d8ff" transparent opacity={0.45} />
        </instancedMesh>
    );
}

// ─── 3D: Debris ──────────────────────────────────────────────────
function FloatingDebris({ level }: { level: FloodLevel }) {
    const cfg = FLOOD_CONFIG[level];
    const items = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({
            id: i, x: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 20,
            speed: 0.002 + Math.random() * 0.004, angle: Math.random() * Math.PI * 2,
            size: 0.07 + Math.random() * 0.13,
        })), []);
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    useFrame((state) => {
        const visible = cfg.opacity > 0.25;
        items.forEach((item, i) => {
            const m = refs.current[i]; if (!m) return;
            item.angle += item.speed;
            m.position.x = item.x + Math.cos(item.angle) * 1.8;
            m.position.z = item.z + Math.sin(item.angle) * 1.8;
            m.position.y = cfg.targetY + Math.sin(state.clock.elapsedTime * 1.1 + item.angle) * 0.09;
            m.rotation.y += 0.008; m.visible = visible;
        });
    });
    return (
        <>
            {items.map((item, i) => (
                <mesh key={item.id} ref={(el) => { refs.current[i] = el; }} castShadow>
                    <boxGeometry args={[item.size, item.size * 0.35, item.size]} />
                    <meshStandardMaterial color="#6b6562" roughness={0.95} />
                </mesh>
            ))}
        </>
    );
}

// ─── 3D: Pulse Ring ──────────────────────────────────────────────
function PulseRing({ level }: { level: FloodLevel }) {
    const ref = useRef<THREE.Mesh>(null);
    const cfg = FLOOD_CONFIG[level];
    useFrame((state) => {
        if (!ref.current || level === 'normal') return;
        const t = (state.clock.elapsedTime * (level === 'high' ? 2.0 : 1.1)) % 1;
        ref.current.scale.set(1 + t * 3.5, 1 + t * 3.5, 1 + t * 3.5);
        (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
    });
    if (level === 'normal') return null;
    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, cfg.targetY + 0.06, 0]}>
            <ringGeometry args={[2.2, 2.8, 48]} />
            <meshBasicMaterial color={level === 'high' ? '#ef4444' : '#f59e0b'} transparent opacity={0.5}
                side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

// ─── 3D: Atmosphere ──────────────────────────────────────────────
function Atmosphere({ level }: { level: FloodLevel }) {
    const { scene } = useThree();
    const cfg = FLOOD_CONFIG[level];
    useEffect(() => {
        scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);
        scene.background = new THREE.Color(cfg.skyColor);
    }, [level, scene, cfg]);
    return null;
}

// ─── 3D: Dynamic Lights ──────────────────────────────────────────
function DynamicLights({ level }: { level: FloodLevel }) {
    const keyRef = useRef<THREE.PointLight>(null);
    const fillRef = useRef<THREE.PointLight>(null);

    useFrame((_, dt) => {
        if (!keyRef.current || !fillRef.current) return;

        // In High: warm amber-white (illuminates), Medium/Normal: cool blue
        const keyColor = level === 'high' ? '#ffc060'
            : level === 'medium' ? '#6688ff' : '#4466ff';
        const keyInt = level === 'high' ? 2.8
            : level === 'medium' ? 1.2 : 0.5;

        keyRef.current.intensity = THREE.MathUtils.lerp(keyRef.current.intensity, keyInt, dt * 1.5);
        keyRef.current.color.lerp(new THREE.Color(keyColor), dt * 2);

        // Blue fill gets stronger in High to counteract fog
        const fillInt = level === 'high' ? 1.8 : level === 'medium' ? 1.0 : 0.7;
        fillRef.current.intensity = THREE.MathUtils.lerp(fillRef.current.intensity, fillInt, dt * 1.5);
    });

    return (
        <>
            {/* Key: amber-white in High, blue in Normal/Medium */}
            <pointLight ref={keyRef} position={[-8, 8, -8]} intensity={0.5} color="#4466ff" distance={38} />
            {/* Fill: cool blue, extra bright in High mode */}
            <pointLight ref={fillRef} position={[8, 5, 8]} intensity={0.7} color="#99ccff" distance={32} />
            {/* Overhead white fill — makes roof & top floors visible at distance */}
            <pointLight position={[0, 16, 0]}
                intensity={level === 'high' ? 1.4 : level === 'medium' ? 0.6 : 0.3}
                color="#ffffff" distance={28} />
        </>
    );
}

// ─── Full 3D Scene ────────────────────────────────────────────────
function Scene({ level, showWater, showRain, showDebris }: {
    level: FloodLevel; showWater: boolean; showRain: boolean; showDebris: boolean;
}) {
    return (
        <>
            <Atmosphere level={level} />
            <ambientLight intensity={level === 'high' ? 0.75 : level === 'medium' ? 0.55 : 0.45} />
            <directionalLight position={[12, 22, 12]} intensity={1.3} castShadow
                shadow-mapSize-width={2048} shadow-mapSize-height={2048}
                shadow-camera-near={0.5} shadow-camera-far={90}
                shadow-camera-left={-22} shadow-camera-right={22}
                shadow-camera-top={22} shadow-camera-bottom={-22} />
            <DynamicLights level={level} />
            <Environment preset="city" />
            <ContactShadows position={[0, -3.01, 0]} opacity={0.55} scale={32} blur={2.5} far={9} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.02, 0]} receiveShadow>
                <planeGeometry args={[48, 48]} />
                <meshStandardMaterial color="#06111e" roughness={1} metalness={0} />
            </mesh>
            <Suspense fallback={null}>
                <Float speed={0.4} rotationIntensity={0.0} floatIntensity={0.08}>
                    <CityModel />
                </Float>
            </Suspense>
            {showWater && <WaterPlane level={level} />}
            {showRain && <RainSystem level={level} />}
            {showDebris && <FloatingDebris level={level} />}
            <PulseRing level={level} />
        </>
    );
}

// ─── Animated Counter ─────────────────────────────────────────────
function AnimCounter({ value, unit }: { value: number; unit: string }) {
    const [disp, setDisp] = useState(0);
    useEffect(() => {
        let raf: number; let start: number | null = null; const from = disp;
        const tick = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 700, 1);
            setDisp(Math.round(from + (value - from) * p));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);
    return <>{disp}{unit}</>;
}

// ─── Section Header ──────────────────────────────────────────────
function SectionTitle({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-slate-500">
            {icon}<span className="flex-1">{label}</span>{right}
        </div>
    );
}

// ─── Gauge ───────────────────────────────────────────────────────
const GAUGE_GRADIENTS: Record<FloodLevel, string> = {
    normal: 'linear-gradient(90deg,#064e3b,#22c55e)',
    medium: 'linear-gradient(90deg,#78350f,#f59e0b,#fde68a)',
    high: 'linear-gradient(90deg,#7f1d1d,#ef4444,#fca5a5)',
};
function FloodGauge({ level, cfg }: { level: FloodLevel; cfg: typeof FLOOD_CONFIG['normal'] }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.055)', borderRadius: 8, overflow: 'visible' }}>
                {/* fill */}
                <div style={{
                    height: '100%', borderRadius: 8,
                    background: GAUGE_GRADIENTS[level],
                    width: cfg.gaugeWidth,
                    transition: 'width 1.2s cubic-bezier(0.34,1.1,0.64,1)',
                    position: 'relative',
                }}>
                    {/* shimmer tip */}
                    <span style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0, width: 5,
                        background: 'rgba(255,255,255,0.6)', borderRadius: '0 8px 8px 0',
                        animation: 'simGaugeShimmer 2s ease-in-out infinite',
                    }} />
                </div>
                {/* pin */}
                <span style={{
                    position: 'absolute', top: -4, left: cfg.gaugeWidth,
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 10px rgba(255,255,255,0.55)',
                    transition: 'left 1.2s cubic-bezier(0.34,1.1,0.64,1)',
                    display: 'block',
                }} />
            </div>
            <div className="flex justify-between text-[0.55rem] tracking-wide" style={{ opacity: 0.85 }}>
                <span className="text-emerald-400">Safe</span>
                <span className="text-amber-400">Warning</span>
                <span className="text-red-400">Critical</span>
            </div>
        </div>
    );
}

// ─── Status Banner ────────────────────────────────────────────────
function StatusBanner({ level, cfg }: { level: FloodLevel; cfg: typeof FLOOD_CONFIG['normal'] }) {
    const style: CSSProperties = {
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '9px 12px', borderRadius: 10,
        fontSize: '0.67rem', lineHeight: 1.5, fontWeight: 500,
        background: cfg.statusBg,
        border: `1px solid ${cfg.statusBorder}`,
        borderLeft: `3px solid ${cfg.statusBorderLeft}`,
        color: cfg.statusText,
        animation: level === 'high' ? 'simBlinkCrit 1.8s ease-in-out infinite' : undefined,
        transition: 'all 0.5s',
    };
    return (
        <div style={style}>
            <Info size={12} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{cfg.statusMsg}</span>
        </div>
    );
}

// ─── Level Button ─────────────────────────────────────────────────
function LevelBtn({ l, active, onClick }: {
    l: FloodLevel; active: boolean; onClick: () => void;
}) {
    const cfg = FLOOD_CONFIG[l];
    const baseStyle: CSSProperties = {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '11px 6px', borderRadius: 13, width: '100%',
        border: `1px solid ${active ? cfg.levelActiveBorder : 'rgba(255,255,255,0.06)'}`,
        background: active ? cfg.levelActiveBg : 'rgba(255,255,255,0.025)',
        color: active ? cfg.levelActiveText : '#4a6080',
        fontSize: '0.68rem', cursor: 'pointer',
        transform: active ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: active ? cfg.levelActiveShadow : 'none',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    };
    return (
        <button style={baseStyle} onClick={onClick}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        >
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{cfg.emoji}</span>
            <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>{cfg.label}</span>
            <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>
                {l === 'normal' ? '0m' : l === 'medium' ? '1.5m' : '4.2m'}
            </span>
        </button>
    );
}

// ─── Toggle Button ────────────────────────────────────────────────
function ToggleBtn({ label, icon, on, onClick }: {
    label: string; icon: string; on: boolean; onClick: () => void;
}) {
    return (
        <button onClick={onClick} className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-[7px] text-[0.67rem] font-semibold transition-all',
            on
                ? 'bg-sky-500/10 border border-sky-400/28 text-sky-300'
                : 'bg-white/[0.025] border border-white/[0.06] text-slate-500'
        )}>
            <span>{icon}</span><span>{label}</span>
        </button>
    );
}

// ─── Stat Row ────────────────────────────────────────────────────
function StatRow({ icon, iconColor, label, value }: {
    icon: React.ReactNode; iconColor: string; label: string; value: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2.5 px-[11px] py-[9px] rounded-[10px] bg-white/[0.022] border border-white/[0.06] hover:bg-white/[0.042] transition-colors">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 shrink-0" style={{ color: iconColor }}>
                {icon}
            </div>
            <span className="flex-1 text-[0.67rem] text-slate-500">{label}</span>
            <span className="text-[0.82rem] font-bold text-slate-200 tabular-nums tracking-tight">{value}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────
export function SimulationPage() {
    const navigate = useNavigate();
    const [level, setLevel] = useState<FloodLevel>('normal');
    const [demoMode, setDemoMode] = useState(false);
    const [showWater, setShowWater] = useState(true);
    const [showRain, setShowRain] = useState(true);
    const [showDebris, setShowDebris] = useState(true);
    const cfg = FLOOD_CONFIG[level];

    useEffect(() => {
        if (!demoMode) return;
        const seq: FloodLevel[] = ['normal', 'medium', 'high', 'medium', 'normal'];
        let i = 0;
        const iv = setInterval(() => { i = (i + 1) % seq.length; setLevel(seq[i]); }, 4200);
        return () => clearInterval(iv);
    }, [demoMode]);

    // ── shared styles ──
    const panelBg = 'rgba(8,19,31,0.98)';
    const bgMain = '#03080f';
    const border = 'rgba(56,120,210,0.15)';
    const borderS = 'rgba(255,255,255,0.06)';

    return (
        <>
            {/* Inject keyframe animations */}
            <style>{SIM_KEYFRAMES}</style>

            {/* ══ ROOT ══ */}
            <div style={{
                display: 'flex', flexDirection: 'column',
                height: 'calc(100dvh - 64px)',   /* leave room for bottom nav */
                background: bgMain,
                color: '#e8f0ff',
                fontFamily: 'Inter,system-ui,sans-serif',
                overflow: 'hidden',
            }}>

                {/* ── MOBILE / TABLET TOP BAR ── */}
                <header style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px',
                    background: 'rgba(3,8,15,0.97)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    borderBottom: `1px solid ${border}`,
                    flexShrink: 0, zIndex: 40,
                }}
                    className="lg:hidden"
                >
                    <button className="flex items-center justify-center w-[34px] h-[34px] rounded-[10px] border transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: borderS, color: '#4a6080' }}
                        onClick={() => navigate('/home')}
                    >
                        <ArrowLeft size={17} />
                    </button>
                    <div className="flex items-center gap-2 flex-1 text-[0.9rem] font-bold tracking-tight">
                        <Droplets size={18} className="text-sky-400" />
                        <span>Flood Simulation</span>
                    </div>
                    <button
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide border transition-all',
                            demoMode ? 'bg-blue-500/15 border-blue-400/40 text-blue-300' : 'bg-white/[0.03] border-white/[0.06] text-slate-500')}
                        onClick={() => setDemoMode(!demoMode)}
                    >
                        <Activity size={12} />{demoMode ? 'Live' : 'Demo'}
                    </button>
                </header>

                {/* ══ BODY ══ */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

                    {/* ────────── SIDEBAR (desktop only) ─────────────────── */}
                    <aside className="hidden lg:flex flex-col shrink-0 overflow-y-auto overflow-x-hidden"
                        style={{
                            width: 292, minWidth: 292, height: '100%',
                            background: `linear-gradient(180deg, ${panelBg} 0%, rgba(11,27,45,0.98) 100%)`,
                            borderRight: `1px solid ${border}`,
                            scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.22) transparent',
                        }}
                    >
                        {/* Sidebar header */}
                        <div className="flex items-center gap-2.5 px-4 py-[18px] shrink-0"
                            style={{ borderBottom: `1px solid ${border}`, background: 'rgba(3,8,15,0.45)' }}
                        >
                            <button className="flex items-center justify-center w-[32px] h-[32px] rounded-[9px] border transition-all"
                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: borderS, color: '#4a6080' }}
                                onClick={() => navigate('/home')}
                            >
                                <ArrowLeft size={15} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Droplets size={18} className="text-sky-400" />
                                <div>
                                    <p className="text-[0.88rem] font-extrabold tracking-tight text-slate-100 leading-none">Flood Sim</p>
                                    <p className="text-[0.57rem] font-semibold text-slate-500 uppercase tracking-[0.08em] mt-0.5">KL Digital Twin</p>
                                </div>
                            </div>
                        </div>

                        {/* Risk badge */}
                        <div className="mx-3.5 mt-3.5" style={{
                            display: 'flex', alignItems: 'center', gap: 11,
                            padding: '12px 14px', borderRadius: 14,
                            background: cfg.riskBg,
                            border: `1px solid ${cfg.riskBorder}`,
                            transition: 'all 0.4s',
                        }}>
                            {level === 'normal'
                                ? <CheckCircle size={16} style={{ color: cfg.riskColor, flexShrink: 0 }} />
                                : <AlertTriangle size={16} style={{ color: cfg.riskColor, flexShrink: 0 }} />}
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '-0.025em', color: cfg.riskColor, lineHeight: 1.1 }}>
                                    {cfg.riskLabel}
                                </p>
                                <p className="text-[0.56rem] font-semibold text-slate-500 uppercase tracking-[0.07em] mt-0.5">Current Status</p>
                            </div>
                        </div>

                        {/* ── Flood Level ── */}
                        <div className="px-3.5 pt-3.5 flex flex-col gap-2">
                            <SectionTitle icon={<Layers size={12} />} label="Flood Level" />
                            <div className="grid grid-cols-3 gap-2">
                                {(['normal', 'medium', 'high'] as FloodLevel[]).map(l => (
                                    <LevelBtn key={l} l={l} active={level === l}
                                        onClick={() => { setLevel(l); setDemoMode(false); }} />
                                ))}
                            </div>
                        </div>

                        {/* ── Status ── */}
                        <div className="px-3.5 pt-3">
                            <StatusBanner level={level} cfg={cfg} />
                        </div>

                        {/* ── Water Level Gauge ── */}
                        <div className="px-3.5 pt-3.5 flex flex-col gap-2">
                            <SectionTitle icon={<Gauge size={12} />} label="Water Level"
                                right={<span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '-0.025em', color: cfg.riskColor, transition: 'color 0.4s' }}>{cfg.waterLevel}</span>} />
                            <FloodGauge level={level} cfg={cfg} />
                        </div>

                        {/* ── Live Metrics ── */}
                        <div className="px-3.5 pt-3.5 flex flex-col gap-2">
                            <SectionTitle icon={<Activity size={12} />} label="Live Metrics" />
                            <div className="flex flex-col gap-1">
                                <StatRow icon={<Droplets size={14} />} iconColor="#60a5fa" label="Rainfall"
                                    value={<AnimCounter value={cfg.rainfall} unit=" mm/h" />} />
                                <StatRow icon={<Wind size={14} />} iconColor="#22d3ee" label="Wind" value={cfg.windSpeed} />
                                <StatRow icon={<Thermometer size={14} />} iconColor="#f59e0b" label="Temp" value={cfg.temp} />
                            </div>
                        </div>

                        {/* ── Scene Layers ── */}
                        <div className="px-3.5 pt-3.5 flex flex-col gap-2">
                            <SectionTitle icon={<Eye size={12} />} label="Scene Layers" />
                            <div className="flex gap-1.5">
                                <ToggleBtn label="Water" icon="💧" on={showWater} onClick={() => setShowWater(!showWater)} />
                                <ToggleBtn label="Rain" icon="🌧" on={showRain} onClick={() => setShowRain(!showRain)} />
                                <ToggleBtn label="Debris" icon="🪵" on={showDebris} onClick={() => setShowDebris(!showDebris)} />
                            </div>
                        </div>

                        {/* ── Demo ── */}
                        <div className="px-3.5 pt-4 pb-4 mt-2" style={{ borderTop: `1px solid ${border}` }}>
                            <button
                                className={cn('flex items-center justify-center gap-2 w-full py-2.5 rounded-[11px] border text-[0.7rem] font-semibold transition-all',
                                    demoMode
                                        ? 'bg-blue-500/12 border-blue-400/35 text-blue-300'
                                        : 'bg-white/[0.025] border-white/[0.06] text-slate-500 hover:bg-blue-500/10 hover:border-blue-400/30 hover:text-blue-300'
                                )}
                                onClick={() => setDemoMode(!demoMode)}
                            >
                                <Settings2 size={13} />
                                {demoMode ? 'Stop Demo Cycle' : 'Start Demo Cycle'}
                            </button>
                        </div>
                    </aside>

                    {/* ────────── 3D VIEWPORT ──────────────────────────────── */}
                    <div className="relative flex-1 min-h-0 overflow-hidden" style={{ background: bgMain }}>
                        {/* Hint */}
                        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full z-10 pointer-events-none text-[0.6rem] text-slate-500"
                            style={{ background: 'rgba(3,8,15,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <RotateCcw size={11} /> <span>Drag • Scroll zoom • Right-drag pan</span>
                        </div>

                        {/* Mobile risk overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full z-10 pointer-events-none text-[0.67rem] font-bold uppercase tracking-wide lg:hidden"
                            style={{
                                background: cfg.riskBg,
                                border: `1px solid ${cfg.riskBorder}`,
                                color: cfg.riskColor,
                                backdropFilter: 'blur(16px)',
                                animation: 'simBadgePulse 2s ease-in-out infinite',
                            }}
                        >
                            {level === 'normal' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                            {cfg.riskLabel}
                        </div>

                        {/* Desktop corner stats */}
                        <div className="absolute bottom-14 right-3.5 hidden lg:flex flex-col gap-1.5 z-10">
                            {[
                                { icon: <Droplets size={11} className="text-blue-400" />, val: <><AnimCounter value={cfg.rainfall} unit="" />{' mm/h'}</> },
                                { icon: <Wind size={11} className="text-cyan-400" />, val: cfg.windSpeed },
                                { icon: <span className="text-[11px]">💧</span>, val: cfg.waterLevel, col: cfg.riskColor },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[0.67rem] font-semibold text-slate-400 tabular-nums"
                                    style={{ background: 'rgba(3,8,15,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', color: c.col }}
                                >
                                    {c.icon}{c.val}
                                </div>
                            ))}
                        </div>

                        {/* CSS rain veil */}
                        {level !== 'normal' && (
                            <div className="absolute inset-0 pointer-events-none z-[5]" style={{
                                opacity: level === 'high' ? 0.65 : 0.35,
                                backgroundImage: 'repeating-linear-gradient(transparent 0%,transparent 46%,rgba(130,190,255,0.065) 50%,transparent 54%,transparent 100%)',
                                backgroundSize: '3px 32px',
                                animation: 'simRainFall 0.12s linear infinite',
                            }} />
                        )}

                        <Canvas shadows dpr={[1, 1.8]}
                            camera={{ position: [28, 12, 28], fov: 48, near: 0.1, far: 300 }}
                            gl={{ antialias: true, alpha: false }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Scene level={level} showWater={showWater} showRain={showRain} showDebris={showDebris} />
                            <OrbitControls enablePan enableZoom enableRotate
                                minDistance={8} maxDistance={90} maxPolarAngle={Math.PI * 0.78}
                                autoRotate={false} makeDefault />
                        </Canvas>
                    </div>

                    {/* ────────── MOBILE BOTTOM CONTROLS ──────────────────── */}
                    <div className="flex flex-col gap-2.5 px-3.5 pt-3 lg:hidden"
                        style={{
                            paddingBottom: 'calc(64px + 16px)',
                            background: 'rgba(3,8,15,0.98)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            borderTop: `1px solid ${border}`,
                            flexShrink: 0,
                        }}
                    >
                        {/* Level buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            {(['normal', 'medium', 'high'] as FloodLevel[]).map(l => (
                                <LevelBtn key={l} l={l} active={level === l}
                                    onClick={() => { setLevel(l); setDemoMode(false); }} />
                            ))}
                        </div>

                        {/* Gauge */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[0.64rem] text-slate-500 uppercase tracking-wide">
                                <span>Water Level</span>
                                <span style={{ color: cfg.riskColor, fontWeight: 800 }}>{cfg.waterLevel}</span>
                            </div>
                            <FloodGauge level={level} cfg={cfg} />
                        </div>

                        {/* Stats row */}
                        <div className="flex justify-around">
                            {[
                                { icon: <Droplets size={12} className="text-blue-400" />, val: <AnimCounter value={cfg.rainfall} unit=" mm/h" /> },
                                { icon: <Wind size={12} className="text-cyan-400" />, val: cfg.windSpeed },
                                { icon: <Thermometer size={12} className="text-amber-400" />, val: cfg.temp },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-slate-400">
                                    {s.icon}{s.val}
                                </div>
                            ))}
                        </div>

                        {/* Status */}
                        <StatusBanner level={level} cfg={cfg} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default SimulationPage;
