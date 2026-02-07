import type { RiskLevel } from '../types/flood';

interface RiskIndicatorProps {
    riskLevel: RiskLevel;
    probability: number;
    size?: 'sm' | 'md' | 'lg';
}

export function RiskIndicator({ riskLevel, probability, size = 'md' }: RiskIndicatorProps) {
    const getRiskConfig = (level: RiskLevel) => {
        switch (level) {
            case 'safe':
                return {
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/20',
                    borderColor: 'border-emerald-500',
                    label: 'SAFE',
                    icon: '✓',
                };
            case 'warning':
                return {
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500/20',
                    borderColor: 'border-amber-500',
                    label: 'WARNING',
                    icon: '⚠',
                };
            case 'danger':
                return {
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/20',
                    borderColor: 'border-red-500',
                    label: 'DANGER',
                    icon: '⚡',
                };
        }
    };

    const config = getRiskConfig(riskLevel);

    const sizeClasses = {
        sm: 'w-20 h-20 text-sm',
        md: 'w-32 h-32 text-base',
        lg: 'w-40 h-40 text-lg',
    };

    const iconSizes = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-5xl',
    };

    return (
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Outer ring with animated pulse for danger */}
            <div
                className={`absolute inset-0 rounded-full border-4 ${config.borderColor} ${config.bgColor} 
          ${riskLevel === 'danger' ? 'animate-pulse' : ''}`}
            />

            {/* Progress ring */}
            <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-700"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${probability * 2.83} 283`}
                    strokeLinecap="round"
                    className={config.color}
                />
            </svg>

            {/* Center content */}
            <div className="relative z-10 text-center">
                <div className={`${iconSizes[size]} ${config.color}`}>{config.icon}</div>
                <div className={`font-bold ${config.color} mt-1`}>{probability}%</div>
                {size !== 'sm' && (
                    <div className={`text-xs ${config.color} font-medium`}>{config.label}</div>
                )}
            </div>
        </div>
    );
}
