import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/WelcomePage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { ShelterPage } from './pages/ShelterPage';
import { NavigationPage } from './pages/NavigationPage';
import { ReportPage } from './pages/ReportPage';
import { SimulationPage } from './pages/SimulationPage';
import { BottomNav } from './components/BottomNav';
import { IoTWidget } from './components/IoTWidget';
import { EmergencyAlert } from './components/EmergencyAlert';
import './App.css';

// Pages that should show the bottom navigation
const BOTTOM_NAV_PAGES = ['/home', '/shelters', '/reports', '/simulation', '/profile'];

// Guard: redirect unauthenticated users to login
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#060C18' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 0 32px rgba(26,115,232,0.4)' }}>
            <span className="text-2xl">🌊</span>
          </div>
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#1A73E8', borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>FloodWay</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Guard: redirect authenticated users away from login/signup
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const showBottomNav = BOTTOM_NAV_PAGES.includes(location.pathname);

  return (
    <div className="app">
      <Routes>
        {/* Public (auth) routes */}
        <Route path="/" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><SignUpPage /></RedirectIfAuthed>} />

        {/* Main App (auth required) */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/shelters" element={<RequireAuth><ShelterPage /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportPage /></RequireAuth>} />
        <Route path="/simulation" element={<RequireAuth><SimulationPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Full-screen pages (auth required) */}
        <Route path="/navigation/:shelterId" element={<RequireAuth><NavigationPage /></RequireAuth>} />

        {/* Legacy redirects */}
        <Route path="/loading" element={<Navigate to="/home" replace />} />
        <Route path="/location" element={<Navigate to="/home" replace />} />
        <Route path="/shellter" element={<Navigate to="/shelters" replace />} />
        <Route path="/sheller" element={<Navigate to="/shelters" replace />} />
        <Route path="/shelter" element={<Navigate to="/shelters" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}

      {/* IoT Integration Components */}
      <IoTWidget />
      <EmergencyAlert />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
