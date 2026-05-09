// Bottom Navigation — Light theme, blue accent on active
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, MapPin, User, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
    { path: '/home',       icon: Home,      label: 'Home'     },
    { path: '/shelters',   icon: Building2, label: 'Shelter'  },
    { path: '/reports',    icon: MapPin,    label: 'Reports'  },
    { path: '/simulation', icon: Waves,     label: 'Simulate' },
    { path: '/profile',    icon: User,      label: 'Profile'  },
];

export function BottomNav() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user }  = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t"
            style={{
                background: 'rgba(249,250,251,0.97)',
                borderTopColor: '#C7D0DA',
                backdropFilter: 'blur(20px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}>
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive  = location.pathname === tab.path;
                    const isProfile = tab.path === '/profile';

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative transition-all duration-200',
                                isActive ? 'text-slate-900' : 'text-slate-400'
                            )}
                            aria-label={tab.label}
                        >
                            {/* Active indicator line */}
                            {isActive && (
                                <div className="absolute -top-px w-10 h-[2px] rounded-full" style={{ background: '#7FB8E6' }} />
                            )}

                            {/* Icon container */}
                            <div className={cn(
                                'relative p-1.5 rounded-xl transition-all duration-200',
                            )} style={isActive ? { background: '#E3F4FF' } : {}}>
                                {isProfile && user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className={cn(
                                            'size-5 rounded-md object-cover transition-all',
                                            isActive && 'ring-1 ring-blue-500 scale-110'
                                        )}
                                    />
                                ) : (
                                    <tab.icon
                                        className={cn('size-5 transition-all', isActive && 'scale-110')}
                                        style={{ color: isActive ? '#7FB8E6' : undefined }}
                                    />
                                )}

                                {/* Online dot for profile */}
                                {isProfile && isActive && !user?.photoURL && (
                                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-blue-600 border border-white" />
                                )}
                            </div>

                            <span
                                className="text-[10px] font-semibold truncate transition-all"
                                style={{ color: isActive ? '#7FB8E6' : '#94a3b8' }}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
