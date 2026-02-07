import type { RiskLevel } from '../types/flood';

interface AlertCardProps {
    riskLevel: RiskLevel;
    nextDangerTime?: string;
}

export function AlertCard({ riskLevel, nextDangerTime }: AlertCardProps) {
    const getAlertConfig = (level: RiskLevel) => {
        switch (level) {
            case 'safe':
                return {
                    bg: 'from-emerald-600/20 to-emerald-800/20',
                    border: 'border-emerald-500/50',
                    icon: '✅',
                    title: 'All Clear',
                    message: 'No flood warnings for your area. Conditions are stable.',
                    actions: ['Stay informed', 'Check back later'],
                };
            case 'warning':
                return {
                    bg: 'from-amber-600/20 to-amber-800/20',
                    border: 'border-amber-500/50',
                    icon: '⚠️',
                    title: 'Flood Watch',
                    message: 'Elevated water levels detected. Monitor conditions closely.',
                    actions: ['Prepare emergency kit', 'Stay alert for updates', 'Avoid flood-prone areas'],
                };
            case 'danger':
                return {
                    bg: 'from-red-600/20 to-red-800/20',
                    border: 'border-red-500/50',
                    icon: '🚨',
                    title: 'Flood Warning',
                    message: 'High flood risk! Take immediate precautions.',
                    actions: ['Move to higher ground', 'Secure valuables', 'Follow evacuation orders'],
                };
        }
    };

    const config = getAlertConfig(riskLevel);

    return (
        <div className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} p-6 backdrop-blur-sm`}>
            <div className="flex items-start gap-4">
                <div className="text-4xl">{config.icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{config.title}</h3>
                    <p className="text-gray-300 mb-4">{config.message}</p>

                    {nextDangerTime && riskLevel !== 'safe' && (
                        <div className="mb-4 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                            <p className="text-sm text-gray-400">Expected peak flood risk:</p>
                            <p className="text-lg font-semibold text-white">{nextDangerTime}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                            {config.actions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-200">
                                    <span className="text-emerald-400">•</span>
                                    {action}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
