# FloodWay — AI-Powered Flood Preparedness & Evacuation System

**Final Year Project (FYP) — February 2026**  
**Author:** Luqman Nurhakim  
**Version:** 3.0.0 (Live)

---

## Problem Statement

During floods, victims don't just need to know **if** it will flood — they need to know **when** water will reach their home and **which road is safe** to take to a shelter. Current apps (like Waze/Google Maps) calculate traffic, but they don't account for water depth or flood risk. Beyond routing, the public also needs a tool to **understand what flooding looks like at different severity levels** before an emergency strikes.

---

## The Solution: Four Core Features

FloodWay is a mobile-first PWA platform with **four intelligent, interconnected features**:

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
| **Frontend** | 24-hour interactive timeline with color-coded risk bars |
| **Simulation** | `predictionGenerator.ts` generates realistic demo predictions for FYP demo |

### Risk Classification
| Probability | Level | Action |
|-------------|-------|--------|
| ≥ 70% | 🔴 **DANGER** | Evacuate immediately! |
| 40-70% | 🟡 **WARNING** | Stay alert, prepare to evacuate |
| < 40% | 🟢 **SAFE** | Normal conditions |

### Key Files
- `backend/flood_detector.h5` — Trained ANN model
- `src/services/floodService.ts` — API client with fallback simulation
- `src/utils/predictionGenerator.ts` — Frontend demo prediction engine
- `src/components/AlertCard.tsx`, `FloodTimeline.tsx`, `FloodTimelineScrubber.tsx`, `RiskIndicator.tsx`

---

## ✅ Feature 2: Risk-Aware Evacuation Routing (The "Where")

**STATUS: FULLY IMPLEMENTED (Upgraded from A\* to OSRM)**

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
| **Flood Layers** | `FloodZoneLayer` and `FloodReportLayer` overlaid on map |

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
- `src/pages/ShelterPage.tsx` — Shelter list + transport mode picker + flood overlays
- `src/pages/NavigationPage.tsx` — Full-screen map navigation with Leaflet
- `src/components/FloodZoneLayer.tsx` — Static flood hazard zones on map
- `src/components/FloodReportLayer.tsx` — Community-sourced report markers on map
- `src/store/AppContext.tsx` — Async route state management
- `src/types/app.ts` — `TransportMode` type (`'car' | 'motorcycle' | 'walk'`)

### Shelter Locations (Real Malaysian PPS)
1. SJK (T) Saraswathy
2. Sekolah Rendah Agama Seksyen 16
3. Dewan MBSA Jati, Sungai Kandis
4. SK Rantau Panjang, Klang
5. Dewan Orang Ramai Taman Gemilang

---

## ✅ Feature 3: Community Sentinel — "Waze for Floods" (Dual AI + Human Verification)

**STATUS: FULLY IMPLEMENTED (AI Verification Live; Human Review UI Ready)**

### What It Does
A crowd-sourced flood reporting system where users submit photos and descriptions. An **AI pipeline using Gemini 1.5 Flash** instantly verifies each report, followed by a **Human Moderator Review** layer for final publication.

### Report Categories
| Icon | Type | Severity |
|------|------|----------|
| 🌊 | **Rising Water** | High |
| ⛔ | **Blocked Road** | Critical |
| 🏠 | **Trapped Victim** | Highest |
| ⛰️ | **Landslide** | Critical |

### Dual Verification Pipeline (Implemented)
```
User Photo + Description
        │
        ▼
[Layer 1: Gemini 1.5 Flash AI]
  • Detects flood type (Flash Flood / Rising Water)
  • Estimates severity (Low / Medium / High / Critical)
  • Returns confidence score (0–100%)
  • Verdict: ✅ Verified / ❌ Not Verified
        │
        ▼
[Layer 2: Human Moderator Panel]  ← UI Built, Logic Ready
  • Moderator sees AI verdict + raw response
  • Can APPROVE / REJECT / OVERRIDE AI decision
  • Only APPROVED or OVERRIDDEN reports → Public Map
```

### Key Files
- `src/utils/openai.ts` — Gemini 1.5 Flash API adapter
- `src/utils/aiVerification.ts` — Verification pipeline + golden record logging
- `src/components/report/EmergencyMode.tsx` — Emergency report capture UI
- `src/components/report/AIVerification.tsx` — Live AI verification display
- `src/components/report/ModeratorPanel.tsx` — Human review admin interface
- `src/components/report/ReportForm.tsx` — Standard report submission form
- `src/components/report/ReportCard.tsx` — Report list card component
- `src/types/report.ts` — Full type definitions (`FloodReport`, `HumanReview`, `AIVerificationResult`)

