import type { Coordinates, Route, NavigationStep, Shelter, TransportMode, DailyPrediction } from '../types/app';
import { FLOOD_ZONES } from '../data/floodZones';

// ─── OSRM API Configuration ──────────────────────────────────────────────────

const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// OSRM profile mapping
function getOSRMProfile(mode: TransportMode): string {
    switch (mode) {
        case 'car':
        case 'motorcycle':
            return 'driving';
        case 'walk':
            return 'foot';
    }
}

// Average speeds for time estimation fallback (km/h)
function getAverageSpeed(mode: TransportMode): number {
    switch (mode) {
        case 'car': return 50;
        case 'motorcycle': return 45;
        case 'walk': return 5;
    }
}

// ─── Safety Helpers ─────────────────────────────────────────────────────────

/**
 * Checks if a point is inside a polygon using the Ray Casting algorithm (PNPOLY).
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;

        const intersect = ((yi > point.lng) !== (yj > point.lng))
            && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Checks if a route path intersects any ACTIVE danger flood zones (Solid Red).
 * Warning zones (Dotted Red) are considered passable but flagged.
 * 
 * Uses segment sampling to ensure no polygons are "skipped" between vertices.
 */

// ─── OSRM Route Fetching ─────────────────────────────────────────────────────

interface OSRMResponse {
    code: string;
    routes: {
        geometry: {
            coordinates: [number, number][]; // [lng, lat]
        };
        distance: number; // meters
        duration: number; // seconds
        legs: {
            steps: {
                maneuver: {
                    type: string;
                    modifier?: string;
                    location: [number, number]; // [lng, lat]
                };
                name: string;
                distance: number;
                duration: number;
            }[];
        }[];
    }[];
}

/**
 * Fetch route from OSRM public API.
 * Returns up to 3 alternative routes to help avoid floods.
 */
async function fetchOSRMRoute(
    from: Coordinates,
    to: Coordinates,
    mode: TransportMode
): Promise<OSRMResponse | null> {
    const profile = getOSRMProfile(mode);
    // Request up to 3 alternatives
    const url = `${OSRM_BASE}/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true&alternatives=3`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`OSRM API returned ${response.status}`);
            return null;
        }

        const data: OSRMResponse = await response.json();

        if (data.code !== 'Ok' || !data.routes?.length) {
            console.warn('OSRM returned no routes:', data.code);
            return null;
        }

        return data;
    } catch (error) {
        console.warn('OSRM fetch failed, using fallback:', error);
        return null;
    }
}

// ─── Instruction Generation ──────────────────────────────────────────────────

/**
 * Convert OSRM maneuver type/modifier into human-readable instructions.
 */
function formatManeuver(type: string, modifier: string | undefined, streetName: string): string {
    const street = streetName && streetName !== '' ? ` onto ${streetName}` : '';

    switch (type) {
        case 'depart':
            return `Depart${street}`;
        case 'arrive':
            return 'Arrive at shelter — you are safe';
        case 'turn':
            if (modifier === 'left') return `Turn left${street}`;
            if (modifier === 'right') return `Turn right${street}`;
            if (modifier === 'slight left') return `Turn slightly left${street}`;
            if (modifier === 'slight right') return `Turn slightly right${street}`;
            if (modifier === 'sharp left') return `Sharp left${street}`;
            if (modifier === 'sharp right') return `Sharp right${street}`;
            if (modifier === 'uturn') return `Make a U-turn${street}`;
            return `Turn${street}`;
        case 'continue':
            return `Continue straight${street}`;
        case 'merge':
            return `Merge${street}`;
        case 'new name':
            return `Continue${street}`;
        case 'fork':
            if (modifier === 'left') return `Keep left${street}`;
            if (modifier === 'right') return `Keep right${street}`;
            return `Continue at fork${street}`;
        case 'end of road':
            if (modifier === 'left') return `Turn left at end of road${street}`;
            if (modifier === 'right') return `Turn right at end of road${street}`;
            return `Continue at end of road${street}`;
        case 'roundabout':
        case 'rotary':
            return `Enter roundabout, then exit${street}`;
        case 'exit roundabout':
        case 'exit rotary':
            return `Exit roundabout${street}`;
        default:
            return `Continue${street}`;
    }
}

