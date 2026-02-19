import { useEffect, useRef, useState } from 'react';

interface GeoState {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    heading: number | null;
    error: string | null;
}

export function useGeolocation() {
    const [state, setState] = useState<GeoState>({
        lat: null,
        lng: null,
        accuracy: null,
        heading: null,
        error: null,
    });

    const watchId = useRef<number | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState((s) => ({ ...s, error: 'Geolocation not supported' }));
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                setState((s) => ({
                    ...s,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    error: null,
                }));
            },
            (err) => {
                setState((s) => ({ ...s, error: err.message }));
            },
            { enableHighAccuracy: true, maximumAge: 5000 },
        );

        // Compass heading via DeviceOrientation
        const handleOrientation = (e: DeviceOrientationEvent) => {
            // webkitCompassHeading is Safari-specific; `alpha` is standard
            const heading =
                (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
                    .webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
            setState((s) => ({ ...s, heading: heading ?? s.heading }));
        };

        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, []);

    return state;
}
