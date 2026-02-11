/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   ███████╗██╗      ██████╗  ██████╗ ██████╗ ██╗    ██╗ █████╗ ██╗   ██╗   ║
 * ║   ██╔════╝██║     ██╔═══██╗██╔═══██╗██╔══██╗██║    ██║██╔══██╗╚██╗ ██╔╝   ║
 * ║   █████╗  ██║     ██║   ██║██║   ██║██║  ██║██║ █╗ ██║███████║ ╚████╔╝    ║
 * ║   ██╔══╝  ██║     ██║   ██║██║   ██║██║  ██║██║███╗██║██╔══██║  ╚██╔╝     ║
 * ║   ██║     ███████╗╚██████╔╝╚██████╔╝██████╔╝╚███╔███╔╝██║  ██║   ██║      ║
 * ║   ╚═╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝      ║
 * ║                                                                           ║
 * ║           AI-Powered Flood Preparedness & Navigation System               ║
 * ║                        Final Year Project (FYP)                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * @author Luqman Nurhakim
 * @version 2.0.0
 * @date February 2026
 */

// ═══════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════
// 
// 1. PROJECT OVERVIEW
// 2. SYSTEM ARCHITECTURE
// 3. AI/ML FLOOD PREDICTION MODEL
// 4. REAL-ROAD NAVIGATION (OSRM + Transport Modes)
// 5. TECH STACK
// 6. CURRENT FEATURES (What We've Achieved)
// 7. PLANNED FEATURES (Future Implementation)
//    7A. Community Crowd-Sourcing (Waze for Floods)
//    7B. Community Chat (2km Radius)
// 8. FUTURE ENHANCEMENTS
// 9. API REFERENCE
// 
// ═══════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// 1. PROJECT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
/**
 * FloodWay is an AI-powered flood preparedness and evacuation system designed
 * for Malaysia (specifically Kuala Lumpur/Selangor region). It combines three
 * core pillars — prediction, navigation, and community — to help flood
 * victims act fast and evacuate safely.
 * 
 * ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 * │  AI Prediction  │───►│  Real-time      │───►│  Real-Road GPS  │
 * │  (ANN Model)    │    │  Flood Alerts   │    │  Navigation     │
 * └─────────────────┘    └─────────────────┘    └─────────────────┘
 *          │                       │                      │
 *          └───────────────────────┼──────────────────────┘
 *                                  ▼
 *                    ┌──────────────────────────┐
 *                    │  Community Crowd-Source   │
 *                    │  + Location-Based Chat    │
 *                    └──────────────────────────┘
 * 
 * THE PROBLEM:
 * During floods, victims don't just need to know IF it will flood — they need
 * to know WHEN water will reach their home and which ROAD is SAFE to take to
 * a shelter. Current apps (like Waze/Google Maps) calculate traffic, but they
 * don't account for water depth or flood risk.
 * 
 * THE SOLUTION:
 * FloodWay addresses this with three intelligent features:
 * 
 * Feature 1: Smart Flood Time-Prediction (The "When")
 *   - Predicts flood probability using ANN trained on Malaysian rainfall data
 *   - 24-hour hourly risk timeline with danger/warning/safe classification
 *   - Backend ML model (flood_detector.h5) with FastAPI endpoint
 * 
 * Feature 2: Risk-Aware Evacuation Routing (The "Where")
 *   - Real-road navigation using OSRM (OpenStreetMap road network)
 *   - Routes follow actual roads, bridges — avoids rivers and off-road
 *   - Multi-transport support: Car (🚗), Motorcycle (🏍️), Walking (🚶)
 *   - Turn-by-turn instructions with real street names
 * 
 * Feature 3: Community Crowd-Sourcing (The "Real-Time Check")  [PLANNED]
 *   - "Waze for Floods" — users pin flood reports on the live map
 *   - Location-based community chat within 2km radius
 *   - Real-time condition verification and updates
 */


