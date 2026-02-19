# FloodWay — Project Report

**Project Title:** FloodWay: AI-Powered Flood Preparedness & Evacuation System  
**Date:** February 20, 2026  
**Status:** Version 2.1 (Beta Candidate)

---

## 1. Problem Statement

Floods in Malaysia are annual disasters that cause significant confusion and panic. While general weather forecasts exist, victims lack **actionable, hyperlocal intelligence** during the critical hours of a disaster.

**Key Issues Identified:**
1.  **"When will it hit me?"**: Users don't know the exact time floodwaters will reach dangerous levels at their specific location.
2.  **"Where do I go?"**: Evacuation routes often become flooded themselves, and standard navigation apps (Waze/Google Maps) do not account for real-time water depth.
3.  **"Is this report real?"**: Social media is flooded with unverified panic, making it hard to identify genuine emergencies vs. old photos.

---

## 2. Solution Overview: The FloodWay System

FloodWay is a comprehensive mobile application designed to guide users through the entire disaster lifecycle: **Prediction → Decision → Evacuation.**

It integrates historical data modeling, real-time routing algorithms, and Generative AI to provide a "Survival Dashboard" for flood-prone communities.

---

## 3. Core Features (Current Implementation)

### Feature 1: Hyperlocal AI Flood Prediction (Multimodal Sensor Fusion)
A state-of-the-art "Hybrid Brain" system that cross-references theoretical risk with physical reality.
-   **The Eye (Computer Vision)**: Analyzes CCTV feeds to extract real-time water levels (Ground Truth Calibration).
-   **The Brain (LSTM Model)**: Fuses physical data with rainfall forecasts to predict future flood levels with high accuracy.
-   **User Benefit**: Provides early warnings specific to the user's GPS location.

### Feature 2: Intelligent Risk-Aware Navigation & Shelter Mapping
A specialized routing system that guides users to the nearest safe relief shelter (Pusat Pemindahan Sementara - PPS).
-   **Shelter Locator**: Displays all active PPS within a 10km radius with real-time capacity status.
-   **Safe Routing**: Uses **Contraction Hierarchies (CH)** via OSRM to calculate paths that explicitly **avoid known flood zones**.
-   **Visual Awareness**: Displays flood zones and verified user reports directly on the map layer.

### Feature 3: Community Sentinel (Dual AI + Human Verified Reporting)
A "Waze-like" C2C (Community-to-Community) reporting system with a **two-layer verification** approach for maximum accuracy.
-   **Emergency Mode**: A high-contrast, large-button interface for users in distress to quickly snap photos and report situations.
-   **Layer 1 — AI Verification (Gemini 1.5 Flash)**:
    -   **Image Analysis**: Instantly scans uploaded photos to detect water presence, estimate depth, and identify hazards.
    -   **Instant Verdict**: The system displays a clear **"✅ Verified!"** or **"❌ Not Verified"** result to the user after analysis.
    -   **Fake News Filter**: Rejects non-flood images or low-confidence reports to prevent panic.
-   **Layer 2 — Human Moderator Review (Future Enhancement)**:
    -   All AI-verified reports are **queued for human moderator confirmation** before being permanently published.
    -   Reports flagged as "Not Verified" by AI are **escalated to a human moderator** for a second opinion.
    -   This dual approach ensures the highest possible accuracy by combining AI speed with human judgment.
-   **Global Alerting**: Verified reports are pushed to the global map, creating dynamic "Danger Zones" other users are routed around.

---

## 4. Algorithms & Technology

### A. Tech Stack (Modern Web & AI)
-   **Frontend**: React 19, TypeScript, Tailwind CSS v4 (Mobile-First Design).
-   **Build Tooling**: Vite.
-   **Maps & Geospatial**: Leaflet.js, React-Leaflet, OpenStreetMap.
-   **AI Engine**: Google Gemini 1.5 Flash (Multimodal Vision API).
-   **State Management**: Zustand (Global Store), Context API.

### B. The Dual Verification Pipeline (AI + Human)
1.  **Input**: User captures image $I$ + Description $D$.
2.  **AI Processing**: Gemini 1.5 Flash accepts $(I, D)$ and outputs a JSON object:
    ```json
    {
      "waterDetected": true,
      "confidence": 92,
      "severity": "HIGH",
      "depthEstimate": "0.5m - 1.0m"
    }
    ```
3.  **AI Decision**:
    -   If `waterDetected == true` AND `confidence > 80%` → Display **"✅ Verified!"** to user.
    -   Else → Display **"❌ Not Verified"** to user.
