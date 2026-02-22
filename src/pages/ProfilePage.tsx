// Profile / Settings Page — editable user profile with Firebase Auth
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Save, User, Mail, LogOut, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
    const { user, logOut, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Sync if user changes
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess(false);
        setProfileLoading(true);

        const { error: nameErr } = await updateUserProfile({ displayName: displayName.trim() });
        if (nameErr) {
            setProfileError(nameErr.message);
            setProfileLoading(false);
            return;
        }

        if (email !== user?.email) {
            const { error: emailErr } = await updateUserEmail(email);
            if (emailErr) {
                setProfileError(emailErr.message);
                setProfileLoading(false);
                return;
            }
        }

        setProfileLoading(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }

        setPasswordLoading(true);
        const { error: pwErr } = await updateUserPassword(newPassword);
        if (pwErr) {
            setPasswordError(pwErr.message);
        } else {
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        }
        setPasswordLoading(false);
    };

    const handleLogOut = async () => {
        await logOut();
        navigate('/');
    };

    // Avatar initials or photo
    const getInitials = () => {
        const name = user?.displayName || user?.email || '?';
        return name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() || '')
            .join('');
    };

    const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

    return (
        <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24 md:pb-10">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl text-white hover:bg-white/10"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <div>
                    <h1 className="text-base font-bold text-white">Profile & Settings</h1>
                    <p className="text-xs text-slate-400">Manage your account</p>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
                {/* Avatar Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 mb-4 shadow-xl"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-black text-white mb-4 shadow-xl shadow-blue-500/30 border border-white/10">
                            {getInitials()}
                        </div>
                    )}
                    <h2 className="text-lg font-bold text-white">{user?.displayName || 'FloodWay User'}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                    {isGoogleUser && (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Account
                        </span>
                    )}
                </div>

                {/* Edit Profile */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <User className="size-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white text-sm">Account Info</h3>
                    </div>

                    {profileError && (
                        <Alert variant="destructive" className="mb-4 border-red-500/30 bg-red-500/10 text-red-400">
                            <AlertDescription className="text-sm">{profileError}</AlertDescription>
                        </Alert>
                    )}
                    {profileSuccess && (
                        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                            <CheckCircle2 className="size-4" /> Profile updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="profileName" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Display Name</Label>
                            <Input
                                id="profileName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                disabled={profileLoading}
                                className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="profileEmail" className="text-slate-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                <Mail className="size-3" /> Email
                                {isGoogleUser && <span className="text-slate-500 normal-case font-normal">(managed by Google)</span>}
                            </Label>
                            <Input
                                id="profileEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={profileLoading || isGoogleUser}
                                className={cn(
                                    "h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-blue-500/50 transition-all",
                                    isGoogleUser && "opacity-50 cursor-not-allowed"
                                )}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
                            disabled={profileLoading}
                        >
                            {profileLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Save Changes</>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Change Password (only for email users) */}
                {!isGoogleUser && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Shield className="size-4 text-purple-400" />
                            </div>
                            <h3 className="font-bold text-white text-sm">Change Password</h3>
                        </div>

                        {passwordError && (
                            <Alert variant="destructive" className="mb-4 border-red-500/30 bg-red-500/10 text-red-400">
                                <AlertDescription className="text-sm">{passwordError}</AlertDescription>
                            </Alert>
                        )}
                        {passwordSuccess && (
                            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                                <CheckCircle2 className="size-4" /> Password updated!
                            </div>
                        )}

                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={passwordLoading}
                                        minLength={6}
                                        className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-purple-500/50 pr-10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPw" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Confirm Password</Label>
                                <Input
                                    id="confirmPw"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={passwordLoading}
                                    minLength={6}
                                    className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-purple-500/50 transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all text-sm"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                                ) : (
                                    <><Shield className="mr-2 h-4 w-4" />Update Password</>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Sign Out */}
                <div className="bg-white/5 border border-red-500/10 rounded-2xl p-5">
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                        <LogOut className="size-4 text-red-400" /> Sign Out
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">You'll be redirected to the login screen.</p>
                    <Button
                        variant="outline"
                        className="w-full h-10 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl font-semibold transition-all text-sm"
                        onClick={handleLogOut}
                        id="signout-btn"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
