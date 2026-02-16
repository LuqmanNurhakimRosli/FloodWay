// Location and Shelter data

import type { Location, Shelter, Coordinates } from '../types/app';

// Default user position - KLCC (3°09′25″N 101°42′53″E)
export const DEFAULT_POSITION: Coordinates = {
    lat: 3.1542,
    lng: 101.7148
};

// Available locations for selection
export const LOCATIONS: Location[] = [
    {
        id: 'kuala-lumpur',
        name: 'Kuala Lumpur',
        region: 'Wilayah Persekutuan',
        position: { lat: 3.1390, lng: 101.6869 }
    },
    {
        id: 'petaling-jaya',
        name: 'Petaling Jaya',
        region: 'Selangor',
        position: { lat: 3.1073, lng: 101.6067 }
    },
    {
        id: 'shah-alam',
        name: 'Shah Alam',
        region: 'Selangor',
        position: { lat: 3.0733, lng: 101.5185 }
    },
    {
        id: 'kajang',
        name: 'Kajang',
        region: 'Selangor',
        position: { lat: 2.9927, lng: 101.7909 }
    },
    {
        id: 'seri-kembangan',
        name: 'Seri Kembangan',
        region: 'Selangor',
        position: { lat: 3.0227, lng: 101.7061 }
    },
    {
        id: 'sungai-buloh',
        name: 'Sungai Buloh',
        region: 'Selangor',
        position: { lat: 3.2104, lng: 101.5583 }
    },
    {
        id: 'klang',
        name: 'Klang',
        region: 'Selangor',
        position: { lat: 3.0333, lng: 101.4500 }
    },
    {
        id: 'batu-caves',
        name: 'Batu Caves',
        region: 'Selangor',
        position: { lat: 3.2372, lng: 101.6840 }
    },
    {
        id: 'puchong',
        name: 'Puchong',
        region: 'Selangor',
        position: { lat: 3.0253, lng: 101.6178 }
    }
];

// Shelter locations
export const SHELTERS: Shelter[] = [
    {
        id: 'shelter-1',
        name: 'SJK (T) Saraswathy',
        position: { lat: 3.1099, lng: 101.6968 }
    },
    {
        id: 'shelter-2',
        name: 'Sekolah Rendah Agama Seksyen 16',
        position: { lat: 3.0628, lng: 101.5129 }
    },
    {
        id: 'shelter-3',
        name: 'Dewan MBSA Jati, Sungai Kandis',
        position: { lat: 3.0800, lng: 101.5200 }
    },
    {
        id: 'shelter-4',
        name: 'SK Rantau Panjang, Klang',
        position: { lat: 3.0432, lng: 101.4424 }
    },
    {
        id: 'shelter-5',
        name: 'Dewan Orang Ramai Taman Gemilang',
        position: { lat: 2.8145, lng: 101.7317 }
    },
    {
        id: 'shelter-6',
        name: 'SS15 Town Hall, Subang Jaya',
        position: { lat: 3.0784, lng: 101.5891 }
    },
    {
        id: 'shelter-7',
        name: 'SMK Puchong Utama 1',
        position: { lat: 2.9841, lng: 101.6166 }
    },
    {
        id: 'shelter-8',
        name: 'SJK (C) Yu Hua, Kajang',
        position: { lat: 2.9926, lng: 101.7915 }
    },
    {
        id: 'shelter-9',
        name: 'Hulu Langat Community Hall',
        position: { lat: 3.1114, lng: 101.7820 }
    },
    {
        id: 'shelter-10',
        name: 'Ulu Klang Community Hall',
        position: { lat: 3.2014, lng: 101.7533 }
    },
    {
        id: 'shelter-11',
        name: 'Rawang Town Hall',
        position: { lat: 3.3211, lng: 101.5772 }
    },
    {
        id: 'shelter-12',
        name: 'Seksyen U5 Community Hall, PJ',
        position: { lat: 3.1415, lng: 101.5455 }
    },
    {
        id: 'shelter-13',
        name: 'Sri Petaling Community Hall',
        position: { lat: 3.0645, lng: 101.6881 }
    },
    {
        id: 'shelter-14',
        name: 'Wangsa Maju PPS',
        position: { lat: 3.2045, lng: 101.7333 }
    },
    {
        id: 'shelter-15',
        name: 'Gombak Community Hall',
        position: { lat: 3.2433, lng: 101.6888 }
    }
];

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Get shelters with distance from user position
export function getSheltersWithDistance(userPosition: Coordinates): Shelter[] {
    return SHELTERS.map(shelter => ({
        ...shelter,
        distance: Math.round(calculateDistance(userPosition, shelter.position) * 10) / 10,
        estimatedTime: Math.round(calculateDistance(userPosition, shelter.position) / 40 * 60) // Assuming 40km/h average speed
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}
