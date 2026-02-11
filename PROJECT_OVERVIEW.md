# FloodWay — AI-Powered Flood Preparedness & Evacuation System

**Final Year Project (FYP) — February 2026**  
**Author:** Luqman Nurhakim  
**Version:** 2.0.0

---

## Problem Statement

During floods, victims don't just need to know **if** it will flood — they need to know **when** water will reach their home and **which road is safe** to take to a shelter. Current apps (like Waze/Google Maps) calculate traffic, but they don't account for water depth or flood risk.

---

## The Solution: Three Core AI Features

FloodWay is a mobile-first platform with three intelligent features:

---

## ✅ Feature 1: Smart Flood Time-Prediction (The "When")

**STATUS: FULLY IMPLEMENTED**

### What It Does
Predicts flood probability for a specific Malaysian area using an Artificial Neural Network (ANN) trained on 10 years of historical rainfall data (2000-2010).

### How It Works
| Step | Detail |
|------|--------|
| **Input** | Monthly rainfall data (JAN-DEC + ANNUAL_RAINFALL) — 13 features |
| **Preprocessing** | StandardScaler normalization: `X_normalized = (X - mean) / std` |
| **Model** | ANN (Keras/TensorFlow) with Dense layers + ReLU activation |
| **Output** | Flood probability (0.0 - 1.0) → classified as Safe / Warning / Danger |
| **Backend** | FastAPI server with `/predict` endpoint |
| **Frontend** | 24-hour interactive timeline with color-coded risk bars |

### Risk Classification
| Probability | Level | Action |
|-------------|-------|--------|
| ≥ 70% | 🔴 **DANGER** | Evacuate immediately! |
| 40-70% | 🟡 **WARNING** | Stay alert, prepare to evacuate |
| < 40% | 🟢 **SAFE** | Normal conditions |

### Key Files
- `backend/flood_detector.h5` — Trained ANN model
- `src/services/floodService.ts` — API client with fallback simulation
- `src/pages/PredictionPage.tsx` — 24-hour prediction dashboard
- `src/components/AlertCard.tsx`, `FloodTimeline.tsx`, `RiskIndicator.tsx`

---

## ✅ Feature 2: Risk-Aware Evacuation Routing (The "Where")

**STATUS: FULLY IMPLEMENTED (Upgraded from A* to OSRM)**

### What It Does
Guides users to the safest nearby shelter using **real-road navigation** that follows actual Malaysian roads, bridges, and pedestrian paths — not straight lines through rivers.

### How It Works
| Step | Detail |
|------|--------|
| **Routing Engine** | OSRM (Open Source Routing Machine) — uses OpenStreetMap road network |
| **API** | `router.project-osrm.org/route/v1/{profile}/` |
| **Response** | GeoJSON geometry + turn-by-turn instructions with real street names |
| **Map** | Leaflet + OpenStreetMap tiles with animated route visualization |
| **Fallback** | Curved interpolation if OSRM is unreachable (8-second timeout) |

### Transport Modes
| Mode | OSRM Profile | Average Speed | Notes |
|------|-------------|---------------|-------|
| 🚗 **Car** | `driving` | ~50 km/h | Uses road network |
| 🏍️ **Motorcycle** | `driving` (×0.85) | ~45 km/h | Faster in urban traffic |
| 🚶 **Walk** | `foot` | ~5 km/h | Uses pedestrian paths |

### Evolution
| Version | Algorithm | Issues |
|---------|-----------|--------|
| v1.0 | A* grid-based pathfinding | ❌ Straight lines through rivers, ❌ Browser freeze |
| v2.0 | **OSRM real-road routing** | ✅ Follows actual roads, ✅ Async (no freeze), ✅ Real street names |

### Key Files
- `src/utils/pathfinding.ts` — OSRM API integration + route parsing
- `src/pages/ShelterPage.tsx` — Shelter list + transport mode picker
- `src/pages/NavigationPage.tsx` — Full-screen map navigation with Leaflet
- `src/store/AppContext.tsx` — Async route state management
- `src/types/app.ts` — `TransportMode` type (`'car' | 'motorcycle' | 'walk'`)

### Shelter Locations (Real Malaysian PPS)
1. SJK (T) Saraswathy
2. Sekolah Rendah Agama Seksyen 16
3. Dewan MBSA Jati, Sungai Kandis
4. SK Rantau Panjang, Klang
5. Dewan Orang Ramai Taman Gemilang

---

## 🔮 Feature 3: Community Crowd-Sourcing — "Waze for Floods" (PLANNED)

**STATUS: FUTURE IMPLEMENTATION**

### What It Does
Users can verify flood predictions by pinning locations on the live map and reporting real-time ground conditions. If the AI predicts a flood but users report "Road Clear," the system updates itself.

