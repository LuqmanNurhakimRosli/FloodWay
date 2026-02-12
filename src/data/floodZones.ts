import type { Coordinates } from '../types/app';

export interface FloodZone {
    id: string;
    name: string;
    regionId: string; // matches LOCATIONS id
    path: Coordinates[];
}

export const FLOOD_ZONES: FloodZone[] = [
    // --- KUALA LUMPUR ---
    {
        id: 'kl-zone-1',
        name: 'Pantai Dalam Basin',
        regionId: 'kuala-lumpur',
        path: [
            { lat: 3.115, lng: 101.660 }, { lat: 3.125, lng: 101.670 }, { lat: 3.120, lng: 101.685 },
            { lat: 3.105, lng: 101.690 }, { lat: 3.095, lng: 101.675 }, { lat: 3.100, lng: 101.660 }
        ]
    },
    {
        id: 'kl-zone-2',
        name: 'Kampung Baru / Jln Tun Razak',
        regionId: 'kuala-lumpur',
        path: [
            { lat: 3.155, lng: 101.700 }, { lat: 3.165, lng: 101.705 }, { lat: 3.160, lng: 101.715 },
            { lat: 3.150, lng: 101.710 }, { lat: 3.152, lng: 101.702 }
        ]
    },
    {
        id: 'kl-zone-3',
        name: 'Segambut / Jln Kuching',
        regionId: 'kuala-lumpur',
        path: [
            { lat: 3.180, lng: 101.670 }, { lat: 3.190, lng: 101.680 }, { lat: 3.185, lng: 101.690 },
            { lat: 3.170, lng: 101.685 }, { lat: 3.175, lng: 101.675 }
        ]
    },
    {
        id: 'kl-zone-4',
        name: 'Setiawangsa / Keramat',
        regionId: 'kuala-lumpur',
        path: [
            { lat: 3.175, lng: 101.730 }, { lat: 3.185, lng: 101.740 }, { lat: 3.180, lng: 101.750 },
            { lat: 3.165, lng: 101.745 }, { lat: 3.170, lng: 101.735 }
        ]
    },

    // --- PETALING JAYA ---
    {
        id: 'pj-zone-1',
        name: 'PJS Flood Plain',
        regionId: 'petaling-jaya',
        path: [
            { lat: 3.090, lng: 101.585 }, { lat: 3.100, lng: 101.600 }, { lat: 3.095, lng: 101.615 },
            { lat: 3.080, lng: 101.620 }, { lat: 3.070, lng: 101.605 }, { lat: 3.075, lng: 101.590 }
        ]
    },
    {
        id: 'pj-zone-2',
        name: 'Ara Damansara / Saujana',
        regionId: 'petaling-jaya',
        path: [
            { lat: 3.110, lng: 101.570 }, { lat: 3.120, lng: 101.580 }, { lat: 3.115, lng: 101.595 },
            { lat: 3.100, lng: 101.590 }, { lat: 3.105, lng: 101.575 }
        ]
    },
    {
        id: 'pj-zone-3',
        name: 'Kelana Jaya / SS7',
        regionId: 'petaling-jaya',
        path: [
            { lat: 3.095, lng: 101.595 }, { lat: 3.105, lng: 101.605 }, { lat: 3.100, lng: 101.615 },
            { lat: 3.085, lng: 101.610 }, { lat: 3.090, lng: 101.600 }
        ]
    },
    {
        id: 'pj-zone-4',
        name: 'PJ Old Town / State',
        regionId: 'petaling-jaya',
        path: [
            { lat: 3.085, lng: 101.640 }, { lat: 3.095, lng: 101.650 }, { lat: 3.090, lng: 101.660 },
            { lat: 3.075, lng: 101.655 }, { lat: 3.080, lng: 101.645 }
        ]
    },
    {
        id: 'pj-zone-5',
        name: 'Bandar Utama / Damansara Utama',
        regionId: 'petaling-jaya',
        path: [
            { lat: 3.135, lng: 101.610 }, { lat: 3.145, lng: 101.620 }, { lat: 3.140, lng: 101.635 },
            { lat: 3.125, lng: 101.630 }, { lat: 3.130, lng: 101.615 }
        ]
    },

    // --- SHAH ALAM ---

    {
        id: 'sa-zone-2',
        name: 'Seksyen 13 Stadium Area',
        regionId: 'shah-alam',
        path: [
            { lat: 3.075, lng: 101.540 }, { lat: 3.085, lng: 101.550 }, { lat: 3.080, lng: 101.560 },
            { lat: 3.065, lng: 101.555 }, { lat: 3.070, lng: 101.545 }
        ]
    },
    {
        id: 'sa-zone-3',
        name: 'Glenmarie / Temasya',
        regionId: 'shah-alam',
        path: [
            { lat: 3.085, lng: 101.570 }, { lat: 3.095, lng: 101.580 }, { lat: 3.090, lng: 101.590 },
            { lat: 3.075, lng: 101.585 }, { lat: 3.080, lng: 101.575 }
        ]
    },
    {
        id: 'sa-zone-4',
        name: 'Bukit Jelutong North',
        regionId: 'shah-alam',
        path: [
            { lat: 3.100, lng: 101.520 }, { lat: 3.110, lng: 101.530 }, { lat: 3.105, lng: 101.540 },
            { lat: 3.090, lng: 101.535 }, { lat: 3.095, lng: 101.525 }
        ]
    }
];
