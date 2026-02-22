// Loading Page — Otter Sentinel loading screen with SVG rain animation
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { LOCATIONS } from '../data/locations';

const STEPS = [
    'Connecting to Sentinel Network…',
    'Acquiring your location…',
    'Loading flood sensor data…',
    'Calculating risk levels…',
    'Preparing your dashboard…',
] as const;

export function LoadingPage() {
    const navigate = useNavigate();
    const { setLocation } = useApp();
    const [stepIdx, setStepIdx] = useState(0);
    const [dots, setDots] = useState('');

    /* ── Cycle step labels ── */
    useEffect(() => {
        const interval = setInterval(() => {
            setStepIdx(prev => (prev + 1) % STEPS.length);
        }, 900);
        return () => clearInterval(interval);
    }, []);

    /* ── Animated ellipsis after label ── */
    useEffect(() => {
        const t = setInterval(() => {
            setDots(d => (d.length >= 3 ? '' : d + '.'));
        }, 400);
        return () => clearInterval(t);
    }, []);

    /* ── Navigate after delay ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setLocation(LOCATIONS[0]);
            navigate('/home', { replace: true });
        }, 4200);
        return () => clearTimeout(timer);
    }, [navigate, setLocation]);

    return (
        <div
            className="min-h-dvh flex flex-col items-center justify-center overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 50%, #f0f9ff 100%)' }}
        >
            {/* ── Ambient blobs ── */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)' }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #e0f2fe, transparent)' }} />

            {/* ── Glass card ── */}
            <div className="relative flex flex-col items-center p-8 sm:p-12 rounded-[2.5rem] w-full max-w-sm mx-4 z-10"
                style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px -15px rgba(30,58,138,0.18), 0 0 0 1px rgba(255,255,255,0.6)',
                }}>

                {/* ════════════════════════════════════════
                        MASTER SVG — Otter + Rain Scene
                    ════════════════════════════════════════ */}
                <svg
                    width="100%"
                    height="auto"
                    viewBox="0 0 500 500"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ filter: 'drop-shadow(0 8px 24px rgba(30,58,138,0.12))' }}
                >
                    <defs>
                        <style>{`
                            @keyframes rainFallBg {
                                0%   { transform: translate(10px, -100px); opacity: 0; }
                                20%  { opacity: 0.35; }
                                80%  { opacity: 0.35; }
                                100% { transform: translate(-30px, 520px); opacity: 0; }
                            }
                            @keyframes rainFallFg {
                                0%   { transform: translate(30px, -100px); opacity: 0; }
                                10%  { opacity: 0.75; }
                                90%  { opacity: 0.75; }
                                100% { transform: translate(-80px, 560px); opacity: 0; }
                            }
                            @keyframes rippleExpand {
                                0%   { transform: scale(0.15); opacity: 0.9; stroke-width: 6px; }
                                100% { transform: scale(1); opacity: 0; stroke-width: 1px; }
                            }
                            @keyframes splashBounce {
                                0%   { transform: scale(0) translateY(0); opacity: 1; }
                                40%  { transform: scale(1.3) translateY(-14px); opacity: 1; }
                                100% { transform: scale(0) translateY(-4px); opacity: 0; }
                            }
                            @keyframes breatheOrganic {
                                0%, 100% { transform: scale(1,1) translateY(0px); }
                                50%       { transform: scale(1.015,.985) translateY(2px); }
                            }
                            @keyframes umbrellaSway {
                                0%, 100% { transform: rotate(-8deg); }
                                50%       { transform: rotate(-14deg); }
                            }
                            @keyframes tailWag {
                                0%, 100% { transform: rotate(0deg); }
                                50%       { transform: rotate(9deg); }
                            }
                            @keyframes signalPulse {
                                0%, 100% { opacity: 0.15; }
                                50%       { opacity: 1; }
                            }
                            @keyframes ledBlink {
                                0%, 100% { fill: #10b981; filter: drop-shadow(0 0 3px #10b981); }
                                50%       { fill: #047857; filter: none; }
                            }
                            @keyframes puddleShimmer {
                                0%, 100% { opacity: 0.4; }
                                50%       { opacity: 0.7; }
                            }

                            .rain-bg { stroke:#93c5fd; stroke-linecap:round; animation: rainFallBg 1s linear infinite; }
                            .rain-fg { stroke:#3b82f6; stroke-linecap:round; animation: rainFallFg 0.65s linear infinite; }
                            .ripple  { fill:none; stroke:#60a5fa; animation: rippleExpand 2.6s cubic-bezier(0.1,0.8,0.3,1) infinite; }
                            .splash  { fill:#93c5fd; animation: splashBounce 0.65s ease-out infinite; }
                            .mascot-body  { animation: breatheOrganic 3.5s ease-in-out infinite; transform-origin: 250px 440px; }
                            .umbrella-rig { animation: umbrellaSway 5s ease-in-out infinite; transform-origin: 320px 320px; }
                            .tail-rig     { animation: tailWag 3.5s ease-in-out infinite; transform-origin: 270px 395px; }
                            .wifi-1 { animation: signalPulse 1.5s infinite 0.0s; }
                            .wifi-2 { animation: signalPulse 1.5s infinite 0.22s; }
                            .wifi-3 { animation: signalPulse 1.5s infinite 0.44s; }
                            .tech-led { animation: ledBlink 2s ease-in-out infinite; }
                            .puddle-shimmer { animation: puddleShimmer 2s ease-in-out infinite; }
                        `}</style>

                        <filter id="dropshadow">
                            <feDropShadow dx="0" dy="10" stdDeviation="7" floodOpacity="0.12" />
                        </filter>
                        <filter id="umbrellaGlow">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                            <feFlood floodColor="#3b82f6" floodOpacity="0.25" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="shadow" />
                            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* ── BG Rain (slow, light) ── */}
                    <g strokeWidth="2.5">
                        <line className="rain-bg" x1="60" y1="0" x2="45" y2="55" style={{ animationDelay: '0.1s' }} />
                        <line className="rain-bg" x1="180" y1="-40" x2="165" y2="15" style={{ animationDelay: '0.45s' }} />
                        <line className="rain-bg" x1="320" y1="-30" x2="305" y2="25" style={{ animationDelay: '0.75s' }} />
                        <line className="rain-bg" x1="460" y1="10" x2="445" y2="65" style={{ animationDelay: '0.2s' }} />
                        <line className="rain-bg" x1="100" y1="120" x2="85" y2="175" style={{ animationDelay: '0.9s' }} />
                        <line className="rain-bg" x1="490" y1="80" x2="475" y2="135" style={{ animationDelay: '0.55s' }} />
                        <line className="rain-bg" x1="380" y1="180" x2="365" y2="235" style={{ animationDelay: '0.3s' }} />
                    </g>

                    {/* ── Puddle & Ripples ── */}
                    <ellipse cx="250" cy="452" rx="155" ry="23" fill="#e2e8f0" />
                    <ellipse cx="250" cy="452" rx="120" ry="16" fill="#cbd5e1" className="puddle-shimmer" />
                    {/* Ripple ring 1 */}
                    <ellipse cx="250" cy="452" rx="140" ry="20" className="ripple" style={{ animationDelay: '0s' }} />
                    {/* Ripple ring 2 */}
                    <ellipse cx="250" cy="452" rx="140" ry="20" className="ripple" style={{ animationDelay: '1.3s' }} />

                    {/* ── MASCOT BODY GROUP ── */}
                    <g className="mascot-body">

                        {/* Tail (behind body) */}
                        <g className="tail-rig">
                            <path d="M 270 392 C 365 378, 415 422, 362 458 C 312 492, 252 438, 252 412 Z"
                                fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />
                        </g>

                        {/* Torso */}
                        <path d="M 175 262 C 118 342, 122 437, 190 447 L 312 447 C 378 437, 382 342, 325 262 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />
                        {/* Belly highlight */}
                        <path d="M 198 262 C 160 338, 157 422, 207 432 L 294 432 C 343 422, 342 338, 308 262 Z"
                            fill="#f8fafc" stroke="none" />

                        {/* Left foot */}
                        <path d="M 168 441 C 132 441, 128 467, 158 472 C 188 472, 200 452, 195 441 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />
                        <line x1="148" y1="457" x2="153" y2="472" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                        <line x1="163" y1="457" x2="166" y2="472" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

                        {/* Right foot */}
                        <path d="M 332 441 C 368 441, 372 467, 342 472 C 312 472, 302 452, 307 441 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />
                        <line x1="332" y1="457" x2="329" y2="472" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                        <line x1="347" y1="457" x2="342" y2="472" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

                        {/* Left arm */}
                        <path d="M 170 282 Q 118 332, 143 382 A 15 15 0 0 0 172 372 Q 158 322, 195 302 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />

                        {/* ── HEAD ── */}
                        <path d="M 155 202 C 155 122, 345 122, 345 202 C 345 262, 295 287, 250 287 C 205 287, 155 262, 155 202 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />

                        {/* Left ear */}
                        <path d="M 175 142 C 142 126, 128 167, 160 177 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 150 152 Q 158 147, 162 157" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />

                        {/* Right ear */}
                        <path d="M 325 142 C 358 126, 372 167, 340 177 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Eyes */}
                        <circle cx="210" cy="182" r="13" fill="#0f172a" />
                        <circle cx="290" cy="182" r="13" fill="#0f172a" />
                        <circle cx="215" cy="175" r="4.5" fill="#ffffff" />
                        <circle cx="206" cy="186" r="2" fill="#ffffff" />
                        <circle cx="295" cy="175" r="4.5" fill="#ffffff" />
                        <circle cx="286" cy="186" r="2" fill="#ffffff" />

                        {/* Muzzle */}
                        <path d="M 195 222 C 195 267, 305 267, 305 222" fill="#ffffff" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />

                        {/* Nose */}
                        <path d="M 235 202 Q 250 197, 265 202 Q 275 222, 250 222 Q 225 222, 235 202 Z" fill="#0f172a" />
                        <ellipse cx="255" cy="206" rx="4" ry="2" fill="#ffffff" opacity="0.4" transform="rotate(-15,255,206)" />

                        {/* Smile W-shape */}
                        <path d="M 222 222 C 232 242, 250 242, 250 222" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 250 222 C 250 242, 268 242, 278 222" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 235 244 Q 250 254, 265 244" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

                        {/* ── Headset ── */}
                        <rect x="327" y="152" width="26" height="64" rx="13" fill="#ffffff" stroke="#0f172a" strokeWidth="10" />
                        <rect x="335" y="167" width="10" height="34" rx="5" fill="#1e293b" />
                        <circle cx="340" cy="174" r="3" className="tech-led" />

                        {/* Mic arm */}
                        <path d="M 340 207 C 340 257, 292 260, 282 250" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        <rect x="264" y="242" width="18" height="14" rx="7" fill="#0f172a" />
                        <rect x="266" y="244" width="6" height="4" rx="2" fill="#475569" />

                        {/* Wi-Fi arcs */}
                        <path className="wifi-1" d="M 372 162 A 15 15 0 0 1 372 197" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                        <path className="wifi-2" d="M 385 147 A 30 30 0 0 1 385 212" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                        <path className="wifi-3" d="M 398 132 A 45 45 0 0 1 398 227" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                    </g>

                    {/* ── UMBRELLA + RIGHT ARM (sways independently) ── */}
                    <g className="umbrella-rig">
                        {/* Shaft */}
                        <line x1="320" y1="368" x2="320" y2="72" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                        {/* Shaft inner highlight */}
                        <line x1="320" y1="368" x2="320" y2="72" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                        {/* Hook handle */}
                        <path d="M 320 362 V 382 A 15 15 0 0 1 290 382" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />

                        {/* Canopy depth (dark) */}
                        <path d="M 90 142 C 90 22, 550 22, 550 142 Z" fill="#1e3a8a" />

                        {/* Canopy front */}
                        <path d="M 90 142 C 90 -8, 550 -8, 550 142 Q 492 167, 435 142 Q 377 167, 320 142 Q 262 167, 205 142 Q 147 167, 90 142 Z"
                            fill="#3b82f6" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" filter="url(#umbrellaGlow)" />

                        {/* Canopy gloss */}
                        <path d="M 122 112 C 122 32, 322 22, 322 22 C 302 42, 182 52, 152 112 Z" fill="#ffffff" opacity="0.22" />

                        {/* Ribs */}
                        <path d="M 205 142 Q 250 62, 320 42" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 320 142 Q 320 62, 320 42" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 435 142 Q 390 62, 320 42" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                        {/* Top spike */}
                        <line x1="320" y1="42" x2="320" y2="7" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />

                        {/* Right arm */}
                        <path d="M 285 282 Q 332 282, 327 342 A 18 18 0 0 1 287 342 Q 297 312, 272 312 Z"
                            fill="#ffffff" stroke="#0f172a" strokeWidth="10" strokeLinejoin="round" />
                        <line x1="307" y1="317" x2="337" y2="317" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                        <line x1="307" y1="329" x2="337" y2="329" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                        <line x1="307" y1="341" x2="334" y2="341" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

                        {/* Rain splashes on umbrella top */}
                        <circle cx="200" cy="47" r="5" className="splash" style={{ animationDelay: '0.2s' }} />
                        <circle cx="452" cy="57" r="4" className="splash" style={{ animationDelay: '0.6s' }} />
                        <circle cx="322" cy="17" r="6" className="splash" style={{ animationDelay: '0.1s' }} />
                        <circle cx="370" cy="38" r="3.5" className="splash" style={{ animationDelay: '0.85s' }} />
                        <circle cx="265" cy="42" r="4" className="splash" style={{ animationDelay: '0.5s' }} />
                    </g>

                    {/* ── FG Rain (thick, fast) ── */}
                    <g strokeWidth="5.5" opacity="0.88">
                        <line className="rain-fg" x1="195" y1="30" x2="155" y2="135" style={{ animationDelay: '0.3s' }} />
                        <line className="rain-fg" x1="415" y1="55" x2="375" y2="160" style={{ animationDelay: '0.8s' }} />
                        <line className="rain-fg" x1="155" y1="205" x2="115" y2="310" style={{ animationDelay: '0.5s' }} />
                        <line className="rain-fg" x1="385" y1="255" x2="345" y2="360" style={{ animationDelay: '0.15s' }} />
                        <line className="rain-fg" x1="275" y1="355" x2="235" y2="460" style={{ animationDelay: '0.65s' }} />
                        <line className="rain-fg" x1="80" y1="320" x2="40" y2="425" style={{ animationDelay: '0.4s' }} />
                    </g>
                </svg>

                {/* ════════════════════════════════════════
                        TYPOGRAPHY + LOADER
                    ════════════════════════════════════════ */}
                <div className="text-center mt-4 w-full">
                    {/* Brand */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <h1 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', letterSpacing: '-0.03em' }}>
                            FloodWay
                        </h1>
                        {/* Blue checkmark badge */}
                        <div style={{
                            width: 28, height: 28,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(59,130,246,0.5)',
                            flexShrink: 0,
                        }}>
                            <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>

                    {/* Step label */}
                    <p style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748b',
                        letterSpacing: '0.04em',
                        marginBottom: '0.75rem',
                        height: '1.25rem',
                        transition: 'opacity 0.3s',
                    }}>
                        {STEPS[stepIdx]}{dots}
                    </p>

                    {/* Loading pill */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 999,
                        background: 'rgba(248,250,252,0.9)',
                        border: '1px solid rgba(203,213,225,0.6)',
                        boxShadow: '0 2px 8px rgba(30,58,138,0.07)',
                    }}>
                        {/* Spinner */}
                        <svg
                            style={{ width: 16, height: 16, animation: 'spin 0.9s linear infinite', color: '#2563eb', flexShrink: 0 }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                            Establishing Sentinel Uplink
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: '1.25rem', height: 4, borderRadius: 9999, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #38bdf8)',
                            borderRadius: 9999,
                            animation: 'loadProgress 4.2s ease-in-out forwards',
                        }} />
                    </div>
                </div>
            </div>

            {/* Global keyframes for spinner + progress (injected via style tag) */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes loadProgress {
                    0%   { width: 0%; }
                    20%  { width: 18%; }
                    40%  { width: 42%; }
                    65%  { width: 66%; }
                    85%  { width: 82%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}
