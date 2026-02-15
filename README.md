# FloodWay — AI-Powered Flood Preparedness & Evacuation System 🌊

![FloodWay Banner](https://via.placeholder.com/1200x300?text=FloodWay+Project+Banner)

> **"Because every minute matters during a flood."**

[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.x-yellow?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🧐 About the Project

During floods, victims don't just need to know **if** it will flood — they need to know **when** water will reach their home and **which road is safe** to take to a shelter. Current navigation apps calculate traffic but often fail to account for water depth or flood risk.

**FloodWay** is a mobile-first platform designed to solve this problem. It combines smart flood prediction with risk-aware evacuation routing to guide users to safety.

**Problem Statement:**
Typical navigation apps send users through the fastest route, which might be flooded. FloodWay prioritizes **safety** over speed.

---

## ✨ Key Features

### ✅ 1. Smart Flood Time-Prediction (The "When")
Predicts flood probability for specific areas using an **Artificial Neural Network (ANN)** trained on 10 years of historical rainfall data.
- **Input**: Monthly rainfall data.
- **Output**: Real-time flood probability (Safe / Warning / Danger).
- **Visuals**: 24-hour interactive timeline.

### ✅ 2. Risk-Aware Evacuation Routing (The "Where")
Guides users to the safest nearby shelter using **real-road navigation**.
- **Engine**: OSRM (Open Source Routing Machine).
- **Capabilities**: Avoids rivers and high-risk zones.
- **Modes**: 🚗 Car, 🏍️ Motorcycle, 🚶 Walk.

### 🔮 3. Community Crowd-Sourcing (Planned)
"Waze for Floods" — Users can report real-time conditions (e.g., "Road Flooded", "Water Rising") to update the map for everyone.

### 🔮 🔮 4. Community Chat (Planned)
Hyperlocal chat for users within a 2km radius to coordinate help and share updates during emergencies.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React

### Backend & Data
- **API**: Python (FastAPI)
- **ML Model**: TensorFlow/Keras (ANN)
- **Routing**: OSRM (OpenStreetMap)

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/LuqmanNurhakim/FloodWay.git
    cd FloodWay
    ```

2.  **Backend Setup**
    Navigate to the backend folder and install dependencies:
    ```bash
    cd backend
    pip install fastapi uvicorn tensorflow numpy pydantic
    ```
    Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    *The backend will run at `http://localhost:8000`*

3.  **Frontend Setup**
    Open a new terminal, navigate to the project root, and install dependencies:
    ```bash
    # (Ensure you are in the FloodWay root directory)
    npm install
    ```
    Start the development server:
    ```bash
    npm run dev
    ```
    *The frontend will run at `http://localhost:5173`*

---

## 📱 Usage

1.  **Home Screen**: Select "Get Started" to enter the app.
2.  **Prediction**: Check the current flood risk for your area.
3.  **Navigation**:
    - Select a destination (Shelter).
    - Choose your transport mode (Car/Moto/Walk).
    - Follow the safest route on the map.

![App Screenshot](https://via.placeholder.com/800x400?text=App+Screenshot+Placeholder)

---

## 🗺 Roadmap

- [x] Flood Prediction Model (ANN)
- [x] Real-Road Navigation (OSRM)
- [x] Multi-Transport Modes
- [ ] Crowd-Sourcing Reports (Firebase Integration)
- [ ] Community Chat System (Geohash)
- [ ] Push Notifications for Alerts

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please verify `CONTRIBUTING.md` for detailed guidelines.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Luqman Nurhakim** - Project Author

Project Link: [https://github.com/LuqmanNurhakimRosli/FloodWay](https://github.com/LuqmanNurhakimRosli/FloodWay)