4.  **Human Review (Layer 2)**:
    -   **Verified reports** → Queued for human moderator confirmation before final publication on the public map.
    -   **Not Verified reports** → Escalated to human moderator for a second review (could override AI decision).
    -   *Note: Human review module is planned for future implementation. Currently, the system relies on AI verification with the UI framework for human review already in place.*

---

## 5. Target Audience

### Primary: Residents in Flood-Prone Areas
-   **Demographic**: Families living in low-lying areas (e.g., East Coast Malaysia, Klang Valley hotspots).
-   **Needs**: Early warning, safe evacuation routes, and a way to call for help/report issues.

### Secondary: Emergency Responders & Authorities
-   **Demographic**: NADMA, Civil Defence Force (APM), Fire & Rescue (Bomba).
-   **Needs**: Real-time "ground truth" situational awareness to deploy assets efficiently.

### Tertiary: Travelers & Commuters
-   **Needs**: Real-time road status updates to avoid getting stranded in flash floods.

---

## 6. Marketing Strategy

### Phase 1: "The Waze for Floods" (Community Growth)
-   **Social Proof Campaign**: Launch on TikTok/Twitter during the monsoon season emphasizing the app's ability to "save your car/life."
-   **Gamification**: Introduce "Sentinel Badges" for top reporters whose submissions are AI-verified and helpful to others.

### Phase 2: Strategic Partnerships
-   **Local Integration**: Partner with "Rukun Tetangga" (Neighborhood Watch) in high-risk zones to have designated "Community Sentinels" trained to use the app.
-   **Data Exchange**: Offer anonymized, verified flood data to insurance companies in exchange for sponsorship/funding.

### Phase 3: Institutional Adoption 
-   **Official Channel**: Pitch to NADMA for integration as an official auxiliary tool for disaster management.

---

## 7. Market Potential & Economic Impact

The annual recurrence of floods in Malaysia creates a compelling economic case for FloodWay. The cost of *reactive* repairs far outweighs the investment in *proactive* intelligence.

### A. Economic Impact (The "Cost of Inaction")
Recent data from the Department of Statistics Malaysia (DOSM) highlights the massive financial drain caused by floods, particularly on public infrastructure:

| Year | Total Economic Losses | Infrastructure & Public Assets Damage |
| :--- | :--- | :--- |
| **2021** | RM 6.1 Billion | **RM 2.0 Billion** |
| **2022** | RM 600 Million | **RM 232.7 Million** |
| **2023** | RM 755.4 Million | **RM 380.7 Million** |

*Key Insight:* Infrastructure repair consistently accounts for a significant portion (30-40%) of total flood losses. FloodWay aims to reduce this by enabling early warnings that allow assets (vehicles, machinery, portable infrastructure) to be moved *before* water levels rise.

### B. Potential Clients & Buyers

#### 1. Government Sector (B2G)
*   **NADMA (National Disaster Management Agency):**
    *   *Use Case:* As the central command dashboard for real-time situational awareness during monsoon seasons.
*   **Local Municipal Councils (PBTs such as DBKL, MBSJ):**
    *   *Use Case:* Hyperlocal monitoring of flash flood hotspots in urban areas to deploy rapid response teams.
*   **Ministry of Works (KKR) / JKR:**
    *   *Use Case:* Integration with traffic management systems to automatically close flooded roads and divert traffic, protecting road infrastructure.

#### 2. Private Sector (B2B)
*   **Logistics & Supply Chain Firms (e.g., Pos Laju, J&T, Haulage Associations):**
    *   *Value Prop:* "Risk-Aware Routing" saves millions in delayed deliveries and damaged fleets by navigating trucks *around* predicting flooding zones.
*   **Insurance Companies:**
    *   *Value Prop:* Risk mitigation. Providing the app to policyholders reduces vehicle damage claims. Aggregated data can also refine actuarial risk models.
*   **Highway Concessionaires (e.g., PLUS, Prolintas):**
    *   *Value Prop:* Real-time user alerting for highway operational safety and detour management.

---

## 8. Future Roadmap

1.  **IoT Integration**: Connect directly to DID (Department of Irrigation and Drainage) river sensors.
2.  **Offline Mesh Networking**: Enable Bluetooth `Bridgefy` technology to allow "Community Chat" and alerts to propagate even when cell towers are down.
3.  **AR Flood Visualization**: Use the camera to overlay predicted water levels on the real-world view (Augmented Reality).
4.  **Drone Scouting Integration**: API support for autonomous drones to upload aerial surveys for AI analysis.

---

*Verified by Luqman Nurhakim*  
*FloodWay Team*
