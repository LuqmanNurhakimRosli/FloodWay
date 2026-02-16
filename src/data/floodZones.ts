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
    },

    // --- KAJANG ---
    {
        id: 'kj-zone-1',
        name: 'Sungai Jelok Basin',
        regionId: 'kajang',
        path: [
            { lat: 2.995, lng: 101.785 }, { lat: 3.000, lng: 101.790 }, { lat: 2.990, lng: 101.800 },
            { lat: 2.985, lng: 101.795 }, { lat: 2.988, lng: 101.788 }
        ]
    },

    // --- SERI KEMBANGAN ---
    {
        id: 'sk-zone-1',
        name: 'Sungai Kuyoh / The Mines',
        regionId: 'seri-kembangan',
        path: [
            { lat: 3.020, lng: 101.700 }, { lat: 3.030, lng: 101.710 }, { lat: 3.025, lng: 101.715 },
            { lat: 3.015, lng: 101.710 }, { lat: 3.018, lng: 101.702 }
        ]
    },

    // --- SUNGAI BULOH ---
    {
        id: 'sb-zone-1',
        name: 'Kampung Ulu Sungai Buloh',
        regionId: 'sungai-buloh',
        path: [
            { lat: 3.210, lng: 101.550 }, { lat: 3.220, lng: 101.560 }, { lat: 3.215, lng: 101.570 },
            { lat: 3.200, lng: 101.565 }, { lat: 3.205, lng: 101.555 }
        ]
    },

    // --- KLANG ---
    {
        id: 'klang-zone-1',
        name: 'Taman Sri Muda',
        regionId: 'klang',
        path: [
            { lat: 3.030, lng: 101.440 }, { lat: 3.040, lng: 101.450 }, { lat: 3.035, lng: 101.460 },
            { lat: 3.025, lng: 101.455 }, { lat: 3.028, lng: 101.445 }
        ]
    },

    // --- BATU CAVES ---
    {
        id: 'bc-zone-1',
        name: 'Taman Pinggiran Batu Caves',
        regionId: 'batu-caves',
        path: [
            { lat: 3.235, lng: 101.680 }, { lat: 3.245, lng: 101.690 }, { lat: 3.240, lng: 101.700 },
            { lat: 3.230, lng: 101.695 }, { lat: 3.232, lng: 101.685 }
        ]
    },

    // --- PUCHONG ---
    {
        id: 'pu-zone-1',
        name: 'IOI Mall / Bandar Puteri',
        regionId: 'puchong',
        path: [
            { lat: 3.020, lng: 101.610 }, { lat: 3.030, lng: 101.620 }, { lat: 3.025, lng: 101.630 },
            { lat: 3.015, lng: 101.625 }, { lat: 3.018, lng: 101.615 }
        ]
    }
];
