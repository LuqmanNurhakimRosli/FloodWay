// Sign Up Page — Matching design with cute 2D otter mascot SVG
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

/* ─── Spinner ─── */
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

/* ─── Small Otter (waving) ─── */
function OtterSmall() {
    return (
        <svg width="64" height="64" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>{`
                    @keyframes miniWave {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(-15deg); }
                        75% { transform: rotate(10deg); }
                    }
                    .mini-wave { animation: miniWave 1.5s ease-in-out infinite; transform-origin: 205px 260px; }
                `}</style>
            </defs>
            <ellipse cx="150" cy="332" rx="70" ry="8" fill="#000" opacity="0.06" />
            {/* Tail */}
            <path d="M 100 250 C 60 240, 40 270, 55 290 C 70 310, 95 300, 105 275 Z"
                fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />
            {/* Body */}
            <ellipse cx="150" cy="255" rx="62" ry="75" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />
            <ellipse cx="150" cy="260" rx="42" ry="58" fill="#E8D8C4" />
            {/* Feet */}
            <ellipse cx="118" cy="318" rx="22" ry="12" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            <ellipse cx="182" cy="318" rx="22" ry="12" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            {/* Left arm */}
            <path d="M 95 230 C 75 245, 78 275, 95 280 C 105 282, 108 268, 100 250 Z"
                fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            {/* Right arm (waving) */}
            <g className="mini-wave">
                <path d="M 205 230 C 225 215, 240 225, 230 250 C 222 268, 200 265, 200 250 Z"
                    fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            </g>
            {/* Head */}
            <ellipse cx="150" cy="135" rx="72" ry="68" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2.5" />
            <ellipse cx="150" cy="148" rx="50" ry="48" fill="#E8D8C4" />
            {/* Ears */}
            <ellipse cx="95" cy="85" rx="18" ry="16" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            <ellipse cx="95" cy="85" rx="10" ry="9" fill="#D4A5A0" />
            <ellipse cx="205" cy="85" rx="18" ry="16" fill="#9B8B7A" stroke="#5C4D3C" strokeWidth="2" />
            <ellipse cx="205" cy="85" rx="10" ry="9" fill="#D4A5A0" />
            {/* Eyes */}
            <ellipse cx="122" cy="125" rx="12" ry="12.5" fill="#2D1F14" />
            <ellipse cx="118" cy="120" rx="4.5" ry="5" fill="#ffffff" />
            <ellipse cx="178" cy="125" rx="12" ry="12.5" fill="#2D1F14" />
            <ellipse cx="174" cy="120" rx="4.5" ry="5" fill="#ffffff" />
            {/* Cheeks */}
            <circle cx="100" cy="148" r="14" fill="#F0A0A0" opacity="0.75" />
            <circle cx="200" cy="148" r="14" fill="#F0A0A0" opacity="0.75" />
            {/* Nose */}
            <ellipse cx="150" cy="148" rx="12" ry="9" fill="#2D1F14" />
            {/* Mouth */}
            <path d="M 134 160 Q 142 172, 150 160" fill="none" stroke="#2D1F14" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 150 160 Q 158 172, 166 160" fill="none" stroke="#2D1F14" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export function SignUpPage() {
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (name.trim().length < 2) { setError('Please enter your full name (at least 2 characters).'); return; }
        setLoading(true);
        const { error: signUpError } = await signUp(email, password, name.trim());
        if (signUpError) { setError(signUpError.message); setLoading(false); }
        else navigate('/loading');
    };

    const handleGoogleSignIn = async () => {
        setError(''); setGoogleLoading(true);
        const { error: signInError } = await signInWithGoogle();
        if (signInError) { setError(signInError.message); setGoogleLoading(false); }
        else navigate('/loading');
    };

    const isLoading = loading || googleLoading;

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
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float1 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(12px,-18px) scale(1.05); } }
                @keyframes float2 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(-15px,12px) scale(1.08); } }

                .signup-card {
                    animation: fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
                    width: 100%; max-width: 420px;
                }
                .signup-btn {
                    display: flex; align-items: center; justify-content: center; gap: 0.65rem;
                    width: 100%; height: 48px; border-radius: 12px;
                    font-size: 0.85rem; font-weight: 700;
                    cursor: pointer; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
                    letter-spacing: 0.01em; border: none; outline: none;
                    font-family: inherit;
                }
                .signup-btn:disabled { cursor: not-allowed; opacity: 0.6; }
                .signup-btn-google {
                    background: rgba(255,255,255,0.06);
                    border: 1.5px solid rgba(255,255,255,0.1) !important;
                    color: #e2e8f0; backdrop-filter: blur(12px);
                }
                .signup-btn-google:hover:not(:disabled) {
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(255,255,255,0.2) !important;
                    transform: translateY(-1px);
                }
                .signup-btn-primary {
                    background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
                    color: #ffffff;
                    box-shadow: 0 4px 20px rgba(13,148,136,0.3);
                }
                .signup-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(13,148,136,0.45);
                }
                .signup-input {
                    width: 100%; height: 46px; border-radius: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1.5px solid rgba(255,255,255,0.1);
                    color: #f1f5f9; font-size: 0.85rem; font-weight: 500;
                    padding: 0 1rem; outline: none; box-sizing: border-box;
                    transition: all 0.2s; font-family: inherit;
                }
                .signup-input:focus {
                    border-color: rgba(45,212,191,0.5);
                    box-shadow: 0 0 0 3px rgba(45,212,191,0.08);
                    background: rgba(255,255,255,0.07);
                }
                .signup-input::placeholder { color: #475569; }
                .signup-label {
                    font-size: 0.68rem; font-weight: 700; color: #94a3b8;
                    text-transform: uppercase; letter-spacing: 0.12em;
                    margin-bottom: 0.35rem; display: block;
                }

                @media (max-width: 480px) {
                    .signup-card { padding: 1.25rem 1.1rem !important; }
                    .signup-btn { height: 44px !important; font-size: 0.82rem !important; }
                    .signup-input { height: 42px !important; font-size: 0.82rem !important; }
                    .signup-header-title { font-size: 1.5rem !important; }
                }
            `}</style>

            {/* Ambient orbs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
                    borderRadius: '50%', filter: 'blur(100px)', opacity: 0.12,
                    background: 'radial-gradient(circle, #3b82f6, transparent)',
                    top: '-10%', left: '-5%', animation: 'float1 12s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
                    borderRadius: '50%', filter: 'blur(90px)', opacity: 0.1,
                    background: 'radial-gradient(circle, #0d9488, transparent)',
                    bottom: '-8%', right: '-5%', animation: 'float2 15s ease-in-out infinite',
                }} />
            </div>

            {/* Dot pattern */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '30px 30px',
            }} />

            {/* Card */}
            <div className="signup-card" style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 24,
                padding: '1.75rem 1.5rem',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                maxHeight: '95dvh', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                        <OtterSmall />
                    </div>
                    <h1 className="signup-header-title" style={{
                        fontSize: '1.75rem', fontWeight: 900, lineHeight: 1, margin: 0,
                        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        Join FloodWay
                    </h1>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 500 }}>
                        Create your account to get started
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '0.65rem 0.9rem', borderRadius: 10, marginBottom: '0.7rem',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {/* Google */}
                <button
                    id="google-signup-btn"
                    className="signup-btn signup-btn-google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    {googleLoading ? <Spinner /> : <GoogleIcon />}
                    Sign up with Google
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', margin: '0.8rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or email</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div>
                        <label className="signup-label">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Ahmad Farid"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="signup-input"
                        />
                    </div>
                    <div>
                        <label className="signup-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="signup-input"
                        />
                    </div>
                    <div>
                        <label className="signup-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="signup-input"
                                style={{ paddingRight: '2.8rem' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', cursor: 'pointer', color: '#64748b',
                                    display: 'flex', padding: 0,
                                }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="signup-label">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                            className="signup-input"
                        />
                    </div>

                    <button
                        type="submit"
                        id="email-signup-btn"
                        className="signup-btn signup-btn-primary"
                        disabled={isLoading}
                        style={{ marginTop: '0.25rem' }}
                    >
                        {loading ? <><Spinner /> Creating account…</> : <><UserPlus size={17} /> Create Account</>}
                    </button>
                </form>

                {/* Sign in link */}
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', fontWeight: 500, marginTop: '1rem', marginBottom: '0.25rem' }}>
                    Already have an account?{' '}
                    <Link to="/" style={{
                        color: '#2dd4bf', fontWeight: 700, textDecoration: 'none',
                        borderBottom: '1px solid rgba(45,212,191,0.3)',
                    }}>
                        Sign in
                    </Link>
                </p>

                <p style={{ textAlign: 'center', fontSize: '0.6rem', color: '#334155', margin: '0.5rem 0 0' }}>
                    Community Project • Kuala Lumpur Region
                </p>
            </div>
        </div>
    );
}
