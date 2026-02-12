import { useMemo } from 'react';
import { Polygon } from 'react-leaflet';
import { useApp } from '../store';
import { FLOOD_ZONES } from '../data/floodZones';

export function FloodZoneLayer() {
    const { prediction, selectedLocation } = useApp();

    const activeZones = useMemo(() => {
        if (!prediction) return [];

        // Show all zones across all regions
        const regionZones = FLOOD_ZONES;

        // Logic:
        // 1. Check current risk (Active)
        // 2. Check next 3 hours risk (Warning)

        const currentRisk = prediction.hourlyPredictions[0]?.riskLevel || 'safe';
        const next3h = prediction.hourlyPredictions.slice(1, 4);
        const futureRisk = next3h.some(h => h.riskLevel !== 'safe')
            ? next3h.find(h => h.riskLevel !== 'safe')?.riskLevel || 'warning'
            : 'safe';

        // Overall state: danger > warning > safe
        const effectiveRisk = currentRisk !== 'safe' ? currentRisk : futureRisk;
        const isWarningOnly = currentRisk === 'safe' && futureRisk !== 'safe';

        if (effectiveRisk === 'safe') return [];

        return regionZones.map(zone => ({
            ...zone,
            status: isWarningOnly ? 'warning-future' : 'active',
            risk: effectiveRisk
        }));
    }, [prediction, selectedLocation]);

    if (activeZones.length === 0) return null;

    return (
        <>
            {activeZones.map(zone => {
                const isDanger = zone.risk === 'danger';
                const isWarningState = zone.status === 'warning-future';

                // Styling base on user requirement:
                // Yellow for warning, Red for high risk
                // Dotted border 3 hours before, covered with color during actual flood

                const color = isDanger ? '#EF4444' : '#F59E0B'; // red-500 : amber-500

                return (
                    <Polygon
                        key={zone.id}
                        positions={zone.path.map(p => [p.lat, p.lng]) as [number, number][]}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: isWarningState ? 0 : 0.35,
                            weight: 3,
                            dashArray: isWarningState ? '8, 12' : undefined,
                            lineCap: 'round',
                            lineJoin: 'round'
                        }}
                    />
                );
            })}
        </>
    );
}