---

## ✅ Feature 4: 3D Flood Simulation — "KL Digital Twin"

**STATUS: FULLY IMPLEMENTED**

### What It Does
A real-time interactive **3D WebGL simulation** of a Kuala Lumpur city block experiencing different flood severity levels. Users can visualize what flooding looks like at 0m, 1.5m, and 4.2m water depths, providing **situational awareness before an actual flood**.

### How It Works
| Component | Technology | Detail |
|-----------|-----------|--------|
| **3D Renderer** | React Three Fiber + Three.js | WebGL-based 3D canvas |
| **City Model** | GLTF/GLB (custom Blender export) | `public/city.glb` — isometric city mesh |
| **Water Surface** | Custom GLSL Shader | Wave physics with color, opacity, foam transitions |
| **Rain System** | Three.js InstancedMesh | Up to 200 rain particle drops |
| **Floating Debris** | Three.js Mesh | 10 debris items floating on water surface |
| **Fog & Atmosphere** | Three.js FogExp2 | Dynamic sky color and fog density per level |
| **Dynamic Lighting** | PointLight animations | Color and intensity shift per flood level |
| **Camera** | OrbitControls | Drag, zoom, pan — always enabled |

### Flood Levels
| Level | Water Height | Rainfall | Status | Real-World Impact |
|-------|-------------|----------|--------|-------------------|
| ☀️ **Normal** | 0.0m | 0 mm/h | Safe | Clear conditions |
| 🌧️ **Medium** | 1.5m | 120 mm/h | Warning | First floors submerged |
| 🌊 **High** | 4.2m | 150 mm/h | Critical | Multiple floors submerged |

### Scene Controls (UI)
- **Level Picker** — Instantly switch between Normal / Medium / High
- **Layer Toggles** — Show/hide Water, Rain, Debris independently
- **Demo Cycle** — Auto-cycles flood levels for presentation
- **Live Metrics** — Animated counters for rainfall, wind speed, temperature
- **Flood Gauge** — Visual progress bar with real-time water level
- **Responsive** — Desktop sidebar + mobile bottom sheet drawer

### Key Files
- `src/pages/SimulationPage.tsx` — Full 3D simulation (739 lines, all-in-one)
- `public/city.glb` — Blender-exported isometric city 3D model
- React Three Fiber, `@react-three/drei` (OrbitControls, Environment, Float, useGLTF)
- Three.js ShaderMaterial with custom GLSL vertex/fragment shaders

---

## ✅ Authentication System

**STATUS: FULLY IMPLEMENTED**

| Feature | Technology |
|---------|-----------|
| Email/Password Auth | Firebase Authentication |
| Google Sign-In | Firebase OAuth (signInWithPopup) |
| Auth Guards | `RequireAuth` / `RedirectIfAuthed` HOCs |
| Profile Management | Firebase `updateProfile`, `updateEmail`, `updatePassword` |
| Session Persistence | Firebase onAuthStateChanged |

### Key Files
- `src/contexts/AuthContext.tsx` — Full Firebase Auth context
- `src/lib/firebase.ts` — Firebase app initialization
- `src/pages/WelcomePage.tsx` — Login page (glassmorphism design + otter mascot)
- `src/pages/SignUpPage.tsx` — Registration page
- `src/pages/ProfilePage.tsx` — User profile + settings

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
| **React Three Fiber** | **3D WebGL renderer** |
| **Three.js** | **3D scene management + GLSL shaders** |
| **@react-three/drei** | **3D helpers (OrbitControls, useGLTF, etc.)** |

### Backend (ANN Model Server)
| Technology | Purpose |
|-----------|---------|
| Python 3.x + FastAPI | API server |
| TensorFlow/Keras | ANN model inference |
| NumPy | Numerical computing |
| Uvicorn | ASGI server |

### Authentication & Cloud
| Technology | Purpose |
|-----------|---------|
| Firebase Authentication | User auth (email + Google OAuth) |
| Firebase (planned) | Realtime DB for report persistence |

