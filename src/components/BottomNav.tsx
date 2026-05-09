// Bottom Navigation — Blue/White/Black theme
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, MapPin, User, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/shelters', icon: Building2, label: 'Shelter' },
    { path: '/reports', icon: MapPin, label: 'Reports' },
    { path: '/simulation', icon: Waves, label: 'Simulate' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t pb-[var(--safe-bottom,0px)]"
            style={{
                background: 'rgba(6, 12, 24, 0.97)',
                backdropFilter: 'blur(24px)',
                borderTopColor: 'rgba(26, 115, 232, 0.12)',
            }}
        >
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const isProfile = tab.path === '/profile';

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative transition-all duration-250',
                                isActive ? 'text-white' : 'text-slate-600'
                            )}
                            aria-label={tab.label}
                        >
                            {/* Active indicator line at top */}
                            {isActive && (
                                <div
                                    className="absolute -top-px w-10 h-[2px] rounded-full"
                                    style={{ background: 'linear-gradient(90deg, #1A73E8, #4A90E2)' }}
                                />
                            )}

                            {/* Icon container */}
                            <div className={cn(
                                'relative p-1.5 rounded-xl transition-all duration-250',
                                isActive && 'bg-blue-600/15'
                            )}>
                                {isProfile && user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className={cn(
                                            'size-5 rounded-md object-cover transition-all duration-250',
                                            isActive && 'ring-1 ring-blue-400 scale-110'
                                        )}
                                    />
                                ) : (
                                    <tab.icon className={cn(
                                        'size-5 transition-all duration-250',
                                        isActive && 'scale-110'
                                    )} style={{ color: isActive ? '#4A90E2' : undefined }} />
                                )}

                                {/* Dot for profile without photo */}
                                {isProfile && isActive && !user?.photoURL && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 size-2 rounded-full border border-[#060C18]"
                                        style={{ background: '#1A73E8' }}
                                    />
                                )}
                            </div>

                            <span className={cn(
                                'text-[10px] font-semibold truncate transition-all',
                                isActive ? 'text-blue-400' : 'text-slate-600'
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