// ═══════════════════════════════════════════════════════════════════════════
// 2. SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * The system follows a client-server architecture with external API integration:
 * 
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │                       FRONTEND (React + Vite)                          │
 * │                                                                        │
 * │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
 * │   │  Welcome     │───►│  Location    │───►│  Prediction  │            │
 * │   │  Page        │    │  Selection   │    │  Dashboard   │            │
 * │   └──────────────┘    └──────────────┘    └──────────────┘            │
 * │                                                  │                     │
 * │                                                  ▼                     │
 * │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
 * │   │  Navigation  │◄───│  OSRM Route  │◄───│  Shelter     │            │
 * │   │  (Map + GPS) │    │  Calculation │    │  + Mode Pick │            │
 * │   └──────────────┘    └──────────────┘    └──────────────┘            │
 * │         │                    │                                         │
 * │   ┌──────────────┐    ┌──────────────┐   [PLANNED]                    │
 * │   │ Crowd-Source │    │  Community   │                                │
 * │   │ Flood Reports│    │  Chat (2km)  │                                │
 * │   └──────────────┘    └──────────────┘                                │
 * └──────────────────────────────│─────────────────────────────────────────┘
 *                                │
 *          ┌─────────────────────┼─────────────────────┐
 *          ▼                     ▼                     ▼
 * ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 * │   BACKEND       │  │   OSRM API      │  │   Firebase /    │
 * │   (FastAPI)     │  │   (Road Routing) │  │   Supabase      │
 * │                 │  │                  │  │   [PLANNED]     │
 * │  • /predict     │  │  • /driving/     │  │  • Realtime DB  │
 * │  • /health      │  │  • /foot/        │  │  • Auth         │
 * │  • ANN Model    │  │  • Turn-by-turn  │  │  • Chat         │
 * └─────────────────┘  └─────────────────┘  └─────────────────┘
 */


// ═══════════════════════════════════════════════════════════════════════════
// 3. AI/ML FLOOD PREDICTION MODEL
// ═══════════════════════════════════════════════════════════════════════════
/**
 * MODEL FILE: flood_detector.h5 (Keras/TensorFlow)
 * TRAINING: flood_detection_using_ann.ipynb
 * DATASET: _MalaysiaFloodDataset_MalaysiaFloodDataset.csv
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    ARTIFICIAL NEURAL NETWORK (ANN)                      │
 * │                                                                         │
 * │   INPUT LAYER (13 features)        HIDDEN LAYERS          OUTPUT       │
 * │   ┌────────────────────┐          ┌──────────────┐                     │
 * │   │ JAN Rainfall       │──────────┤              │                     │
 * │   │ FEB Rainfall       │──────────┤              │                     │
 * │   │ MAR Rainfall       │──────────┤              │                     │
 * │   │ APR Rainfall       │──────────┤              │      ┌──────────┐  │
 * │   │ MAY Rainfall       │──────────┤   DENSE      │──────│  Flood   │  │
 * │   │ JUN Rainfall       │──────────┤   LAYERS     │      │Probability│  │
 * │   │ JUL Rainfall       │──────────┤   (ReLU)     │      │  (0-1)   │  │
 * │   │ AUG Rainfall       │──────────┤              │      └──────────┘  │
 * │   │ SEP Rainfall       │──────────┤              │                     │
 * │   │ OCT Rainfall       │──────────┤              │                     │
 * │   │ NOV Rainfall       │──────────┤              │                     │
 * │   │ DEC Rainfall       │──────────┤              │                     │
 * │   │ ANNUAL RAINFALL    │──────────┤              │                     │
 * │   └────────────────────┘          └──────────────┘                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * DATA PREPROCESSING:
 * ───────────────────
 * StandardScaler normalization: X_normalized = (X - mean) / std
 * 
 * RISK LEVEL CLASSIFICATION:
 * ─────────────────────────
 * │ Probability >= 0.70  │ → DANGER  (High flood risk - Evacuate!)     │
 * │ Probability >= 0.40  │ → WARNING (Moderate risk - Stay alert)      │
 * │ Probability <  0.40  │ → SAFE    (Low risk - Normal conditions)    │
 * 
 * HOW IT WORKS:
 * ─────────────
 * 1. User selects a location (Kuala Lumpur, Petaling Jaya, Shah Alam)
 * 2. Frontend sends monthly rainfall data to backend /predict endpoint
 * 3. Backend loads flood_detector.h5 model (lazy loading)
 * 4. Input data normalized using StandardScaler parameters
 * 5. ANN model outputs flood probability (0.0 - 1.0)
 * 6. Backend classifies risk level and returns prediction
 * 7. Frontend displays 24-hour timeline with risk indicators
 */