### External APIs
| API | Purpose |
|-----|---------|
| OSRM | Real-road routing (OpenStreetMap) |
| OpenStreetMap | Map tiles for Leaflet |
| **Google Gemini 1.5 Flash** | **AI flood verification (multimodal vision)** |

### ML/Data
| Asset | Description |
|-------|-------------|
| `flood_detector.h5` | Trained Keras ANN model |
| Malaysia Flood Dataset | Historical rainfall (2000-2010) |
| StandardScaler | Feature normalization |
| `public/city.glb` | Blender GLB 3D city model for simulation |

---

## Application Flow

```
Login/Signup (Firebase Auth)
        │
        ▼
   Loading Screen (onboarding)
        │
        ▼
[HOME DASHBOARD]
   │  ├── AI Flood Prediction Timeline
   │  ├── Risk Alert Card
   │  └── Weather/Forecast Overlay
   │
   ├── [SHELTERS] → Transport Mode → OSRM Route → GPS Navigation
   │         └── Flood Zones + Community Report Pins on Map
   │
   ├── [REPORTS] → Emergency Mode → Photo Capture
   │         └── Gemini AI Verification → Moderator Review Queue
   │
   ├── [SIMULATION] → 3D City Model → Flood Level Controls
   │         └── Water/Rain/Debris Layers → Demo Cycle
   │
   └── [PROFILE] → Edit Name/Email/Password → Sign Out
```

---

## Running The Project

```bash
# Terminal 1: Start Frontend
cd FloodWay
npm install
npm run dev

# Terminal 2: Start Backend (optional — for live ANN predictions)
cd backend
pip install fastapi uvicorn tensorflow numpy pydantic
uvicorn main:app --reload
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Live Deploy | Netlify (SPA with `netlify.toml` redirect rules) |

---

## Feature Status Summary

| Feature | Status | Technology |
|---------|--------|------------|
| 🔐 Firebase Authentication | ✅ Fully Implemented | Firebase Auth + Google OAuth |
| 🧠 Flood Prediction (ANN) | ✅ Fully Implemented | TensorFlow + fastAPI + Frontend simulation |
| 🗺️ Real-Road Navigation | ✅ Fully Implemented | OSRM + Leaflet |
| 🚗🏍️🚶 Multi-Transport Mode | ✅ Fully Implemented | OSRM driving/foot profiles |
| 🌊 Flood Zone Map Layers | ✅ Fully Implemented | Leaflet SVG overlays |
| 📌 Community Report Pins | ✅ Fully Implemented | Context state + Leaflet markers |
| 🤖 Gemini AI Verification | ✅ Fully Implemented | Google Gemini 1.5 Flash |
| 🏙️ 3D Flood Simulation | ✅ Fully Implemented | React Three Fiber + GLB city model |
| 👤 Human Moderator Review | 🔧 UI Built, Backend Pending | ModeratorPanel.tsx ready |
| 💬 Community Chat (2km) | 🔮 Planned | Firebase/Supabase + Geohash |
| 🔌 IoT Sensor Integration | 🔮 Planned | DID river sensors |

---

## Model Advancement Flow

This section documents the **evolution of every intelligent system** inside FloodWay — from the initial concept to the current implementation and the planned future state. Each layer of intelligence was deliberately upgraded based on limitations discovered during development.

---

### 🧠 Layer 1: Flood Prediction Model

```
v1.0 — Rule-Based Threshold (Concept Phase)
│
│  Logic:  IF rainfall > 100mm THEN flood = TRUE
│  Problem: Binary, no probability, no time-awareness,
│           ignores seasonal patterns
│
▼
v2.0 — ANN (Artificial Neural Network)                    ← CURRENT
│
│  Architecture:  Dense → ReLU → Dense → ReLU → Sigmoid
│  Input:         13 features (JAN–DEC monthly rainfall
│                 + ANNUAL_RAINFALL from 2000–2010 dataset)
│  Preprocessing: StandardScaler normalization
│  Output:        Flood probability 0.0–1.0
│  Training:      Keras/TensorFlow, saved as flood_detector.h5
│  Serving:       FastAPI /predict endpoint (Python backend)
│  Frontend:      predictionGenerator.ts simulates 24h timeline
│                 for demo when backend is offline
│
│  Improvement over v1:
│  ✅ Probabilistic output (not just true/false)
│  ✅ Trained on historical patterns
│  ✅ Three risk tiers: Safe / Warning / Danger
│  ⚠️  Gap: Does not use real-time sensor or satellite data
│
▼
v3.0 — Hybrid Sensor Fusion LSTM (Planned)
│
│  Architecture:  LSTM (Sequential Time-Series)
│  Input:         ANN base probability + LIVE inputs:
│                 • DID river gauge sensor readings
│                 • Satellite rainfall nowcast (GPM/JAXA)
│                 • Historical 72h rainfall accumulation
│  Output:        Flood level forecast (0–5m) per hour
│                 for next 6 hours
│  Improvement:
│  ✅ Time-aware (LSTM captures temporal dependencies)
│  ✅ Fuses multiple live data sources
│  ✅ Hour-by-hour granularity, not just probability
│
▼
v4.0 — Multimodal Foundation Model (Future Vision)
│
   Architecture:  Fine-tuned Gemini / spatial FM
   Input:         Sensor + Satellite + Community Reports
                  + Street-level CCTV water level readings
   Output:        Hyperlocal flood map (10m grid resolution)
                  with confidence intervals per cell