### Report Types
| Icon | Type | Description |
|------|------|-------------|
| 🌊 | **Flooded** | Road/area is flooded (includes water depth estimate) |
| ✅ | **Clear** | Road is clear despite predictions (overrides AI) |
| ⚠️ | **Caution** | Water rising / road is slippery & dangerous |
| 🚧 | **Blocked** | Road is blocked by debris/barricades |
| 🏥 | **Shelter Open** | Shelter is open and accepting evacuees |
| 🆘 | **SOS** | Someone needs assistance |

### How It Will Work
1. User **long-presses** on the Leaflet map at a location
2. A **report panel** appears with type selector + optional photo + notes
3. Report is **saved to real-time database** (Firebase/Supabase)
4. **All nearby users** see the pin appear on their map instantly
5. Other users can **upvote/confirm** the report for verification
6. Reports **auto-expire** after 6 hours (flood conditions change fast)

### Integration with Routing
- If a road has "Flooded" reports → **route avoids it automatically**
- OSRM waypoint exclusion zones around flooded areas
- Warning popup if route passes through reported flood area

### Recommended Tech
- **Firebase Realtime Database** for live report syncing
- **Firebase Auth** for anonymous user identification
- **Firebase Storage** for user-uploaded flood photos
- **Geohash** for efficient nearby-report querying

---

## 🔮 Feature 4: Community Chat — 2km Radius (PLANNED)

**STATUS: FUTURE IMPLEMENTATION**

### What It Does
During a flood emergency, **everyone within a 2km radius** can chat with each other in real-time. This creates a hyperlocal communication network for sharing updates, coordinating evacuations, and helping neighbors.

### How The Radius Works
- User's **GPS position** is the center point
- All users within **2km** are in the same "chat zone"
- As users move, they may **enter/leave** different chat zones
- Messages are tagged with **approximate location** of sender
- Zone automatically adjusts based on population density

### Chat Features
| Feature | Description |
|---------|-------------|
| 💬 **Text Messages** | Basic text chat within 2km zone |
| 📍 **Location Sharing** | Pin exact location for helpers |
| 📷 **Photo Sharing** | Share photos of flood conditions |
| 🆘 **SOS Broadcast** | Emergency alert to ALL nearby users |
| 📊 **Status Updates** | "Road X clear" / "Water at 30cm" |
| 👥 **Active Users** | See how many people are in your zone |
| 🏥 **Shelter Alerts** | Shelter admins broadcast capacity updates |

### Technical Approach
- **Geohash** precision 5 (~5km grid) for zone grouping
- **Haversine distance** filter: only show messages where distance ≤ 2km
- **Real-time subscription** via Firebase/Supabase WebSocket
- **Anonymous usernames** (e.g., "User-3F7A") for privacy
- **Message retention**: 24 hours (emergency data, not permanent)
- **Auto zone update** when user moves >500m

### Recommended Tech
- **Supabase Realtime** (open-source, PostgreSQL + WebSocket)
- **PostGIS** extension for native geospatial queries
- OR **Firebase Realtime Database** for simpler setup

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript 5.9 | Type safety |
| Vite 7 | Dev server & build |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | Premium UI components |
| Lucide React | Icon library |
| Leaflet 1.9 + React-Leaflet 5 | Interactive maps |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.x + FastAPI | API server |
| TensorFlow/Keras | ANN model inference |
| NumPy | Numerical computing |
| Uvicorn | ASGI server |

### External APIs
| API | Purpose |
|-----|---------|
| OSRM | Real-road routing (OpenStreetMap) |
| OpenStreetMap | Map tiles for Leaflet |

### ML/Data
| Asset | Description |
|-------|-------------|
| `flood_detector.h5` | Trained Keras ANN model |
| Malaysia Flood Dataset | Historical rainfall (2000-2010) |
| StandardScaler | Feature normalization |

---

## Application Flow

```
Welcome → Location Selection → Prediction Dashboard → Shelter Selection → GPS Navigation
   │                                                      │
   │                                                      ├── Transport Mode (Car/Motor/Walk)
   │                                                      └── OSRM Route Calculation
   │
   └── [FUTURE] Community Tab
       ├── Crowd-Source Reports (Map Pins)
       └── Location Chat (2km Radius)
```

---

## Running The Project

```bash
# Terminal 1: Start Backend
cd backend
pip install fastapi uvicorn tensorflow numpy pydantic
uvicorn main:app --reload

# Terminal 2: Start Frontend
cd FloodWay
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Summary

| Feature | Status | Technology |
|---------|--------|------------|
| 🧠 Flood Prediction (ANN) | ✅ Implemented | TensorFlow + FastAPI |
| 🗺️ Real-Road Navigation | ✅ Implemented | OSRM + Leaflet |
| 🚗🏍️🚶 Multi-Transport Mode | ✅ Implemented | OSRM driving/foot profiles |
| 📌 Crowd-Source Reports | 🔮 Planned | Firebase/Supabase Realtime |
| 💬 Community Chat (2km) | 🔮 Planned | Firebase/Supabase + Geohash |

---

*FloodWay — Because every minute matters during a flood. 🌊*
