import { useRef, useEffect } from 'react';
import { useApp } from '../store';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Flood phase types
export type FloodPhase = 'before' | 'during' | 'after';

interface FloodTimelineScrubberProps {
    selectedHourIndex: number;
    onHourChange: (index: number) => void;
}

export function FloodTimelineScrubber({ selectedHourIndex, onHourChange }: FloodTimelineScrubberProps) {
    const { prediction } = useApp();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to selected hour on change
    useEffect(() => {
        if (scrollRef.current) {
            const item = scrollRef.current.children[selectedHourIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedHourIndex]);

    if (!prediction) return null;

    const hours = prediction.hourlyPredictions;
    const currentPhase = getFloodPhaseForHour(selectedHourIndex, hours);
    const selectedHour = hours[selectedHourIndex];

    const phaseConfig = {
        before: {
            label: 'Before Flood',
            emoji: '🌤️',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/40',
            glow: 'shadow-emerald-500/20',
            description: 'Area is currently safe'
        },
        during: {
            label: 'Flood Active',
            emoji: '🌊',
            color: 'text-red-400',
            bg: 'bg-red-500/20',
            border: 'border-red-500/40',
            glow: 'shadow-red-500/20',
            description: 'Flooding in progress'
        },
        after: {
            label: 'After Flood',
            emoji: '🌈',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/40',
            glow: 'shadow-blue-500/20',
            description: 'Water receding'
        }
    };

    const config = phaseConfig[currentPhase];

    const handlePrev = () => {
        if (selectedHourIndex > 0) onHourChange(selectedHourIndex - 1);
    };

    const handleNext = () => {
        if (selectedHourIndex < hours.length - 1) onHourChange(selectedHourIndex + 1);
    };

    return (
        <div className="flex flex-col gap-2 pointer-events-auto w-full">
            {/* Phase indicator badge */}
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-500",
                config.bg, config.border, `shadow-lg ${config.glow}`
            )}>
                <span className="text-base">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                    <div className={cn("text-xs font-bold", config.color)}>{config.label}</div>
                    <div className="text-[9px] text-white/60">{config.description}</div>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                    <Clock className="size-3" />
                    <span className="text-[11px] font-semibold">{selectedHour?.time || '--:--'}</span>
                </div>
                {selectedHour && (
                    <div className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        selectedHour.riskLevel === 'danger' ? 'bg-red-500/30 text-red-300' :
                            selectedHour.riskLevel === 'warning' ? 'bg-amber-500/30 text-amber-300' :
                                'bg-emerald-500/30 text-emerald-300'
                    )}>
                        {selectedHour.probability}%
                    </div>
                )}
            </div>

            {/* Timeline scrubber */}
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                {/* Arrow buttons */}
                <button
                    onClick={handlePrev}
                    disabled={selectedHourIndex === 0}
                    className="absolute left-0 top-0 bottom-0 w-7 z-10 flex items-center justify-center bg-gradient-to-r from-slate-900/95 to-transparent disabled:opacity-30 transition-opacity"
                >
                    <ChevronLeft className="size-3.5 text-white/80" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={selectedHourIndex === hours.length - 1}
                    className="absolute right-0 top-0 bottom-0 w-7 z-10 flex items-center justify-center bg-gradient-to-l from-slate-900/95 to-transparent disabled:opacity-30 transition-opacity"
                >
                    <ChevronRight className="size-3.5 text-white/80" />
                </button>

                {/* Scrollable timeline */}
                <div
                    ref={scrollRef}
                    className="flex gap-0 overflow-x-auto scrollbar-hide px-7 py-2.5"
                >
                    {hours.map((hour, index) => {
                        const phase = getFloodPhaseForHour(index, hours);
                        const isSelected = index === selectedHourIndex;
                        const isCurrent = index === 0;

                        // Bar color based on risk
                        const barColor = hour.riskLevel === 'danger' ? 'bg-red-500'
                            : hour.riskLevel === 'warning' ? 'bg-amber-400'
                                : 'bg-emerald-400';

                        // Phase separator line
                        const nextPhase = index < hours.length - 1 ? getFloodPhaseForHour(index + 1, hours) : phase;
                        const isPhaseTransition = nextPhase !== phase;

                        return (
                            <button
                                key={index}
                                onClick={() => onHourChange(index)}
                                className={cn(
                                    "shrink-0 flex flex-col items-center gap-1 min-w-[28px] md:min-w-[32px] py-1 rounded-lg transition-all duration-200 relative",
                                    isSelected
                                        ? "bg-white/10 scale-110"
                                        : "hover:bg-white/5",
                                )}
                            >
                                {/* Current time indicator */}
                                {isCurrent && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                                )}

                                {/* Risk bar */}
                                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-white/10 rounded-full flex items-end overflow-hidden">
                                    <div
                                        className={cn(
                                            "w-full rounded-full transition-all duration-500",
                                            barColor,
                                            isSelected ? 'opacity-100' : 'opacity-70'
                                        )}
                                        style={{ height: `${Math.max(hour.probability, 5)}%` }}
                                    />
                                </div>

                                {/* Time label */}
                                <span className={cn(
                                    "text-[7px] md:text-[8px] font-medium transition-all",
                                    isSelected ? 'text-white font-bold' : 'text-white/50'
                                )}>
                                    {hour.time.split(':')[0]}
                                </span>

                                {/* Phase dot */}
                                <div className={cn(
                                    "w-1 h-1 rounded-full transition-all",
                                    phase === 'during' ? 'bg-red-400' :
                                        phase === 'after' ? 'bg-blue-400' :
                                            'bg-emerald-400',
                                    isSelected ? 'scale-150' : 'scale-100'
                                )} />

                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-primary" />
                                )}

                                {/* Phase transition line */}
                                {isPhaseTransition && (
                                    <div className="absolute right-0 top-1 bottom-1 w-px bg-white/20" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Phase labels below */}
                <div className="flex items-center justify-center gap-4 px-3 pb-2 pt-0">
                    {(['before', 'during', 'after'] as const).map((phase) => (
                        <div key={phase} className="flex items-center gap-1">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                phase === 'during' ? 'bg-red-400' :
                                    phase === 'after' ? 'bg-blue-400' :
                                        'bg-emerald-400'
                            )} />
                            <span className={cn(
                                "text-[7px] uppercase tracking-wider font-medium",
                                currentPhase === phase ? 'text-white/80' : 'text-white/30'
                            )}>
                                {phase === 'before' ? 'Before' : phase === 'during' ? 'Flood' : 'After'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Export helper to get phase for external use (e.g., FloodZoneLayer)
export function getFloodPhaseForHour(
    hourIndex: number,
    hourlyPredictions: { riskLevel: string }[]
): FloodPhase {
    const floodStartIndex = hourlyPredictions.findIndex(
        h => h.riskLevel === 'danger' || h.riskLevel === 'warning'
    );
    let floodEndIndex = -1;

    if (floodStartIndex >= 0) {
        for (let i = hourlyPredictions.length - 1; i >= 0; i--) {
            if (hourlyPredictions[i].riskLevel === 'danger' || hourlyPredictions[i].riskLevel === 'warning') {
                floodEndIndex = i;
                break;
            }
        }
    }

    if (floodStartIndex < 0) return 'before';
    if (hourIndex < floodStartIndex) return 'before';
    if (hourIndex > floodEndIndex) return 'after';
    return 'during';
}