```

---

### 🗺️ Layer 2: Evacuation Routing Algorithm

```
v1.0 — A* Grid Pathfinding
│
│  Algorithm:  A* on a 2D grid overlay of the map
│  Problem:    ❌ Paths cut through rivers and buildings
│              ❌ Synchronous — froze the browser
│              ❌ Ignored real road network topology
│              ❌ No actual street names in instructions
│
▼
v2.0 — OSRM Real-Road Routing                             ← CURRENT
│
│  Engine:     Open Source Routing Machine (OSRM)
│  Graph:      OpenStreetMap road network (Contraction Hierarchies)
│  API:        router.project-osrm.org/route/v1/{profile}/
│  Profiles:   driving (car/motorcycle) + foot (walking)
│  Response:   GeoJSON polyline + turn-by-turn steps
│  Async:      Non-blocking fetch, 8s timeout + fallback
│
│  Improvement over v1:
│  ✅ Follows actual Malaysian roads, bridges, footpaths
│  ✅ Real street names in navigation instructions
│  ✅ Async — no browser freeze
│  ✅ Multi-transport: Car / Motorcycle / Walk
│  ⚠️  Gap: Does not dynamically avoid flooded roads yet
│
▼
v3.0 — Flood-Aware Dynamic Rerouting (Planned)
│
│  Engine:     Self-hosted OSRM + custom weight penalties
│  Logic:      Community flood reports + sensor zones
│              → inject high edge-cost penalties on
│                 flooded road segments
│  API:        Internal OSRM + FloodWay overlay service
│  Improvement:
│  ✅ Real-time detour around reported flood roads
│  ✅ Penalizes roads with "Blocked Road" / "Rising Water"
│     report density above threshold
│
▼
v4.0 — Predictive Pre-Evacuation Routing (Future Vision)
│
   Logic:      Combines LSTM flood forecast (Layer 1 v3)
               with road network to pre-calculate safe routes
               BEFORE roads flood, giving 2–6 hour head start
```

---

### 🤖 Layer 3: Report Verification AI

```
v1.0 — No Verification (Concept Phase)
│
│  Logic:  Any user submission → immediately published
│  Problem: Fake reports, panic, misinformation
│           No way to distinguish real floods from noise
│
▼
v2.0 — Keyword Heuristic Filter
│
│  Logic:  IF description.includes("flood" OR "water")
│             AND photoAttached == true
│          THEN mark as "likely valid"
│  Problem: ❌ No image analysis, trivially bypassed
│           ❌ No severity estimation
│
▼
v3.0 — Gemini 1.5 Flash Multimodal Verification          ← CURRENT
│
│  Model:      Google Gemini 1.5 Flash (Vision + Text)
│  Input:      Photo (base64 inline) + User description
│  Output:     Structured JSON verdict:
│              {
│                detected_type: "Flash Flood",
│                severity: "High",
│                is_verified: true,
│                summary: "...",
│                ai_feedback: "..."
│              }
│  Confidence: 85–99% for verified, 30–50% for unverified
│  Logging:    "Golden Record" (timestamp + GPS + verdict)
│              written to console for full auditability
│  Fallback:   Keyword mock when API key is absent
│
│  Improvement over v2:
│  ✅ True image understanding — detects actual water
│  ✅ Severity classification (Low/Medium/High/Critical)
│  ✅ Fake news filter — rejects non-flood images
│  ✅ Measurable confidence score
│  ⚠️  Gap: AI can be fooled by stock flood photos
│
▼
v4.0 — Dual AI + Human Moderator Pipeline (Partially Built)
│
│  Layer 1:    Gemini 1.5 Flash (current, live ✅)
│  Layer 2:    Human Moderator Panel (UI built ✅,
│              DB persistence pending 🔧)
│  Logic:
│    • VERIFIED by AI + APPROVED by human → Public Map ✅
│    • NOT VERIFIED by AI + OVERRIDDEN by human → Map ✅
│    • REJECTED by human → Suppressed always ❌
│    • PENDING human → Hidden until reviewed ⏳
│
▼
v5.0 — Cross-Reference Sensor Verification (Future Vision)
│
   Logic:      AI image verdict CROSS-REFERENCED against:
               • DID river sensor reading at location
               • Satellite radar reflectivity at timestamp
               • Corroboration from ≥3 nearby reports
   Output:     "GROUND TRUTH CONFIRMED" vs "UNVERIFIABLE"
               with sensor-backed confidence score
