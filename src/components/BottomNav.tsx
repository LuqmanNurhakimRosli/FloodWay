// Bottom Navigation - Mobile bottom tab bar
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, MapPin, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/shelters', icon: Building2, label: 'Shelter' },
    { path: '/reports', icon: MapPin, label: 'Reports' },
    // { path: '/chat', icon: MessageCircle, label: 'Chat' },
    // { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 pb-[var(--safe-bottom)]">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path ||
                        (tab.path === '/home' && location.pathname === '/forecast');
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-all duration-300",
                                isActive ? "text-blue-400" : "text-slate-500"
                            )}
                        >
                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -top-0.5 w-8 h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
                            )}
                            <div className={cn(
                                "relative p-1.5 rounded-xl transition-all duration-300",
                                isActive && "bg-blue-500/15"
                            )}>
                                <Icon className={cn(
                                    "size-5 transition-all duration-300",
                                    isActive && "scale-110"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-all",
                                isActive ? "text-blue-400" : "text-slate-500"
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