/**
 * Parse OSRM steps into NavigationStep array.
 */
function parseOSRMSteps(osrmRoute: OSRMResponse['routes'][0]): NavigationStep[] {
    const steps: NavigationStep[] = [];

    for (const leg of osrmRoute.legs) {
        for (const step of leg.steps) {
            const instruction = formatManeuver(
                step.maneuver.type,
                step.maneuver.modifier,
                step.name
            );

            // Format distance for display
            const distStr = step.distance >= 1000
                ? `${(step.distance / 1000).toFixed(1)} km`
                : `${Math.round(step.distance)} m`;

            const fullInstruction = step.maneuver.type === 'arrive' || step.maneuver.type === 'depart'
                ? instruction
                : `${instruction} — ${distStr}`;

            steps.push({
                instruction: fullInstruction,
                distance: Math.round(step.distance),
                position: {
                    lat: step.maneuver.location[1],
                    lng: step.maneuver.location[0],
                },
            });
        }
    }

    // Ensure there's always an arrival step
    if (steps.length > 0 && !steps[steps.length - 1].instruction.includes('Arrive')) {
        const lastStep = steps[steps.length - 1];
        steps.push({
            instruction: 'Arrive at shelter — you are safe',
            distance: 0,
            position: lastStep.position,
        });
    }

    return steps;
}

// ─── Fallback Route (when OSRM is unavailable) ──────────────────────────────

/**
 * Create a curved fallback route using intermediate waypoints.
 * This is used when the OSRM API is unavailable.
 */
function createFallbackRoute(
    from: Coordinates,
    to: Shelter,
    mode: TransportMode
): Route {
    // Create intermediate points for a more realistic-looking path
    const numPoints = 12;
    const path: Coordinates[] = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;

        // Add slight curve using a bezier-like offset
        const offset = Math.sin(t * Math.PI) * 0.003;

        // Base interpolation
        const lat = from.lat + (to.position.lat - from.lat) * t + offset;
        const lng = from.lng + (to.position.lng - from.lng) * t - offset * 0.5;

        path.push({ lat, lng });
    }

    // Ensure exact endpoints
    path[0] = from;
    path[path.length - 1] = to.position;

    // Calculate distance (Haversine)
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        totalDistance += haversineDistance(path[i], path[i + 1]);
    }

    const speed = getAverageSpeed(mode);
    const estimatedTime = Math.round((totalDistance / speed) * 60);

    // Generate basic instructions
    const steps: NavigationStep[] = [
        {
            instruction: `Head towards ${to.name}`,
            distance: Math.round(totalDistance * 1000),
            position: from,
        },
        {
            instruction: 'Arrive at shelter — you are safe',
            distance: 0,
            position: to.position,
        },
    ];

    return {
        shelter: to,
        distance: Math.round(totalDistance * 10) / 10,
        estimatedTime: Math.max(1, estimatedTime),
        steps,
        path,
        transportMode: mode,
    };
}

// ─── Distance Helpers ────────────────────────────────────────────────────────

/**
 * Haversine distance between two coordinates in km.
 */
function haversineDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h =
        sinLat * sinLat +
        Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Calculates the "Center of Hazard" - the average position of all active flood zones.
 */
function getHazardCentroid(): Coordinates | null {
    const activeZones = FLOOD_ZONES;
    if (activeZones.length === 0) return null;

    let totalLat = 0, totalLng = 0, count = 0;
    for (const zone of activeZones) {
        for (const p of zone.path) {
            totalLat += p.lat;
            totalLng += p.lng;
            count++;
        }
    }
    return { lat: totalLat / count, lng: totalLng / count };
}

/**
 * Counts how many points/segments along a path intersect any defined flood zones.
 * This is now strictly synced to what is visible on the map.
 */
