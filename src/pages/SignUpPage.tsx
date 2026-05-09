// Sign Up Page — FloodWay · Floating Card Layout
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function RoundedInput({
    id, type = 'text', placeholder, label, value, onChange, required, disabled, minLength, rightElement
}: {
    id: string; type?: string; placeholder: string; label: string; value: string;
    onChange: (v: string) => void; required?: boolean; disabled?: boolean;
    minLength?: number; rightElement?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <div className="relative">
                <input
                    id={id} type={type} placeholder={placeholder} value={value}
                    onChange={e => onChange(e.target.value)}
                    required={required} disabled={disabled} minLength={minLength}
                    className="w-full h-14 bg-[#F1F5F9] border-none rounded-2xl px-6 text-[#111827] font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                />
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
                )}
            </div>
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
        if (name.trim().length < 2) { setError('Please enter your full name.'); return; }
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
            className="text-slate-300 hover:text-slate-500 transition-colors bg-transparent border-none cursor-pointer p-0">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    );

    return (
        <div className="min-h-dvh bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden p-6">
            <style>{`
                @keyframes cardFloat { from{ opacity:0; transform:translateY(30px); } to{ opacity:1; transform:translateY(0); } }
                .auth-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 50dvh;
                    background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%);
                    z-index: 0;
                }
                .auth-wave {
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    line-height: 0;
                    fill: #F8FAFC;
                }
                .auth-card {
                    background: white;
                    border-radius: 32px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.08);
                    width: 100%;
                    max-width: 440px;
                    padding: 40px;
                    position: relative;
                    z-index: 10;
                    animation: cardFloat 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
                    max-height: 95dvh;
                    overflow-y: auto;
                }
                .auth-card::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Bottom Layer: Background & Wave */}
            <div className="auth-bg">
                <div className="auth-wave">
                    <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,202.7C960,203,1056,149,1152,122.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* Top Layer: Floating Card */}
            <div className="auth-card scrollbar-hide">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 8px 32px rgba(26,115,232,0.2)' }}>
                        <Waves className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-[#111827] text-2xl font-black tracking-tight">Create Account</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Join the FloodWay network today</p>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-500 text-xs font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <RoundedInput id="name" label="Full Name" placeholder="Ahmad Farid" value={name} onChange={setName} required disabled={busy} />
                    <RoundedInput id="email" label="Email Address" type="email" placeholder="name@example.com" value={email} onChange={setEmail} required disabled={busy} />
                    <RoundedInput id="password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                        value={password} onChange={setPassword} required disabled={busy} minLength={6} rightElement={eyeBtn} />
                    <RoundedInput id="confirmPassword" label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                        value={confirmPassword} onChange={setConfirmPassword} required disabled={busy} minLength={6} />

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full h-14 rounded-2xl text-[1rem] font-bold text-white transition-all duration-300 mt-2"
                        style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)', boxShadow: '0 8px 25px rgba(26,115,232,0.25)' }}
                    >
                        {loading ? <Spinner /> : 'Create Account'}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[0.65rem] text-slate-300 font-bold uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={busy}
                    className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-50 text-[0.92rem] font-bold text-slate-600 mb-6 transition-all hover:bg-slate-50"
                >
                    {googleLoading ? <Spinner /> : <GoogleIcon />}
                    Continue with Google
                </button>

                <p className="text-center text-sm text-slate-400 font-medium">
                    Already have an account?{' '}
                    <button type="button" onClick={() => navigate('/')} className="font-bold text-[#1A73E8] hover:underline">
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}
