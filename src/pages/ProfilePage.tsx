// Profile Page — FloodWay · Blue/White/Black · Clean premium design
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, User, Shield, LogOut, Lock, Check, AlertCircle,
    Mail, Waves, ChevronRight
} from 'lucide-react';

// ── Arctic Dawn palette constants ────────────────────────────────────────────
const AD_BG        = '#F9FAFB';   // Off-White / Snow
const AD_CARD      = '#E3F4FF';   // Pale Arctic Blue (surfaces)
const AD_MID       = '#7FB8E6';   // Mid-Blue (primary accent)
const AD_SKY       = '#B6DDFF';   // Sky Blue (secondary accent)
const AD_BORDER    = '#C7D0DA';   // Cool Gray (2D borders)
const AD_TEXT      = '#0f172a';   // Deep slate
const AD_MUTED     = '#64748b';   // Muted slate

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: AD_CARD, border: `1px solid ${AD_BORDER}` }}>
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b" style={{ borderBottomColor: AD_BORDER }}>
                <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: AD_BG, border: `1px solid ${AD_BORDER}` }}>
                    {icon}
                </div>
                <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            </div>
            <div className="p-4 flex flex-col gap-3">{children}</div>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text', placeholder, disabled }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: AD_MUTED }}>{label}</label>
            <input
                type={type} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)} disabled={disabled}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-600 outline-none transition-all"
                style={{
                    background: AD_BG,
                    border: `1px solid ${focused ? AD_MID : AD_BORDER}`,
                    boxShadow: focused ? `0 0 0 3px ${AD_SKY}` : 'none',
                }} />
        </div>
    );
}