function getRouteSafetyScore(path: Coordinates[], prediction: DailyPrediction | null): number {
    if (path.length < 2 || !prediction) return 0;

    let score = 0;
    const dangerZones = FLOOD_ZONES;

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        const dist = haversineDistance(p1, p2);
        const numSamples = Math.max(2, Math.ceil(dist / 0.05)); // 50m precision

        for (let s = 0; s < numSamples; s++) {
            const t = s / numSamples;
            const point = {
                lat: p1.lat + (p2.lat - p1.lat) * t,
                lng: p1.lng + (p2.lng - p1.lng) * t
            };

            for (const zone of dangerZones) {
                if (isPointInPolygon(point, zone.path)) {
                    score++;
                    break;
                }
            }
        }
    }
    return score;
}

// ─── Main Route Calculation (Async) ──────────────────────────────────────────

/**
 * Calculate a route from user position to shelter using real road data.
 * 
 * Uses "Cluster-Dodge" logic: identifies hazard centers and generates
 * repulsion waypoints to force OSRM around blocked areas.
 */
export async function calculateRoute(
    from: Coordinates,
    to: Shelter,
    mode: TransportMode = 'car',
    prediction: DailyPrediction | null = null
): Promise<Route> {
    const osrmData = await fetchOSRMRoute(from, to.position, mode);
    let bestRoute: OSRMResponse['routes'][0] | null = null;
    let bestScore = Infinity;

    if (osrmData && osrmData.routes.length > 0) {
        // 1. Initial Check
        for (const r of osrmData.routes) {
            const score = getRouteSafetyScore(r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })), prediction);
            if (score < bestScore) {
                bestScore = score;
                bestRoute = r;
            }
        }

        // 2. Cluster-Dodge Detour (if initial routes blocked)
        if (bestScore > 0 && prediction) {
            const hazardCenter = getHazardCentroid();
            if (hazardCenter) {
                const midLat = (from.lat + to.position.lat) / 2;
                const midLng = (from.lng + to.position.lng) / 2;

                // Calculate Repulsion Vector (Direction away from Hazard Center)
                const dLat = midLat - hazardCenter.lat;
                const dLng = midLng - hazardCenter.lng;
                const mag = Math.sqrt(dLat * dLat + dLng * dLng) || 1;

                // Generate 2 Dodge waypoints (pushed away from cluster center)
                const scale = 0.08; // ~8-10km repulsion
                const dodgeWaypoints: Coordinates[] = [
                    { lat: midLat + (dLat / mag) * scale, lng: midLng + (dLng / mag) * scale },
                    { lat: midLat + (dLng / mag) * scale, lng: midLng - (dLat / mag) * scale } // Perpendicular detour
                ];

                for (const pivot of dodgeWaypoints) {
                    const detourUrl = `${OSRM_BASE}/${getOSRMProfile(mode)}/${from.lng},${from.lat};${pivot.lng},${pivot.lat};${to.position.lng},${to.position.lat}?overview=full&geometries=geojson&steps=true`;
                    try {
                        const pResp = await fetch(detourUrl);
                        if (pResp.ok) {
                            const pData: OSRMResponse = await pResp.json();
                            if (pData.code === 'Ok' && pData.routes.length > 0) {
                                const pRoute = pData.routes[0];
                                const pScore = getRouteSafetyScore(pRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })), prediction);
                                if (pScore < bestScore) {
                                    bestScore = pScore;
                                    bestRoute = pRoute;
                                    if (bestScore === 0) break;
                                }
                            }
                        }
                    } catch (e) { }
                }
            }
        }
    }

    if (bestRoute) {
        const path: Coordinates[] = bestRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
        const distKm = bestRoute.distance / 1000;
        let durMin = bestRoute.duration / 60;
        if (mode === 'motorcycle') durMin *= 0.85;

        return {
            shelter: to,
            distance: Math.round(distKm * 10) / 10,
            estimatedTime: Math.max(1, Math.round(durMin)),
            steps: parseOSRMSteps(bestRoute),
            path,
            transportMode: mode,
            isSafe: bestScore === 0
        };
    }

    return createFallbackRoute(from, to, mode);
}
