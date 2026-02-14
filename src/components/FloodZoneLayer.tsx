import { useMemo } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { useApp } from '../store';
import { FLOOD_ZONES } from '../data/floodZones';
import { getFloodPhaseForHour, type FloodPhase } from './FloodTimelineScrubber';

interface FloodZoneLayerProps {
    selectedHourIndex?: number;
}

export function FloodZoneLayer({ selectedHourIndex = 0 }: FloodZoneLayerProps) {
    const { prediction } = useApp();

    const activeZones = useMemo(() => {
        if (!prediction) return [];

        const hours = prediction.hourlyPredictions;
        const hourIndex = selectedHourIndex;
        const currentHour = hours[hourIndex];

        if (!currentHour) return [];

        const phase = getFloodPhaseForHour(hourIndex, hours);

        // During 'before' phase with safe risk, show no zones
        // During 'before' phase approaching flood, show dotted warning zones
        // During 'during' phase, show filled flood zones
        // During 'after' phase, show receding water zones (blue tint, lower opacity)

        const regionZones = FLOOD_ZONES;

        if (phase === 'before') {
            // Check if flood is coming within next 3 hours from this index
            const upcomingHours = hours.slice(hourIndex, hourIndex + 4);
            const hasUpcoming = upcomingHours.some(h => h.riskLevel === 'danger' || h.riskLevel === 'warning');

            if (!hasUpcoming) return []; // Safe, nothing to show

            // Show warning zones with dotted borders
            return regionZones.map(zone => ({
                ...zone,
                phase: 'before' as FloodPhase,
                risk: currentHour.riskLevel,
                probability: currentHour.probability,
                // Show approaching flood: how many hours until it starts
                hoursUntilFlood: hours.slice(hourIndex).findIndex(h => h.riskLevel === 'danger' || h.riskLevel === 'warning')
            }));
        }

        if (phase === 'during') {
            return regionZones.map(zone => ({
                ...zone,
                phase: 'during' as FloodPhase,
                risk: currentHour.riskLevel,
                probability: currentHour.probability,
                hoursUntilFlood: 0
            }));
        }

        // After phase
        // Show receding water - find how many hours since last flood
        let hoursSinceFlood = 0;
        for (let i = hourIndex - 1; i >= 0; i--) {
            if (hours[i].riskLevel === 'danger' || hours[i].riskLevel === 'warning') {
                hoursSinceFlood = hourIndex - i;
                break;
            }
        }

        return regionZones.map(zone => ({
            ...zone,
            phase: 'after' as FloodPhase,
            risk: currentHour.riskLevel,
            probability: currentHour.probability,
            hoursUntilFlood: 0,
            hoursSinceFlood
        }));
    }, [prediction, selectedHourIndex]);

    if (activeZones.length === 0) return null;

    return (
        <>
            {activeZones.map(zone => {
                const { phase, risk } = zone;

                // Styling per phase:
                // BEFORE: Yellow dotted border, no fill – "approaching danger"
                // DURING: Red/amber filled zones – "active flooding"
                // AFTER:  Blue with low opacity – "receding water"

                let color: string;
                let fillColor: string;
                let fillOpacity: number;
                let weight: number;
                let dashArray: string | undefined;
                let tooltipText: string;

                if (phase === 'before') {
                    color = '#F59E0B'; // amber
                    fillColor = '#F59E0B';
                    fillOpacity = 0.05;
                    weight = 3;
                    dashArray = '8, 12';
                    const hoursUntil = (zone as any).hoursUntilFlood || 0;
                    tooltipText = `⚠️ ${zone.name} — Flood expected in ~${hoursUntil}h`;
                } else if (phase === 'during') {
                    const isDanger = risk === 'danger';
                    color = isDanger ? '#EF4444' : '#F59E0B';
                    fillColor = isDanger ? '#EF4444' : '#F59E0B';
                    fillOpacity = isDanger ? 0.4 : 0.25;
                    weight = 3;
                    dashArray = undefined;
                    tooltipText = `🌊 ${zone.name} — ${isDanger ? 'High Risk Flooding' : 'Moderate Flooding'} (${zone.probability}%)`;
                } else {
                    // After
                    color = '#3B82F6'; // blue
                    fillColor = '#3B82F6';
                    const hoursSince = (zone as any).hoursSinceFlood || 1;
                    fillOpacity = Math.max(0.05, 0.25 - (hoursSince * 0.04));
                    weight = 2;
                    dashArray = '4, 8';
                    tooltipText = `🌈 ${zone.name} — Water receding (~${hoursSince}h since flood)`;
                }

                return (
                    <Polygon
                        key={`${zone.id}-${phase}`}
                        positions={zone.path.map(p => [p.lat, p.lng]) as [number, number][]}
                        pathOptions={{
                            color,
                            fillColor,
                            fillOpacity,
                            weight,
                            dashArray,
                            lineCap: 'round',
                            lineJoin: 'round'
                        }}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -10]}
                            className="flood-zone-tooltip"
                            permanent={false}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{tooltipText}</span>
                        </Tooltip>
                    </Polygon>
                );
            })}
        </>
    );
}