export function ProfilePage() {
    const { user, logOut, updateUserProfile, updateUserPassword, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [profileSaving, setProfileSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [pwMsg, setPwMsg] = useState('');

    const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

    const getInitials = () =>
        (user?.displayName || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleProfileSave = async () => {
        setProfileMsg(''); setProfileSaving(true);
        const { error } = await updateUserProfile({ displayName: displayName.trim() });
        if (error) setProfileMsg(error.message);
        else setProfileMsg('✓ Profile updated successfully');
        setProfileSaving(false);
        setTimeout(() => setProfileMsg(''), 3000);
    };

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword !== confirmPassword) { setPwMsg('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setPwMsg('Password must be at least 6 characters.'); return; }
        setPwMsg(''); setPwSaving(true);
        const { error } = await updateUserPassword(newPassword);
        if (error) setPwMsg(error.message);
        else { setPwMsg('✓ Password updated!'); setNewPassword(''); setConfirmPassword(''); }
        setPwSaving(false);
        setTimeout(() => setPwMsg(''), 4000);
    };

    const handleSignOut = async () => {
        try {
            await logOut();
            navigate('/');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="min-h-dvh pb-28" style={{ background: AD_BG }}>
            {/* Subtle bg */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: AD_BG }} />

            {/* Header */}
            <header className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3" style={{ background: AD_BG, borderBottom: `1px solid ${AD_BORDER}` }}>
                <button onClick={() => navigate('/home')}
                    className="size-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: AD_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <ArrowLeft className="size-4 text-slate-500" />
                </button>
                <Waves className="size-5" style={{ color: AD_MID }} />
                <h1 className="text-base font-black text-slate-900">My Profile</h1>
            </header>

            <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-4 relative z-10">

                {/* Avatar Card */}
                <div className="flex flex-col items-center text-center p-6 rounded-3xl relative overflow-hidden"
                    style={{ background: AD_CARD, border: `1px solid ${AD_BORDER}` }}>
                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
                        style={{ background: AD_SKY }} />
                    <div className="relative mb-4">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile"
                                className="w-24 h-24 rounded-3xl object-cover ring-2 ring-blue-500/30 shadow-xl" />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-slate-900 ring-2 ring-blue-500/30 shadow-xl"
                                style={{ background: AD_MID, boxShadow: `0 8px 32px ${AD_SKY}` }}>
                                {getInitials()}
                            </div>
                        )}
                        {isGoogleUser && (
                            <div className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(10,20,40,0.95)', border: '2px solid rgba(26,115,232,0.30)' }}>
                                <svg viewBox="0 0 24 24" className="size-4">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-black text-slate-900">
                        {user?.displayName || 'FloodWay User'}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <Mail className="size-3" />
                        {user?.email}
                    </div>

                    <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(26,115,232,0.12)', border: '1px solid rgba(26,115,232,0.25)', color: '#4A90E2' }}>
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        Community Member · KL Region
                    </div>
                </div>

                {/* Edit Profile */}
                <Section title="Edit Profile" icon={<User className="size-3.5" style={{ color: '#4A90E2' }} />}>
                    <InputField label="Display Name" value={displayName}
                        onChange={setDisplayName} placeholder="Ahmad Farid" />
                    <InputField label="Email" value={user?.email || ''} onChange={() => { }}
                        type="email" disabled />
                    {profileMsg && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${profileMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}
                            style={{ background: profileMsg.startsWith('✓') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${profileMsg.startsWith('✓') ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)'}` }}>
                            {profileMsg.startsWith('✓') ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
                            {profileMsg}
                        </div>
                    )}
                    <button onClick={handleProfileSave} disabled={profileSaving}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: AD_MID, boxShadow: '0 4px 14px rgba(26,115,232,0.25)' }}>
                        {profileSaving ? <><Spinner />Saving…</> : 'Save Changes'}
                    </button>
                </Section>

                {/* Change Password */}
                {!isGoogleUser && (
                    <Section title="Change Password" icon={<Lock className="size-3.5 text-purple-600" />}>
                        <InputField label="New Password" value={newPassword} onChange={setNewPassword}
                            type="password" placeholder="Min. 6 characters" />
                        <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword}
                            type="password" placeholder="Repeat new password" />
                        {pwMsg && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${pwMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}
                                style={{ background: pwMsg.startsWith('✓') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${pwMsg.startsWith('✓') ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)'}` }}>
                                {pwMsg.startsWith('✓') ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
                                {pwMsg}
                            </div>
                        )}
                        <button onClick={handlePasswordChange} disabled={pwSaving}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#8B5CF6' }}>
                            {pwSaving ? <><Spinner />Updating…</> : <><Shield className="size-4" />Update Password</>}
                        </button>
                    </Section>
                )}

                {/* Link Google */}
                {!isGoogleUser && (
                    <Section title="Linked Accounts" icon={<Shield className="size-3.5 text-sky-600" />}>
                        <button onClick={() => signInWithGoogle()}
                            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl transition-all"
                            style={{ background: AD_BG, border: `1px solid ${AD_BORDER}` }}>
                            <svg viewBox="0 0 24 24" className="size-5 shrink-0">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="flex-1 text-sm font-semibold text-slate-700 text-left">Link Google Account</span>
                            <ChevronRight className="size-4 text-slate-400" />
                        </button>
                    </Section>
                )}

                {/* Sign Out Card */}
                <div className="rounded-3xl p-5 mt-2" style={{ background: '#FFF5F5', border: '1px solid #FED7D7' }}>
                    <button onClick={handleSignOut}
                        className="flex items-center gap-4 w-full py-3.5 px-5 rounded-2xl transition-all hover:bg-red-100/50 active:scale-[0.98] shadow-sm"
                        style={{ background: 'white', border: '1px solid #FEB2B2' }}>
                        <div className="size-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100">
                            <LogOut className="size-5 text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="block text-base font-bold text-red-600">Sign Out</span>
                            <span className="block text-[10px] text-red-400 font-medium">Securely end your session</span>
                        </div>
                        <ChevronRight className="size-5 text-red-300" />
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-2">
                    FloodWay v2.0 · Kuala Lumpur Region · FYP 2025
                </p>
            </div>
        </div>
    );
}
