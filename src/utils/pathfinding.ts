// A* Pathfinding Algorithm for Navigation
// Simplified grid-based A* for prototype demonstration

import type { Coordinates, Route, NavigationStep, Shelter } from '../types/app';

interface Node {
    x: number;
    y: number;
    g: number; // Cost from start
    h: number; // Heuristic (estimated cost to end)
    f: number; // Total cost (g + h)
    parent: Node | null;
}

// Grid resolution (degrees per cell)
const GRID_RESOLUTION = 0.005; // ~500m per cell

// Convert coordinates to grid position
function coordToGrid(coord: Coordinates, origin: Coordinates): { x: number; y: number } {
    return {
        x: Math.round((coord.lng - origin.lng) / GRID_RESOLUTION),
        y: Math.round((coord.lat - origin.lat) / GRID_RESOLUTION)
    };
}

// Convert grid position back to coordinates
function gridToCoord(x: number, y: number, origin: Coordinates): Coordinates {
    return {
        lat: origin.lat + y * GRID_RESOLUTION,
        lng: origin.lng + x * GRID_RESOLUTION
    };
}

// Heuristic function (Euclidean distance)
function heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// A* Algorithm implementation
function aStar(
    start: { x: number; y: number },
    end: { x: number; y: number }
): { x: number; y: number }[] {
    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start, end),
        f: 0,
        parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    // Direction vectors (8 directions)
    const directions = [
        { dx: 0, dy: 1 },   // North
        { dx: 1, dy: 1 },   // NE
        { dx: 1, dy: 0 },   // East
        { dx: 1, dy: -1 },  // SE
        { dx: 0, dy: -1 },  // South
        { dx: -1, dy: -1 }, // SW
        { dx: -1, dy: 0 },  // West
        { dx: -1, dy: 1 }   // NW
    ];

    let iterations = 0;
    const maxIterations = 10000;

    while (openSet.length > 0 && iterations < maxIterations) {
        iterations++;

        // Find node with lowest f score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        // Check if we reached the goal
        if (current.x === end.x && current.y === end.y) {
            // Reconstruct path
            const path: { x: number; y: number }[] = [];
            let node: Node | null = current;
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }

        closedSet.add(`${current.x},${current.y}`);

        // Explore neighbors
        for (const dir of directions) {
            const neighborX = current.x + dir.dx;
            const neighborY = current.y + dir.dy;
            const key = `${neighborX},${neighborY}`;

            if (closedSet.has(key)) continue;

            // Cost is higher for diagonal movement
            const moveCost = dir.dx !== 0 && dir.dy !== 0 ? 1.414 : 1;
            const g = current.g + moveCost;

            // Check if neighbor is already in open set
            const existingNode = openSet.find(n => n.x === neighborX && n.y === neighborY);

            if (!existingNode) {
                const h = heuristic({ x: neighborX, y: neighborY }, end);
                openSet.push({
                    x: neighborX,
                    y: neighborY,
                    g,
                    h,
                    f: g + h,
                    parent: current
                });
            } else if (g < existingNode.g) {
                existingNode.g = g;
                existingNode.f = g + existingNode.h;
                existingNode.parent = current;
            }
        }
    }

    // No path found, return direct line
    return [start, end];
}

// Generate navigation instructions
function generateInstructions(path: Coordinates[]): NavigationStep[] {
    const steps: NavigationStep[] = [];

    if (path.length < 2) return steps;

    // Simplify: just create turn-by-turn for significant direction changes
    let currentDirection = '';
    let accumulatedDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        const dLat = to.lat - from.lat;
        const dLng = to.lng - from.lng;

        // Calculate direction
        let direction = '';
        if (Math.abs(dLat) > Math.abs(dLng)) {
            direction = dLat > 0 ? 'north' : 'south';
        } else {
            direction = dLng > 0 ? 'east' : 'west';
        }

        // Calculate segment distance
        const segmentDistance = Math.sqrt(dLat ** 2 + dLng ** 2) * 111000; // Approximate meters
        accumulatedDistance += segmentDistance;

        // Add step if direction changes or end of path
        if (direction !== currentDirection || i === path.length - 2) {
            if (currentDirection) {
                steps.push({
                    instruction: `Head ${currentDirection} for ${Math.round(accumulatedDistance)}m`,
                    distance: Math.round(accumulatedDistance),
                    position: from
                });
            }
            currentDirection = direction;
            accumulatedDistance = 0;
        }
    }

    // Add final destination step
    steps.push({
        instruction: 'Arrive at destination',
        distance: 0,
        position: path[path.length - 1]
    });

    return steps;
}

// Main function to calculate route
export function calculateRoute(
    from: Coordinates,
    to: Shelter
): Route {
    // Define grid origin (minimum of start and end)
    const origin: Coordinates = {
        lat: Math.min(from.lat, to.position.lat) - 0.01,
        lng: Math.min(from.lng, to.position.lng) - 0.01
    };

    // Convert to grid coordinates
    const startGrid = coordToGrid(from, origin);
    const endGrid = coordToGrid(to.position, origin);

    // Run A* algorithm
    const gridPath = aStar(startGrid, endGrid);

    // Convert back to coordinates
    const path: Coordinates[] = gridPath.map(p => gridToCoord(p.x, p.y, origin));

    // Ensure start and end are exact
    if (path.length > 0) {
        path[0] = from;
        path[path.length - 1] = to.position;
    }

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dLat = path[i + 1].lat - path[i].lat;
        const dLng = path[i + 1].lng - path[i].lng;
        totalDistance += Math.sqrt(dLat ** 2 + dLng ** 2) * 111; // km
    }

    // Generate navigation steps
    const steps = generateInstructions(path);

    // Estimate time (assuming 40 km/h average urban speed)
    const estimatedTime = Math.round(totalDistance / 40 * 60);

    return {
        shelter: to,
        distance: Math.round(totalDistance * 10) / 10,
        estimatedTime: Math.max(1, estimatedTime),
        steps,
        path
    };
}
