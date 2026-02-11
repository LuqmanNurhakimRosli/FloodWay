// Real-Road Routing using OSRM (Open Source Routing Machine)
// Uses OpenStreetMap road data for accurate routes that follow real roads,
// avoid rivers, and respect road networks.
//
// Transport modes:
//   - car:        OSRM 'driving' profile (~50 km/h urban avg)
//   - motorcycle: OSRM 'driving' profile (~45 km/h urban avg, can filter through traffic)
//   - walk:       OSRM 'foot' profile    (~5 km/h avg)

import type { Coordinates, Route, NavigationStep, Shelter, TransportMode } from '../types/app';

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
 * Returns real road-following geometry and turn-by-turn steps.
 */
async function fetchOSRMRoute(
    from: Coordinates,
    to: Coordinates,
    mode: TransportMode
): Promise<OSRMResponse | null> {
    const profile = getOSRMProfile(mode);
    const url = `${OSRM_BASE}/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;

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

// ─── Main Route Calculation (Async) ──────────────────────────────────────────

/**
 * Calculate a route from user position to shelter using real road data.
 *
 * Uses OSRM (Open Source Routing Machine) which routes on actual OpenStreetMap
 * road network — respecting roads, rivers, buildings, etc.
 *
 * Falls back to a simple curved path if the API is unavailable.
 */
export async function calculateRoute(
    from: Coordinates,
    to: Shelter,
    mode: TransportMode = 'car'
): Promise<Route> {
    // Try OSRM API for real road routing
    const osrmData = await fetchOSRMRoute(from, to.position, mode);

    if (osrmData && osrmData.routes.length > 0) {
        const osrmRoute = osrmData.routes[0];

        // Convert OSRM geometry to our Coordinates format
        // OSRM returns [lng, lat], we need { lat, lng }
        const path: Coordinates[] = osrmRoute.geometry.coordinates.map(
            ([lng, lat]) => ({ lat, lng })
        );

        // Parse distance and duration from OSRM
        const distanceKm = osrmRoute.distance / 1000;

        // For motorcycle, adjust duration slightly (can filter through traffic)
        let durationMin = osrmRoute.duration / 60;
        if (mode === 'motorcycle') {
            durationMin *= 0.85; // 15% faster than car in urban traffic
        }

        // Parse turn-by-turn steps
        const steps = parseOSRMSteps(osrmRoute);

        return {
            shelter: to,
            distance: Math.round(distanceKm * 10) / 10,
            estimatedTime: Math.max(1, Math.round(durationMin)),
            steps,
            path,
            transportMode: mode,
        };
    }

    // Fallback if OSRM is unavailable
    console.warn('Using fallback route (OSRM unavailable)');
    return createFallbackRoute(from, to, mode);
}
