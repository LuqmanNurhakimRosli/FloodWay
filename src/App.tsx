import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './store';
import { WelcomePage } from './pages/WelcomePage';
import { LoadingPage } from './pages/LoadingPage';
import { HomePage } from './pages/HomePage';
import { PredictionPage } from './pages/PredictionPage';
import { ShelterPage } from './pages/ShelterPage';
import { NavigationPage } from './pages/NavigationPage';
import { FutureWorkPage } from './pages/FutureWorkPage';
import { BottomNav } from './components/BottomNav';
import './App.css';

// Pages that should show the bottom navigation
const BOTTOM_NAV_PAGES = ['/home', '/forecast', '/shelters', '/reports', '/chat', '/profile'];

function AppLayout() {
  const location = useLocation();
  const showBottomNav = BOTTOM_NAV_PAGES.includes(location.pathname);

  return (
    <div className="app">
      <Routes>
        {/* Onboarding Flow (no bottom nav) */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/loading" element={<LoadingPage />} />

        {/* Main App (with bottom nav) */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/forecast" element={<PredictionPage />} />
        <Route path="/shelters" element={<ShelterPage />} />
        <Route path="/reports" element={<FutureWorkPage />} />
        <Route path="/chat" element={<FutureWorkPage />} />
        {/* <Route path="/profile" element={<FutureWorkPage />} /> */}

        {/* Full-screen pages (no bottom nav) */}
        <Route path="/navigation/:shelterId" element={<NavigationPage />} />

        {/* Legacy redirect */}
        <Route path="/location" element={<Navigate to="/loading" replace />} />
        <Route path="/prediction" element={<Navigate to="/forecast" replace />} />
        <Route path="/shellter" element={<Navigate to="/shelters" replace />} />
        <Route path="/sheller" element={<Navigate to="/shelters" replace />} />
        <Route path="/shelter" element={<Navigate to="/shelters" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
