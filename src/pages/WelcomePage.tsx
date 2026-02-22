// Login Page — Clean modern design with cute 2D otter mascot SVG
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Eye, EyeOff } from 'lucide-react';

/* ─── tiny helpers ─── */
function Spinner() {
    return (
        <svg style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
            fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

const GoogleIcon = () => (
    <svg style={{ width: 20, height: 20, flexShrink: 0 }} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

/* ─── Cute 2D Otter SVG Mascot ─── */
function OtterMascot({ size = 200 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}>
            <defs>
                <style>{`
                    @keyframes otterBounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-6px); }
                    }
                    @keyframes otterBlink {
                        0%, 42%, 44%, 100% { transform: scaleY(1); }
                        43% { transform: scaleY(0.05); }
                    }
                    @keyframes cheekGlow {
                        0%, 100% { opacity: 0.7; }
                        50% { opacity: 0.9; }
                    }
                    @keyframes tailWiggle {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(5deg); }
                        75% { transform: rotate(-3deg); }
                    }
                    .otter-bounce { animation: otterBounce 3s ease-in-out infinite; }
                    .otter-blink { animation: otterBlink 4s ease-in-out infinite; }
                    .cheek-glow { animation: cheekGlow 2.5s ease-in-out infinite; }
                    .tail-wiggle { animation: tailWiggle 2s ease-in-out infinite; transform-origin: 105px 250px; }
                `}</style>
            </defs>

            <g className="otter-bounce">
                {/* Shadow */}
                <ellipse cx="150" cy="332" rx="70" ry="8" fill="#000" opacity="0.08" />

                {/* Tail */}
                <g className="tail-wiggle">
                    <path d="M 100 250 C 60 240, 40 270, 55 290 C 70 310, 95 300, 105 275 Z"
                        fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />
                    <path d="M 98 255 C 68 248, 52 272, 63 287 C 74 302, 92 295, 100 275 Z"
                        fill="#A89888" />
                </g>

                {/* Body */}
                <ellipse cx="150" cy="255" rx="62" ry="75" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />
                {/* Belly */}
                <ellipse cx="150" cy="260" rx="42" ry="58" fill="#E8D8C4" />

                {/* Left foot */}
                <ellipse cx="118" cy="318" rx="22" ry="12" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
                {/* Right foot */}
                <ellipse cx="182" cy="318" rx="22" ry="12" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />

                {/* Left arm */}
                <path d="M 95 230 C 75 245, 78 275, 95 280 C 105 282, 108 268, 100 250 Z"
                    fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
                {/* Right arm */}
                <path d="M 205 230 C 225 245, 222 275, 205 280 C 195 282, 192 268, 200 250 Z"
                    fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />

                {/* Head */}
                <ellipse cx="150" cy="135" rx="72" ry="68" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />

                {/* Face patch (lighter) */}
                <ellipse cx="150" cy="148" rx="50" ry="48" fill="#E8D8C4" />

                {/* Left ear */}
                <ellipse cx="95" cy="85" rx="18" ry="16" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
                <ellipse cx="95" cy="85" rx="10" ry="9" fill="#D4A5A0" />

                {/* Right ear */}
                <ellipse cx="205" cy="85" rx="18" ry="16" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
                <ellipse cx="205" cy="85" rx="10" ry="9" fill="#D4A5A0" />

                {/* Eyes */}
                <g className="otter-blink" style={{ transformOrigin: '150px 125px' }}>
                    {/* Left eye */}
                    <ellipse cx="122" cy="125" rx="12" ry="12.5" fill="#2D1F14" />
                    <ellipse cx="118" cy="120" rx="4.5" ry="5" fill="#ffffff" />
                    <circle cx="127" cy="130" r="2" fill="#ffffff" opacity="0.5" />

                    {/* Right eye */}
                    <ellipse cx="178" cy="125" rx="12" ry="12.5" fill="#2D1F14" />
                    <ellipse cx="174" cy="120" rx="4.5" ry="5" fill="#ffffff" />
                    <circle cx="183" cy="130" r="2" fill="#ffffff" opacity="0.5" />
                </g>

                {/* Cheeks */}
                <circle cx="100" cy="148" r="14" fill="#F0A0A0" className="cheek-glow" />
                <circle cx="200" cy="148" r="14" fill="#F0A0A0" className="cheek-glow" />

                {/* Nose */}
                <ellipse cx="150" cy="148" rx="12" ry="9" fill="#2D1F14" />
                <ellipse cx="147" cy="145" rx="4" ry="3" fill="#5C4D3C" opacity="0.4" />

                {/* Mouth / Smile */}
                <path d="M 134 160 Q 142 172, 150 160" fill="none" stroke="#2D1F14" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 150 160 Q 158 172, 166 160" fill="none" stroke="#2D1F14" strokeWidth="2.5" strokeLinecap="round" />
            </g>
        </svg>
    );
}


export function LoginPage() {
    const { signIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [showEmail, setShowEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gLoading, setGLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogle = async () => {
        setError(''); setGLoading(true);
        const { error: e } = await signInWithGoogle();
        if (e) { setError(e.message); setGLoading(false); }
        else navigate('/loading');
    };

    const handleEmail = async (ev: React.FormEvent) => {
        ev.preventDefault(); setError(''); setLoading(true);
        const { error: e } = await signIn(email, password);
        if (e) { setError(e.message); setLoading(false); }
        else navigate('/loading');
    };

    const busy = loading || gLoading;

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #0B1120 0%, #0F1B2D 40%, #0B1A2A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            padding: '1rem',
        }}>
            {/* ── Injected styles ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes float1 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(12px,-18px) scale(1.05); } }
                @keyframes float2 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(-15px,12px) scale(1.08); } }
                @keyframes float3 { 0%,100%{ transform: translate(0,0); } 50%{ transform: translate(8px,10px); } }
                @keyframes gentlePulse { 0%,100%{ opacity: 0.5; } 50%{ opacity: 0.8; } }

                .login-card {
                    animation: fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
                    width: 100%;
                    max-width: 420px;
                }

                .login-btn {
                    display: flex; align-items: center; justify-content: center; gap: 0.7rem;
                    width: 100%; height: 52px; border-radius: 14px;
                    font-size: 0.88rem; font-weight: 700;
                    cursor: pointer; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
                    letter-spacing: 0.01em; border: none; outline: none;
                    font-family: inherit;
                }
                .login-btn:disabled { cursor: not-allowed; opacity: 0.6; }

                .login-btn-google {
                    background: rgba(255,255,255,0.06);
                    border: 1.5px solid rgba(255,255,255,0.1) !important;
                    color: #e2e8f0;
                    backdrop-filter: blur(12px);
                }
                .login-btn-google:hover:not(:disabled) {
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(255,255,255,0.2) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                }

                .login-btn-email {
                    background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 20px rgba(13,148,136,0.3);
                }
                .login-btn-email:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(13,148,136,0.45);
                }

                .login-input {
                    width: 100%; height: 50px; border-radius: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1.5px solid rgba(255,255,255,0.1);
                    color: #f1f5f9; font-size: 0.88rem; font-weight: 500;
                    padding: 0 1rem; outline: none; box-sizing: border-box;
                    transition: all 0.2s; font-family: inherit;
                }
                .login-input:focus {
                    border-color: rgba(45,212,191,0.5);
                    box-shadow: 0 0 0 3px rgba(45,212,191,0.08);
                    background: rgba(255,255,255,0.07);
                }
                .login-input::placeholder { color: #475569; }

                /* Responsive */
                @media (max-width: 480px) {
                    .login-card { padding: 1.5rem 1.25rem !important; }
                    .otter-wrapper svg { width: 140px !important; height: 140px !important; }
                    .login-title { font-size: 1.8rem !important; }
                    .login-btn { height: 48px !important; font-size: 0.84rem !important; }
                    .login-input { height: 46px !important; font-size: 0.84rem !important; }
                }
                @media (min-width: 481px) and (max-width: 768px) {
                    .otter-wrapper svg { width: 170px !important; height: 170px !important; }
                }
                @media (min-width: 769px) {
                    .otter-wrapper svg { width: 200px !important; height: 200px !important; }
                }
                @media (min-height: 800px) {
                    .login-card { padding-top: 2.5rem !important; padding-bottom: 2rem !important; }
                }
            `}</style>

            {/* ── Ambient background orbs ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
                    borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15,
                    background: 'radial-gradient(circle, #0d9488, transparent)',
                    top: '-10%', right: '-5%',
                    animation: 'float1 12s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
                    borderRadius: '50%', filter: 'blur(90px)', opacity: 0.1,
                    background: 'radial-gradient(circle, #3b82f6, transparent)',
                    bottom: '-8%', left: '-5%',
                    animation: 'float2 15s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '20vw', height: '20vw', maxWidth: 250, maxHeight: 250,
                    borderRadius: '50%', filter: 'blur(70px)', opacity: 0.08,
                    background: 'radial-gradient(circle, #8b5cf6, transparent)',
                    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    animation: 'float3 10s ease-in-out infinite',
                }} />
            </div>

            {/* ── Subtle dot pattern ── */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '30px 30px',
            }} />

            {/* ── Login Card ── */}
            <div className="login-card" style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 28,
                padding: '2rem 1.75rem 1.5rem',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
                {/* Otter + branding */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className="otter-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <OtterMascot size={180} />
                    </div>
                    <h1 className="login-title" style={{
                        fontSize: '2.2rem', fontWeight: 900, color: '#ffffff',
                        letterSpacing: '-0.03em', lineHeight: 1, margin: 0,
                        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        FloodWay
                    </h1>
                    <p style={{
                        fontSize: '0.72rem', fontWeight: 600, color: '#475569',
                        letterSpacing: '0.2em', marginTop: '0.4rem', textTransform: 'uppercase',
                    }}>
                        Flood Preparedness Sentinel
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '0.7rem 1rem', borderRadius: 12, marginBottom: '0.75rem',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {/* Auth buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Google */}
                    <button
                        id="google-signin-btn"
                        className="login-btn login-btn-google"
                        onClick={handleGoogle}
                        disabled={busy}
                    >
                        {gLoading ? <Spinner /> : <GoogleIcon />}
                        Continue with Google
                    </button>

                    {/* Email toggle / form */}
                    {!showEmail ? (
                        <button
                            id="email-toggle-btn"
                            className="login-btn login-btn-email"
                            onClick={() => setShowEmail(true)}
                            disabled={busy}
                        >
                            <Mail size={18} />
                            Continue with Email
                        </button>
                    ) : (
                        <form onSubmit={handleEmail} style={{
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            animation: 'fadeInUp 0.3s ease both',
                        }}>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={busy}
                                className="login-input"
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={busy}
                                    className="login-input"
                                    style={{ paddingRight: '2.8rem' }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: 'absolute', right: '0.8rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: '#64748b',
                                        display: 'flex', padding: 0,
                                    }}>
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="login-btn login-btn-email"
                                disabled={busy}
                            >
                                {loading ? <Spinner /> : null}
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.85rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Sign up link */}
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', fontWeight: 500, margin: 0 }}>
                    Don't have an account?{' '}
                    <Link to="/signup"
                        style={{
                            color: '#2dd4bf', fontWeight: 700, textDecoration: 'none',
                            borderBottom: '1px solid rgba(45,212,191,0.3)',
                            transition: 'all 0.2s',
                        }}>
                        Sign up free
                    </Link>
                </p>

                {/* Footer */}
                <p style={{
                    textAlign: 'center', fontSize: '0.62rem', color: '#334155',
                    margin: '0.75rem 0 0', lineHeight: 1.6,
                }}>
                    By signing in, you agree to our{' '}
                    <span style={{ color: '#2dd4bf', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color: '#2dd4bf', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
                </p>
            </div>
        </div>
    );
}
