// Bottom Navigation - Mobile bottom tab bar with user profile tab
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/shelters', icon: Building2, label: 'Shelter' },
    { path: '/reports', icon: MapPin, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 pb-[var(--safe-bottom,0px)]">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const isProfile = tab.path === '/profile';

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-all duration-300',
                                isActive ? 'text-blue-400' : 'text-slate-500'
                            )}
                            aria-label={tab.label}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div className="absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
                            )}

                            {/* Icon container */}
                            <div className={cn(
                                'relative p-1.5 rounded-xl transition-all duration-300',
                                isActive && 'bg-blue-500/15'
                            )}>
                                {/* Profile tab: show user photo if available */}
                                {isProfile && user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className={cn(
                                            'size-5 rounded-md object-cover transition-all duration-300',
                                            isActive && 'ring-1 ring-blue-400 scale-110'
                                        )}
                                    />
                                ) : (
                                    <tab.icon className={cn(
                                        'size-5 transition-all duration-300',
                                        isActive && 'scale-110'
                                    )} />
                                )}

                                {/* Active dot for profile when no photo */}
                                {isProfile && isActive && !user?.photoURL && (
                                    <span className="absolute -top-0.5 -right-0.5 size-2 bg-blue-400 rounded-full border border-slate-900" />
                                )}
                            </div>

                            <span className={cn(
                                'text-[10px] font-medium transition-all truncate',
                                isActive ? 'text-blue-400' : 'text-slate-500'
                            )}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
