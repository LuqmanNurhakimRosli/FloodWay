// UserAvatar — top-right avatar with dropdown menu for profile/settings/logout
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export function UserAvatar() {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = () => {
        const name = user?.displayName || user?.email || '?';
        return name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() || '')
            .join('');
    };

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

    const handleLogOut = async () => {
        setOpen(false);
        await logOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar trigger button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-all group"
                aria-label="User menu"
                id="user-avatar-btn"
            >
                {/* Avatar */}
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={displayName}
                        className="size-8 rounded-lg object-cover border border-white/15 shadow-md"
                    />
                ) : (
                    <div className="size-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-black text-white border border-white/10 shadow-md shadow-blue-500/20">
                        {getInitials()}
                    </div>
                )}
                {/* Name (hidden on mobile to save space) */}
                <span className="hidden sm:block text-xs font-semibold text-white/80 group-hover:text-white transition-colors max-w-[80px] truncate">
                    {displayName}
                </span>
                <ChevronDown className={`hidden sm:block size-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute top-full right-0 mt-2 w-52 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-xs font-bold text-white truncate">{user.displayName || 'FloodWay User'}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                            <button
                                onClick={() => { setOpen(false); navigate('/profile'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-all text-left group"
                                id="profile-menu-item"
                            >
                                <div className="size-7 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                                    <User className="size-3.5 text-blue-400" />
                                </div>
                                <span className="font-medium text-xs">View Profile</span>
                            </button>

                            <button
                                onClick={() => { setOpen(false); navigate('/profile'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-all text-left group"
                                id="settings-menu-item"
                            >
                                <div className="size-7 rounded-lg bg-slate-500/15 flex items-center justify-center group-hover:bg-slate-500/25 transition-colors">
                                    <Settings className="size-3.5 text-slate-400" />
                                </div>
                                <span className="font-medium text-xs">Settings</span>
                            </button>
                        </div>

                        {/* Divider + Sign Out */}
                        <div className="p-1.5 border-t border-white/5">
                            <button
                                onClick={handleLogOut}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left group"
                                id="signout-menu-item"
                            >
                                <div className="size-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                    <LogOut className="size-3.5 text-red-400" />
                                </div>
                                <span className="font-medium text-xs">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
