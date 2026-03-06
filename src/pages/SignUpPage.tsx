// Sign Up Page — Tailwind + shadcn/ui with FloodWay branding
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ─── Spinner ─── */
function Spinner() {
    return (
        <svg
            className="w-[18px] h-[18px] shrink-0 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
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
        <div className="min-h-dvh bg-[linear-gradient(160deg,#0B1120_0%,#0F1B2D_40%,#0B1A2A_100%)] flex items-center justify-center relative overflow-hidden font-[system-ui,sans-serif] p-4">

            {/* Ambient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] opacity-[0.12] bg-[radial-gradient(circle,#3b82f6,transparent)] top-[-10%] left-[-5%] animate-[float1_12s_ease-in-out_infinite]" />
                <div className="absolute w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full blur-[90px] opacity-[0.10] bg-[radial-gradient(circle,#0d9488,transparent)] bottom-[-8%] right-[-5%] animate-[float2_15s_ease-in-out_infinite]" />
            </div>

            {/* Dot pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }}
            />

            {/* Keyframe definitions */}
            <style>{`
                @keyframes float1 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(12px,-18px) scale(1.05); } }
                @keyframes float2 { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(-15px,12px) scale(1.08); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Card */}
            <div
                className={cn(
                    'relative z-10 w-full max-w-[420px] max-h-[95dvh] overflow-y-auto',
                    'bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl',
                    'px-6 py-7 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
                    'sm:px-5 sm:py-5',
                )}
                style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
            >
                {/* Header */}
                <div className="text-center mb-5">
                    {/* FloodWay Logo */}
                    <div className="inline-flex items-center justify-center mb-3">
                        <img
                            src="/floodway logo.png"
                            alt="FloodWay Logo"
                            className="w-16 h-16 object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.5)]"
                        />
                    </div>

                    <h1 className="text-[1.75rem] font-black leading-none m-0 bg-[linear-gradient(135deg,#ffffff_0%,#94a3b8_100%)] bg-clip-text text-transparent sm:text-2xl">
                        Join FloodWay
                    </h1>
                    <p className="text-[0.78rem] text-slate-500 mt-1 font-medium">
                        AI-powered flood monitoring &amp; early warning system
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-3 py-2 rounded-xl mb-3 bg-red-500/10 border border-red-500/20 text-red-300 text-[0.78rem] font-semibold text-center">
                        {error}
                    </div>
                )}

                {/* Google Sign Up */}
                <Button
                    id="google-signup-btn"
                    variant="outline"
                    className="w-full h-12 rounded-xl text-[0.85rem] font-bold gap-2.5 bg-white/[0.06] border-white/10 text-slate-200 hover:bg-white/[0.12] hover:border-white/20 hover:-translate-y-px transition-all duration-200 backdrop-blur-md"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    {googleLoading ? <Spinner /> : <GoogleIcon />}
                    Sign up with Google
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[0.62rem] text-slate-600 font-semibold uppercase tracking-widest">or email</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-widest">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Ahmad Farid"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-11 rounded-xl bg-white/[0.05] border-white/10 text-slate-100 text-[0.85rem] font-medium placeholder:text-slate-600 focus-visible:border-teal-400/50 focus-visible:ring-teal-400/10 focus-visible:bg-white/[0.07] transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-widest">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-11 rounded-xl bg-white/[0.05] border-white/10 text-slate-100 text-[0.85rem] font-medium placeholder:text-slate-600 focus-visible:border-teal-400/50 focus-visible:ring-teal-400/10 focus-visible:bg-white/[0.07] transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-widest">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="h-11 rounded-xl bg-white/[0.05] border-white/10 text-slate-100 text-[0.85rem] font-medium placeholder:text-slate-600 pr-11 focus-visible:border-teal-400/50 focus-visible:ring-teal-400/10 focus-visible:bg-white/[0.07] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0 bg-transparent border-none cursor-pointer flex"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-widest">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                            className="h-11 rounded-xl bg-white/[0.05] border-white/10 text-slate-100 text-[0.85rem] font-medium placeholder:text-slate-600 focus-visible:border-teal-400/50 focus-visible:ring-teal-400/10 focus-visible:bg-white/[0.07] transition-all"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        id="email-signup-btn"
                        disabled={isLoading}
                        className="mt-1 h-12 rounded-xl text-[0.85rem] font-bold gap-2 bg-[linear-gradient(135deg,#0d9488_0%,#0891b2_100%)] text-white shadow-[0_4px_20px_rgba(13,148,136,0.3)] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(13,148,136,0.45)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? <><Spinner /> Creating account…</> : <><UserPlus size={17} /> Create Account</>}
                    </Button>
                </form>

                {/* Sign in link */}
                <p className="text-center text-[0.82rem] text-slate-500 font-medium mt-4 mb-1">
                    Already have an account?{' '}
                    <Link
                        to="/"
                        className="text-teal-400 font-bold no-underline border-b border-teal-400/30 hover:text-teal-300 hover:border-teal-300/50 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>

                <p className="text-center text-[0.6rem] text-slate-700 mt-2">
                    Flood Monitoring &amp; Navigation System • Kuala Lumpur Region
                </p>
            </div>
        </div>
    );
}