// ═══════════════════════════════════════════════════════════════════════════
// 4. REAL-ROAD NAVIGATION (OSRM + Transport Modes)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * FILE: src/utils/pathfinding.ts
 * 
 * The navigation system uses OSRM (Open Source Routing Machine) to calculate
 * routes on the REAL OpenStreetMap road network. This replaced a previous
 * grid-based approach that would go straight through rivers and buildings.
 * 
 * OSRM ROUTING:
 * ─────────────
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    OSRM REAL-ROAD ROUTING                               │
 * │                                                                         │
 * │   API: router.project-osrm.org                                         │
 * │   Data: OpenStreetMap road network (actual roads, bridges, paths)       │
 * │                                                                         │
 * │   TRANSPORT MODES:                                                      │
 * │   ┌────────────┬──────────────────┬──────────┬──────────────────────┐  │
 * │   │ Mode       │ OSRM Profile     │ Avg Speed│ Notes                │  │
 * │   ├────────────┼──────────────────┼──────────┼──────────────────────┤  │
 * │   │ 🚗 Car     │ driving          │ ~50 km/h │ Uses road network    │  │
 * │   │ 🏍️ Motor   │ driving (×0.85)  │ ~45 km/h │ Faster in traffic   │  │
 * │   │ 🚶 Walk    │ foot             │ ~5 km/h  │ Uses pedestrian paths│  │
 * │   └────────────┴──────────────────┴──────────┴──────────────────────┘  │
 * │                                                                         │
 * │   ADVANTAGES OVER PREVIOUS A* GRID:                                     │
 * │   ✅ Follows actual roads (no more cutting through rivers!)             │
 * │   ✅ Real street names in instructions ("Turn left onto Jalan Bangsar") │
 * │   ✅ Accurate distance & time from real road geometry                   │
 * │   ✅ Async API call — no browser freezing                               │
 * │   ✅ Multi-transport mode support                                       │
 * │   ✅ Automatic fallback if API unavailable                              │
 * │                                                                         │
 * │   ROUTE FEATURES:                                                       │
 * │   • GeoJSON geometry with full road-following coordinates               │
 * │   • Turn-by-turn maneuver instructions                                  │
 * │   • Distance in meters/km, duration in seconds                          │
 * │   • 8-second timeout with graceful fallback                             │
 * │                                                                         │
 * │   API URL FORMAT:                                                       │
 * │   GET /route/v1/{profile}/{lng1},{lat1};{lng2},{lat2}                   │
 * │       ?overview=full&geometries=geojson&steps=true                      │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * SHELTER LOCATIONS (Real Malaysian Schools/Community Halls):
 * ─────────────────────────────────────────────────────────────
 * • SJK (T) Saraswathy
 * • Sekolah Rendah Agama Seksyen 16
 * • Dewan MBSA Jati, Sungai Kandis
 * • SK Rantau Panjang, Klang
 * • Dewan Orang Ramai Taman Gemilang
 * 
 * DISTANCE CALCULATION (Haversine Formula):
 * ─────────────────────────────────────────
 *   a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
 *   c = 2 × atan2(√a, √(1-a))
 *   distance = R × c  (where R = 6371 km, Earth's radius)
 */


// ═══════════════════════════════════════════════════════════════════════════
// 5. TECH STACK
// ═══════════════════════════════════════════════════════════════════════════
/**
 * FRONTEND:
 * ─────────
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ React 19          │ UI Framework with Functional Components         │
 * │ TypeScript 5.9    │ Type-safe JavaScript                            │
 * │ Vite 7            │ Fast development server & build tool            │
 * │ React Router 7    │ Client-side routing (Welcome → Navigation)     │
 * │ Tailwind CSS 4    │ Utility-first CSS framework                     │
 * │ shadcn/ui         │ Premium UI component library (Card, Button...)  │
 * │ Lucide React      │ Beautiful icon library                          │
 * │ Leaflet 1.9       │ Interactive maps (OpenStreetMap tiles)          │
 * │ React-Leaflet 5   │ React bindings for Leaflet                      │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * BACKEND:
 * ────────
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Python 3.x        │ Backend runtime                                 │
 * │ FastAPI           │ Modern, fast API framework                      │
 * │ TensorFlow/Keras  │ Deep learning framework for ANN model           │
 * │ NumPy             │ Numerical computing for data preprocessing      │
 * │ Pydantic          │ Data validation for API requests                │
 * │ Uvicorn           │ ASGI server                                     │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * EXTERNAL APIS:
 * ──────────────
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ OSRM              │ Real-road routing (OpenStreetMap road network)  │
 * │ OpenStreetMap      │ Map tiles for Leaflet visualization            │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * ML/DATA:
 * ────────
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ flood_detector.h5 │ Trained Keras ANN model (~51KB)                 │
 * │ Jupyter Notebook  │ Model training & experimentation                │
 * │ StandardScaler    │ Feature normalization for consistent predictions│
 * │ Malaysia Dataset  │ Historical rainfall data (2000-2010)            │
 * └──────────────────────────────────────────────────────────────────────┘
 */


// ═══════════════════════════════════════════════════════════════════════════
// 6. CURRENT FEATURES (What We've Achieved)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ✅ ACHIEVED — FEATURE 1: Smart Flood Time-Prediction
 * ════════════════════════════════════════════════════════
 * 
 * STATUS: ✅ FULLY IMPLEMENTED
 * 
 * What it does:
 *   Predicts flood probability for a specific Malaysian area using an ANN
 *   (Artificial Neural Network) trained on 10 years of rainfall data.
 * 
 * Implementation:
 *   • ANN Model (flood_detector.h5) trained on Malaysia Flood Dataset
 *   • 13 input features: monthly rainfall (JAN-DEC) + annual total
 *   • FastAPI backend with /predict endpoint
 *   • StandardScaler normalization for input preprocessing
 *   • Frontend: 24-hour timeline with color-coded risk bars
 *   • Risk classification: Safe (<40%) → Warning (40-70%) → Danger (>70%)
 *   • Fallback simulation when backend is offline
 * 
 * Files:
 *   ├── backend/main.py           → FastAPI server with /predict endpoint
 *   ├── backend/flood_detector.h5 → Trained ANN model
 *   ├── src/services/floodService.ts → API client with fallback
 *   ├── src/utils/predictionGenerator.ts → Simulation data generator
 *   ├── src/pages/PredictionPage.tsx → 24-hour dashboard UI
 *   └── src/components/
 *       ├── AlertCard.tsx          → Danger/Warning alerts
 *       ├── FloodTimeline.tsx      → Hourly risk timeline
 *       ├── RiskIndicator.tsx      → Risk level badges
 *       └── WeatherCard.tsx        → Current weather display
 * 
 * 
 * ✅ ACHIEVED — FEATURE 2: Risk-Aware Evacuation Routing
 * ═══════════════════════════════════════════════════════════
 * 
 * STATUS: ✅ FULLY IMPLEMENTED (Upgraded from A* to OSRM)
 * 
 * What it does:
 *   Guides users to the safest nearby shelter using real-road navigation
 *   that follows actual Malaysian roads, bridges, and pedestrian paths.
 * 
 * Implementation:
 *   • OSRM API (router.project-osrm.org) for real OpenStreetMap routing
 *   • 3 transport modes: Car 🚗 | Motorcycle 🏍️ | Walking 🚶
 *   • Async route calculation (no browser freezing)
 *   • Turn-by-turn instructions with real street names
 *   • Animated navigation with user marker moving along route
 *   • Leaflet map with route polyline visualization
 *   • Loading state with spinner while calculating
 *   • Fallback curved route if OSRM is unreachable
 *   • "You've Arrived!" completion screen
 * 
 * Evolution:
 *   v1.0 → A* grid-based pathfinding (straight lines, froze browser)
 *   v2.0 → OSRM real-road routing (follows actual roads, async)
 * 
 * Files:
 *   ├── src/utils/pathfinding.ts     → OSRM integration + route parsing
 *   ├── src/pages/NavigationPage.tsx  → Map navigation with Leaflet
 *   ├── src/pages/ShelterPage.tsx     → Shelter list + transport picker
 *   ├── src/store/AppContext.tsx      → Async route state management
 *   └── src/types/app.ts             → TransportMode type definitions
 * 
 * 
 * ✅ ACHIEVED — Core Application Features
 * ════════════════════════════════════════
 * 
 * 1. WELCOME SCREEN (src/pages/WelcomePage.tsx)
 *    • Animated gradient background with floating orbs
 *    • Water drop logo with glow effect
 *    • Feature highlights (24-hour forecast, alerts, GPS)
 *    • "Get Started" CTA button
 * 
 * 2. LOCATION SELECTION (src/pages/LocationPage.tsx)
 *    • Choose from 3 supported locations (KL, PJ, Shah Alam)
 *    • Card-based selection with hover effects
 *    • Back navigation
 * 
 * 3. FLOOD PREDICTION DASHBOARD (src/pages/PredictionPage.tsx)
 *    • 24-hour timeline with probability bars
 *    • Risk level indicator (Safe/Warning/Danger)
 *    • Current flood probability percentage
 *    • Animated danger alerts for high-risk periods
 *    • "Find Shelter" quick action
 * 
 * 4. SHELTER SELECTION MAP (src/pages/ShelterPage.tsx)
 *    • Full-screen Leaflet/OpenStreetMap
 *    • User position marker (pulsing dot)
 *    • Shelter markers with selection state
 *    • Distance & ETA for each shelter
 *    • Route preview (dashed line) on shelter selection
 *    • Bottom sheet with shelter list (sorted by distance)
 *    • 🆕 Transport mode picker (Car / Motorcycle / Walk)
 *    • 🆕 Loading spinner during route calculation
 *    • "Start Navigation" button
 * 
 * 5. GPS NAVIGATION (src/pages/NavigationPage.tsx)
 *    • 🆕 Real road-following route from OSRM
 *    • 🆕 Transport mode badge (Driving / Riding / Walking)
 *    • 🆕 Async route loading with loading screen
 *    • Animated user marker moving along actual road route
 *    • Full route visualization (blue dashed = remaining, green = completed)
 *    • Real-time progress bar
 *    • Turn-by-turn instructions with real street names
 *    • ETA countdown + distance remaining
 *    • "You've Arrived!" celebration screen
 *    • "I'm Safe" confirmation button
 * 
 * 6. BACKEND API (backend/main.py)
 *    • POST /predict — ML-based flood prediction
 *    • POST /predict-simple — Quick testing endpoint
 *    • GET /health — Service health check
 *    • CORS enabled for frontend
 * 
 * 7. STATE MANAGEMENT (src/store/AppContext.tsx)
 *    • React Context for global state
 *    • 🆕 Async navigateToShelter() method
 *    • 🆕 Transport mode state
 *    • 🆕 Route loading indicator
 *    • Location, shelter, prediction state
 */


// ═══════════════════════════════════════════════════════════════════════════
// 7. PLANNED FEATURES (Future Implementation)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 7A. COMMUNITY CROWD-SOURCING — "Waze for Floods" 🗺️📌
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * STATUS: 🔮 PLANNED (Future Implementation)
 * 
 * CONCEPT:
 * ────────
 * Users can verify flood predictions by pinning locations on the map and
 * reporting real-time ground conditions. If the AI predicts a flood but
 * users report "Road Clear," the system updates itself in real-time.
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    CROWD-SOURCING FLOW                               │
 * │                                                                      │
 * │   User            Map UI              Backend         Other Users   │
 * │   ─────           ──────              ───────         ───────────   │
 * │     │                │                    │                │         │
 * │     │  Long-press    │                    │                │         │
 * │     │  on map        │                    │                │         │
 * │     │───────────────►│                    │                │         │
 * │     │                │                    │                │         │
 * │     │  Report Panel  │                    │                │         │
 * │     │  appears       │                    │                │         │
 * │     │◄───────────────│                    │                │         │
 * │     │                │                    │                │         │
 * │     │  Select type:  │                    │                │         │
 * │     │  🌊 Flooded    │                    │                │         │
 * │     │  ✅ Road Clear │                    │                │         │
 * │     │  ⚠️ Caution   │                    │                │         │
 * │     │  🚧 Road Block │                    │                │         │
 * │     │                │                    │                │         │
 * │     │  Submit ───────┼───────────────────►│                │         │
 * │     │                │                    │  Broadcast     │         │
 * │     │                │                    │───────────────►│         │
 * │     │                │   Pin appears      │                │         │
 * │     │                │◄───────────────────│                │         │
 * │     │                │                    │                │         │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * REPORT TYPES:
 * ┌──────────────┬────────────────────────────────────────────────────┐
 * │ 🌊 Flooded   │ Road/area is flooded (includes water depth est.)  │
 * │ ✅ Clear     │ Road is clear despite predictions (overrides AI)  │
 * │ ⚠️ Caution  │ Water rising / road is slippery & dangerous       │   
 * │ 🚧 Blocked  │ Road is blocked by debris/barricades              │
 * │ 🏥 Shelter   │ Shelter is open and accepting evacuees            │
 * │ 🆘 Help     │ Someone needs assistance (SOS signal)             │
 * └──────────────┴────────────────────────────────────────────────────┘
 * 
 * TECHNICAL IMPLEMENTATION:
 * ─────────────────────────
 * Frontend:
 *   • New page: src/pages/CrowdSourcePage.tsx
 *   • Long-press handler on Leaflet map to create report
 *   • Report modal with type selector, optional photo, notes
 *   • Colored pins/markers on map for each report type
 *   • Upvote/confirm system (other users can verify reports)
 *   • Reports auto-expire after 6 hours (floods change fast)
 *   • Report count badges on pins
 * 
 * Backend (Firebase Realtime DB or Supabase):
 *   • Collection: flood_reports
 *   • Fields: { lat, lng, type, userId, timestamp, verified, photo? }
 *   • Real-time listener for nearby reports (geohash-based)
 *   • Auto-cleanup for expired reports (Cloud Function / cron)
 * 
 * Integration with Routing:
 *   • If a road has "Flooded" reports → increase route cost
 *   • OSRM waypoint avoidance for flooded segments
 *   • Show warning if route passes through reported flood area
 * 
 * Data Model:
 *   interface FloodReport {
 *       id: string;
 *       userId: string;
 *       position: Coordinates;
 *       type: 'flooded' | 'clear' | 'caution' | 'blocked' | 'shelter_open' | 'sos';
 *       description?: string;
 *       photoUrl?: string;
 *       waterDepthCm?: number;    // Estimated water depth
 *       timestamp: Date;
 *       expiresAt: Date;          // Auto-expire after 6 hours
 *       verifiedBy: string[];     // Users who confirmed this report
 *       verifiedCount: number;
 *   }
 * 
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 7B. COMMUNITY CHAT — Location-Based Communication 💬🗼
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * STATUS: 🔮 PLANNED (Future Implementation)
 * 
 * CONCEPT:
 * ────────
 * During a flood emergency, people within a 2km radius can chat with each
 * other to share real-time updates, coordinate evacuations, and help
 * neighbors. This creates a hyperlocal communication network when phones
 * may have limited connectivity.
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    COMMUNITY CHAT SYSTEM                             │
 * │                                                                      │
 * │   ┌─────────────────────────────────────────────────────────────┐   │
 * │   │                     2KM RADIUS ZONE                          │   │
 * │   │                                                               │   │
 * │   │       👤 User A                                              │   │
 * │   │         "Water rising on Jalan 3!"                           │   │
 * │   │                                                               │   │
 * │   │              👤 User B                                       │   │
 * │   │               "I can see it from my window, about 30cm"      │   │
 * │   │                                                               │   │
 * │   │    🏥 Shelter Admin                                          │   │
 * │   │     "PPS at SK Rantau Panjang is OPEN, capacity 200"         │   │
 * │   │                                                               │   │
 * │   │                         👤 User C                            │   │
 * │   │                          "Need help! Elderly person stuck"   │   │
 * │   │                                                               │   │
 * │   │   👤 User D                                                  │   │
 * │   │    "Jalan Bangsar is still clear for cars!"                  │   │
 * │   │                                                               │   │
 * │   └─────────────────────────────────────────────────────────────┘   │
 * │                                                                      │
 * │   HOW RADIUS WORKS:                                                  │
 * │   • User's GPS position is used as center point                     │
 * │   • All users within 2km radius are in the same "chat zone"        │
 * │   • As user moves, they may enter/leave different chat zones        │
 * │   • Messages tagged with approximate location                       │
 * │   • Zone automatically adjusts based on population density          │
 * │                                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * CHAT FEATURES:
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 💬 Text Messages     │ Basic text chat within 2km zone              │
 * │ 📍 Location Sharing  │ Pin your exact location for helpers          │
 * │ 📷 Photo Sharing     │ Share photos of flood conditions             │
 * │ 🆘 SOS Broadcast     │ Emergency alert to all nearby users         │
 * │ 📊 Status Updates    │ "Road X is clear" / "Water at 30cm"         │
 * │ 👥 Active Users      │ See how many people are in your zone        │
 * │ 🏥 Shelter Alerts    │ Shelter admins broadcast capacity updates   │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * TECHNICAL IMPLEMENTATION:
 * ─────────────────────────
 * Frontend:
 *   • New page: src/pages/CommunityPage.tsx
 *   • Chat UI with message bubbles, timestamps, user badges
 *   • "Active nearby" counter showing users in 2km radius
 *   • Quick-action buttons: SOS, Share Location, Report Flood
 *   • Tab: Chat | Reports | Map View
 *   • Auto-scroll, message notifications
 *   • Anonymous usernames (e.g., "User-3F7A") for privacy
 * 
 * Backend (Firebase / Supabase Realtime):
 *   • Collection: chat_messages
 *   • Fields: { userId, text, position, timestamp, zoneId, type }
 *   • Geohash-based zone ID for efficient querying
 *   • Real-time subscription filtered by zone
 *   • Message retention: 24 hours (emergency data, not permanent)
 * 
 * Zone Calculation:
 *   • Geohash precision 5 (~5km grid) → group users
 *   • Filter messages where haversineDistance(userPos, msgPos) <= 2km
 *   • Update zone subscription when user moves >500m
 * 
 * Data Model:
 *   interface ChatMessage {
 *       id: string;
 *       zoneId: string;          // Geohash-based zone identifier
 *       userId: string;          // Anonymous user ID
 *       displayName: string;     // "User-3F7A" format
 *       text: string;
 *       type: 'message' | 'location' | 'sos' | 'photo' | 'status';
 *       position: Coordinates;   // Where message was sent from
 *       photoUrl?: string;
 *       timestamp: Date;
 *       distance?: number;       // Calculated on client: km from viewer
 *   }
 * 
 *   interface ChatZone {
 *       zoneId: string;
 *       center: Coordinates;
 *       radiusKm: number;       // 2km default
 *       activeUsers: number;
 *       messageCount: number;
 *       lastActivity: Date;
 *   }
 * 
 * 
 * RECOMMENDED TECH FOR PLANNED FEATURES:
 * ═══════════════════════════════════════
 * 
 * Option A: Firebase (Google) — Recommended for simplicity
 *   • Firebase Realtime Database — for live chat & flood reports
 *   • Firebase Auth — anonymous authentication
 *   • Firebase Storage — for uploaded photos
 *   • Firebase Cloud Functions — auto-cleanup of expired data
 *   • FREE TIER: 1GB storage, 10GB download/month, 100 simultaneous connections
 * 
 * Option B: Supabase (Open Source) — Recommended for control
 *   • Supabase Realtime — WebSocket-based live updates
 *   • Supabase Auth — anonymous + social login
 *   • Supabase Storage — for photos
 *   • PostGIS extension — native geospatial queries
 *   • FREE TIER: 500MB database, unlimited API requests
 */


// ═══════════════════════════════════════════════════════════════════════════
// 8. FUTURE ENHANCEMENTS (Beyond Current Scope)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * 🚀 HIGH PRIORITY (After Crowd-Sourcing & Chat):
 * ═════════════════════════════════════════════════
 * 
 * 1. REAL-TIME RAINFALL API INTEGRATION
 *    • Replace simulated data with live weather data
 *    • RECOMMENDED: Open-Meteo (https://open-meteo.com/) — FREE, no API key
 *    • Example: GET https://api.open-meteo.com/v1/forecast?
 *        latitude=3.1390&longitude=101.6869&
 *        hourly=temperature_2m,precipitation,rain&
 *        timezone=Asia/Kuala_Lumpur
 * 
 * 2. FLOOD-AWARE ROUTE AVOIDANCE
 *    • Integrate crowd-sourced flood reports into routing
 *    • If a road is reported flooded → route avoids it automatically
 *    • OSRM waypoint exclusion zones around flooded areas
 *    • Weighted cost: clear=1, caution=3, flooded=∞
 * 
 * 3. PUSH NOTIFICATIONS (PWA)
 *    • Service Worker for background notifications
 *    • Auto-alert when danger threshold reached in user's area
 *    • Evacuation reminders and shelter capacity updates
 * 
 * 4. USER LOCATION AUTO-DETECTION
 *    • Browser Geolocation API for automatic position
 *    • Real-time GPS tracking during navigation
 *    • Auto-select nearest location on app start
 * 
 * 
 * 📊 MEDIUM PRIORITY:
 * ═══════════════════
 * 
 * 5. FLOOD ZONE HEAT MAP
 *    • Overlay flood-prone zones on the map
 *    • Historical flood area data
 *    • Color gradient: green (safe) → yellow → red (high risk)
 * 
 * 6. EMERGENCY CONTACTS
 *    • Local emergency hotlines (999, JBPM, bomba)
 *    • One-tap emergency call buttons
 *    • Share location with family via SMS/WhatsApp
 * 
 * 7. OFFLINE MODE (PWA)
 *    • Cache shelter locations and routes
 *    • Work without internet connection
 *    • Save last-known predictions
 * 
 * 8. ENHANCED ML MODEL
 *    • Retrain with 2011-2024 rainfall data
 *    • Add features: soil moisture, river levels, IoT sensor data
 *    • LSTM for time-series prediction (multi-hour forecast)
 *    • Ensemble model combining ANN + LSTM for accuracy
 * 
 * 
 * 🎨 NICE-TO-HAVE:
 * ════════════════
 * 
 * 9.  Multi-language support (BM, English, Chinese, Tamil)
 * 10. Admin dashboard for shelter capacity management
 * 11. User accounts with saved locations & alert preferences
 * 12. Accessibility (screen reader, high contrast, voice nav)
 * 13. IoT sensor integration (ultrasonic river level sensors)
 * 14. Evacuation countdown timer based on water rise prediction
 */


// ═══════════════════════════════════════════════════════════════════════════
// 9. API REFERENCE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BACKEND API (FastAPI @ http://localhost:8000)
 * ═════════════════════════════════════════════
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ENDPOINT: POST /predict                                                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Description: Get flood prediction based on monthly rainfall data        │
 * │                                                                         │
 * │ Request Body:                                                           │
 * │ {                                                                       │
 * │   "JAN": 170.3, "FEB": 165.4, "MAR": 240.8, "APR": 259.5,           │
 * │   "MAY": 204.4, "JUN": 125.8, "JUL": 127.5, "AUG": 156.3,           │
 * │   "SEP": 192.7, "OCT": 253.0, "NOV": 288.3, "DEC": 245.8,           │
 * │   "ANNUAL_RAINFALL": 2429.8                                            │
 * │ }                                                                       │
 * │                                                                         │
 * │ Response:                                                               │
 * │ {                                                                       │
 * │   "flood_probability": 0.73,    // 0.0 - 1.0                           │
 * │   "flood_predicted": true,      // Above 0.5 threshold                 │
 * │   "risk_level": "danger",       // "safe" | "warning" | "danger"       │
 * │   "confidence": 0.46            // Model confidence                    │
 * │ }                                                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ENDPOINT: GET /health                                                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Response: { "status": "healthy", "model_loaded": true }                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * OSRM ROUTING API (router.project-osrm.org)
 * ═══════════════════════════════════════════
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ENDPOINT: GET /route/v1/{profile}/{coords}                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Profiles: driving | foot                                                │
 * │ Coords: {lng1},{lat1};{lng2},{lat2}                                    │
 * │ Params: overview=full&geometries=geojson&steps=true                    │
 * │                                                                         │
 * │ Response: GeoJSON geometry + turn-by-turn steps + distance/duration    │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * 
 * RUNNING THE PROJECT:
 * ═══════════════════
 * 
 * # Terminal 1: Start Backend
 * cd backend
 * pip install fastapi uvicorn tensorflow numpy pydantic
 * uvicorn main:app --reload
 * 
 * # Terminal 2: Start Frontend
 * cd FloodWay
 * npm install
 * npm run dev
 * 
 * # Access:
 * Frontend: http://localhost:5173
 * Backend:  http://localhost:8000
 * API Docs: http://localhost:8000/docs (Swagger UI)
 */


// ═══════════════════════════════════════════════════════════════════════════
// END OF DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export default function FloodWayDocs() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">📄 FloodWay Documentation</h1>
            <p className="text-muted-foreground">
                This file contains comprehensive documentation for the FloodWay project.
                View the source code comments for detailed information about:
            </p>
            <ul className="mt-4 space-y-2">
                <li>• System Architecture</li>
                <li>• AI/ML Flood Prediction Model (ANN)</li>
                <li>• Real-Road Navigation (OSRM + Transport Modes)</li>
                <li>• Tech Stack Details</li>
                <li>• Current Features & Achievements</li>
                <li>• Planned Features (Crowd-Sourcing & Community Chat)</li>
                <li>• Future Enhancements & Free API Recommendations</li>
                <li>• API Reference</li>
            </ul>
        </div>
    );
}
