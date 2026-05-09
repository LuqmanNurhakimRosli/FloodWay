// Sign Up Page — FloodWay · Blue/White/Black · Clean human-centric design
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Waves } from 'lucide-react';

function Spinner() {
    return (
        <svg className="w-[18px] h-[18px] shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

function UnderlineInput({
    id, type = 'text', placeholder, value, onChange, required, disabled, minLength, rightElement
}: {
    id: string; type?: string; placeholder: string; value: string;
    onChange: (v: string) => void; required?: boolean; disabled?: boolean;
    minLength?: number; rightElement?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <input
                id={id} type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                required={required} disabled={disabled} minLength={minLength}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full h-[50px] bg-transparent border-0 border-b text-slate-100 text-[0.88rem] font-medium placeholder:text-slate-600 outline-none pb-2 pr-10 transition-all duration-200"
                style={{ borderBottomColor: focused ? '#1A73E8' : 'rgba(255,255,255,0.12)' }}
            />
            {rightElement && (
                <div className="absolute right-0 top-3">{rightElement}</div>
            )}
        </div>
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
        const { error: err } = await signUp(email, password, name.trim());
        if (err) { setError(err.message); setLoading(false); }
        else navigate('/loading');
    };

    const handleGoogle = async () => {
        setError(''); setGoogleLoading(true);
        const { error: err } = await signInWithGoogle();
        if (err) { setError(err.message); setGoogleLoading(false); }
        else navigate('/loading');
    };

    const busy = loading || googleLoading;

    const eyeBtn = (
        <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer p-0">
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
    );

    return (
        <div className="min-h-dvh bg-[#060C18] flex flex-col items-center justify-center relative overflow-hidden p-5">
            <style>{`
                @keyframes floatA { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(-20px,-30px); } }
                @keyframes floatB { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(25px,20px); } }
                @keyframes cardIn { from{ opacity:0; transform:translateY(28px); } to{ opacity:1; transform:translateY(0); } }
            `}</style>

            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full blur-[120px] opacity-[0.10]"
                    style={{ background: 'radial-gradient(circle, #1A73E8, transparent)', top: '-15%', left: '-10%', animation: 'floatA 14s ease-in-out infinite' }} />
                <div className="absolute w-[40vw] h-[40vw] max-w-[380px] max-h-[380px] rounded-full blur-[100px] opacity-[0.07]"
                    style={{ background: 'radial-gradient(circle, #4A90E2, transparent)', bottom: '-10%', right: '-8%', animation: 'floatB 18s ease-in-out infinite' }} />
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

            {/* Card */}
            <div className="relative z-10 w-full max-w-[400px] max-h-[95dvh] overflow-y-auto"
                style={{ animation: 'cardIn 0.65s cubic-bezier(0.22,1,0.36,1) both' }}>

                {/* Logo */}
                <div className="flex flex-col items-center mb-7">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 0 32px rgba(26,115,232,0.4)' }}>
                        <Waves className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-[1.75rem] font-black text-white tracking-tight leading-none">
                        Create your account
                    </h1>
                    <p className="text-slate-400 text-[0.78rem] mt-1.5 font-medium">
                        AI-powered flood monitoring &amp; early warning
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] font-semibold text-center">
                        {error}
                    </div>
                )}

                {/* Google */}
                <button
                    id="google-signup-btn"
                    onClick={handleGoogle}
                    disabled={busy}
                    className="w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border text-[0.88rem] font-semibold text-white mb-5 transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
                    onMouseEnter={e => { if (!busy) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.20)'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                    {googleLoading ? <Spinner /> : <GoogleIcon />}
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <span className="text-[0.62rem] text-slate-600 font-semibold uppercase tracking-widest">or email</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Full Name</label>
                        <UnderlineInput id="name" placeholder="Ahmad Farid" value={name} onChange={setName} required disabled={busy} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Email Address</label>
                        <UnderlineInput id="email" type="email" placeholder="name@example.com" value={email} onChange={setEmail} required disabled={busy} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</label>
                        <UnderlineInput id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                            value={password} onChange={setPassword} required disabled={busy} minLength={6} rightElement={eyeBtn} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Confirm Password</label>
                        <UnderlineInput id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                            value={confirmPassword} onChange={setConfirmPassword} required disabled={busy} minLength={6} />
                    </div>

                    <button
                        type="submit"
                        id="email-signup-btn"
                        disabled={busy}
                        className="mt-2 w-full h-[52px] rounded-2xl text-[0.88rem] font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 4px 20px rgba(26,115,232,0.3)' }}
                    >
                        {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
                    </button>
                </form>

                {/* Sign in link */}
                <p className="text-center text-[0.82rem] text-slate-500 font-medium mt-5">
                    Already have an account?{' '}
                    <Link to="/" className="font-bold no-underline transition-colors"
                        style={{ color: '#4A90E2', borderBottom: '1px solid rgba(74,144,226,0.35)' }}>
                        Sign in
                    </Link>
                </p>

                <p className="text-center text-[0.60rem] text-slate-700 mt-4">
                    Flood Monitoring &amp; Navigation System · Kuala Lumpur Region
                </p>
            </div>
        </div>
    );
}
