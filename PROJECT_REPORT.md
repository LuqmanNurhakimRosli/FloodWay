# FloodWay — Project Report

**Project Title:** FloodWay: AI-Powered Flood Preparedness & Evacuation System  
**Date:** February 15, 2026  
**Status:** Version 2.0 (Prototype)

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

It integrates historical data modeling, real-time routing algorithms, and Generative AI to provide a "Survival Dashboard" for flood prone communities.

---

## 3. Core Features

### Feature 1: Hyperlocal AI Flood Prediction (Multimodal Sensor Fusion)
A state-of-the-art "Hybrid Brain" system that cross-references theoretical risk with physical reality.
-   **Architecture**: **Two-Stage Pipeline** (The Eye + The Brain).
-   **Stage 1 (The Eye - CV)**: A Computer Vision model watches CCTV feeds to extract real-time water levels (Ground Truth Calibration).
-   **Stage 2 (The Brain - LSTM)**: An LSTM model fuses this physical data with rainfall forecasts to predict future flood levels.
-   **Innovation**: Eliminates false negatives by verifying *actual* conditions on the ground, not just weather forecasts.

### Feature 2: Intelligent Risk-Aware Navigation
A specialized routing system that guides users to the nearest safe relief shelter (PPS).
-   **Function**: Calculates the safest path for driving, motorcycling, or walking.
-   **Innovation**: Unlike standard GPS, FloodWay aims to **avoid** known flood zones.
-   **Algorithm**: Uses **Contraction Hierarchies (CH)** via OSRM (Open Source Routing Machine) combined with a custom "Cluster-Dodge" heuristic to detour around active hazard zones.

### Feature 3: Multimodal Crowdsourced Reporting (Gemini AI Integrated)
A "Waze-like" reporting system that uses Generative AI to verify community submissions.
-   **Function**: Users upload a photo and description of flooded areas.
-   **Innovation**: **Gemini 1.5 Flash (Multimodal AI)** analyzes the image + text to verify if it is a genuine flood and estimates severity before placing it on the public map.
-   **Goal**: Eliminates fake news and provides verified ground-truth data for the navigation algorithm.

---

## 4. Algorithms & Technology

### A. Flood Prediction Model (The "Hybrid Brain")
-   **Core Concept**: **Multimodal Sensor Fusion**.
-   **1. Input Layer (The Senses)**:
    -   **Input A (Historical)**: Past 24h Rain + River Levels.
    -   **Input B (Forecast)**: Next 6h Rain Forecast (API).
    -   **Input C (Visual - Ground Truth)**: CCTV Feed → **CV Extraction** → `Current_Water_Level_Meters`.
-   **2. Fusion Layer (The Merge)**:
    -   Concatenates inputs into a single vector: `[Rain_24h, Rain_Forecast, CV_Level_Now]`.
-   **3. Prediction Layer (The Brain)**:
    -   **Model**: **LSTM (Long Short-Term Memory)** network.
    -   **Output**: `Predicted_Level_Next_Hour` (in meters) with confidence interval.

### B. Pathfinding & Routing
-   **Core Algorithm**: **Contraction Hierarchies (CH)**.
    -   CH pre-processes the road network to enable millisecond-level routing queries.
    -   We utilize the OSRM engine which implements CH for optimal path retrieval.
-   **Dynamic Avoidance**: **"Cluster-Dodge" Heuristic**.
    -   The system identifies the centroid of flood zones.
    -   It generates "Repulsion Waypoints" to force the OSRM engine to calculate an alternative path that bypasses the danger area.

### C. Report Verification (Gemini AI Integration)
-   **Model**: **Google Gemini 1.5 Flash**.
-   **Task**: Multimodal Classification & Extraction.
-   **Workflow**:
    1.  **Input**: User Image ($I$) + detailed text description ($T$).
    2.  **Prompting**: System sends prompt: *"Analyze this image. Is there visible flooding? Estimate water depth (low/med/high). formatted as JSON."*
    3.  **Verification**:
        -   If `Confidence > 85%` → Auto-Verify.
        -   If `Confidence < 50%` → Reject.
    4.  **Feedback**: System instructs user based on analysis (e.g., "Water depth looks dangerous, do not cross").

---

## 5. Technical Architecture

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind | High performance, component-based UI. |
| **Maps** | Leaflet.js, OpenStreetMap | Lightweight, customizable layers for flood zones. |
| **Routing** | OSRM (Project-OSRM) | Fast, reliable road network routing. |
| **AI (Vision)** | **Gemini 1.5 Flash API** | Best-in-class speed and multimodal capabilities for real-time verification. |
| **State** | Zustand | Simple global state management for navigation/predictions. |

---

## 6. Future Roadmap

1.  **IoT Integration**: Connect directly to DID (Department of Irrigation and Drainage) river sensors.
2.  **Offline Mode**: Enable Bluetooth Mesh networking for "Community Chat" when cell towers fail.
3.  **Augmented Reality (AR)**: Visualize flood water levels through the camera lens before they happen.

---

*Verified by Luqman Nurhakim*  
*FloodWay Team*
