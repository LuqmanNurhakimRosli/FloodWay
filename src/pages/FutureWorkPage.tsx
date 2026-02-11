// Future Work Page - Placeholder for features under development
import { useLocation } from 'react-router-dom';
import { MapPin, MessageCircle, Construction, Sparkles, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const featureData: Record<string, {
    icon: typeof MapPin;
    title: string;
    subtitle: string;
    description: string;
    gradient: string;
    shadowColor: string;
    features: { emoji: string; text: string }[];
}> = {
    '/reports': {
        icon: MapPin,
        title: 'Crowd-Source Reports',
        subtitle: 'Waze for Floods',
        description: 'Pin real-time flood conditions on the map. Report flooded roads, clear routes, and help your community stay safe.',
        gradient: 'from-purple-500 to-violet-600',
        shadowColor: 'shadow-purple-500/30',
        features: [
            { emoji: '🌊', text: 'Report flooded roads & areas' },
            { emoji: '✅', text: 'Mark roads as clear & safe' },
            { emoji: '⚠️', text: 'Warn about rising water levels' },
            { emoji: '🚧', text: 'Report road blockages' },
            { emoji: '🆘', text: 'Send SOS for emergency help' },
            { emoji: '📷', text: 'Share photos of conditions' },
        ]
    },
    '/chat': {
        icon: MessageCircle,
        title: 'Community Chat',
        subtitle: '2km Radius Messaging',
        description: 'Chat with people nearby during emergencies. Share real-time updates, coordinate evacuations, and help your neighbors.',
        gradient: 'from-orange-500 to-amber-600',
        shadowColor: 'shadow-orange-500/30',
        features: [
            { emoji: '💬', text: 'Chat with people within 2km' },
            { emoji: '📍', text: 'Share your exact location' },
            { emoji: '🆘', text: 'Broadcast SOS to nearby users' },
            { emoji: '📷', text: 'Share flood condition photos' },
            { emoji: '👥', text: 'See active users nearby' },
            { emoji: '🏥', text: 'Get shelter capacity updates' },
        ]
    }
};

export function FutureWorkPage() {
    const location = useLocation();
    const data = featureData[location.pathname] || featureData['/reports'];
    const Icon = data.icon;

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pb-24">
            {/* Header */}
            <header className="px-6 pt-[calc(2rem+var(--safe-top))] pb-6 text-center">
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-3xl blur-xl" style={{
                        background: location.pathname === '/reports'
                            ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                            : 'linear-gradient(135deg, #f97316, #f59e0b)'
                    }} />
                    <div className={cn(
                        "relative w-full h-full bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-xl",
                        data.gradient, data.shadowColor
                    )}>
                        <Icon className="size-9 text-white" />
                    </div>
                </div>

                <Badge className="mb-3 bg-white/10 text-white border-0 px-3 py-1">
                    <Construction className="size-3 mr-1.5" />
                    Under Development
                </Badge>

                <h1 className="text-2xl font-bold text-white mb-1">{data.title}</h1>
                <p className="text-blue-400 text-sm font-medium">{data.subtitle}</p>
            </header>

            <main className="flex-1 px-5 overflow-y-auto">
                {/* Description */}
                <Card className="bg-white/5 border-white/10 mb-5">
                    <CardContent className="p-5">
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {data.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Planned Features */}
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="size-4 text-amber-400" />
                        Planned Features
                    </h3>
                    <div className="space-y-2">
                        {data.features.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <span className="text-xl">{feature.emoji}</span>
                                <span className="text-sm text-slate-300">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="size-10 flex items-center justify-center bg-blue-500/20 rounded-xl shrink-0">
                                <Clock className="size-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">Future Work</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    This feature is planned for a future update. Stay tuned for when it becomes available as part of the FloodWay community project.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