```

---

### 🏙️ Layer 4: Flood Visualization Engine

```
v1.0 — 2D Static Risk Map
│
│  Tech:    Leaflet coloured circles / heatmap
│  Problem: ❌ Abstract — users can't relate circle
│             colours to real physical water levels
│           ❌ No sense of depth or scale
│
▼
v2.0 — Animated Risk Timeline (2D)
│
│  Tech:    React SVG bars + colour-coded timeline
│           FloodTimeline.tsx + FloodTimelineScrubber.tsx
│  Improvement:
│  ✅ Shows time-based progression of risk
│  ✅ Colour-coded (green/amber/red) risk bars
│  ⚠️  Gap: Still abstract, not spatially intuitive
│
▼
v3.0 — 3D WebGL City Simulation — KL Digital Twin        ← CURRENT
│
│  Tech:    React Three Fiber + Three.js
│  Model:   Custom Blender city → GLB → useGLTF
│  Water:   Custom GLSL ShaderMaterial
│           (3-layer sine wave vertex shader,
│            deep/shallow gradient + foam fragment shader)
│  FX:      InstancedMesh rain (200 drops) + debris (10 items)
│           + PulseRing + FogExp2 + dynamic PointLights
│  Levels:  Normal (0m) / Medium (1.5m) / High (4.2m)
│  UI:      Live animated metrics, flood gauge, toggles,
│           demo cycle, responsive sidebar/bottom-sheet
│
│  Improvement over v2:
│  ✅ Visceral spatial understanding of flood depth
│  ✅ Real-time WebGL — interactive camera control
│  ✅ Visual flood literacy before emergency strikes
│  ⚠️  Gap: City model is generic, not GPS-specific
│
▼
v4.0 — GPS-Anchored Street-Level Simulation (Planned)
│
│  Tech:    Three.js + Mapbox 3D tiles or CesiumJS
│  Logic:   Load 3D tiles of the USER's actual GPS area
│           + overlay flood level prediction from LSTM
│  Output:  "This is YOUR street at 1.5m flood depth"
│
▼
v5.0 — Augmented Reality Flood Overlay (Future Vision)
│
   Tech:    WebXR API + ARCore/ARKit
   Logic:   Device camera feed + depth estimation
            → overlay predicted water level on
              real-world view through the camera
   Output:  User points camera at their road →
            sees a blue water level line on the wall
```

---

### Summary Timeline

```
PAST                         NOW                          FUTURE
─────────────────────────────────────────────────────────────────▶

Prediction:  Rule-Based ──► ANN (h5) ──────────────────► LSTM Sensor Fusion ──► Foundation Model

Routing:     A* Grid ─────► OSRM Real-Road ──────────► Flood-Aware Rerouting ──► Predictive Pre-Evacuation

Verification: None ────────► Gemini 1.5 Flash ─────► Dual AI+Human ─────────► Cross-Sensor Truth Engine

Visualization: 2D Map ─────► 3D WebGL City Sim ───────► GPS 3D Tiles ─────────► AR Camera Overlay
```

---

*FloodWay — Because every minute matters during a flood. 🌊*
