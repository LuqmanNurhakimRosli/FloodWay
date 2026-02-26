import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/WelcomePage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoadingPage } from './pages/LoadingPage';
import { HomePage } from './pages/HomePage';
import { ShelterPage } from './pages/ShelterPage';
import { NavigationPage } from './pages/NavigationPage';
import { FutureWorkPage } from './pages/FutureWorkPage';
import { ReportPage } from './pages/ReportPage';
import { SimulationPage } from './pages/SimulationPage';
import { BottomNav } from './components/BottomNav';
import './App.css';

// Pages that should show the bottom navigation
const BOTTOM_NAV_PAGES = ['/home', '/shelters', '/reports', '/simulation', '/profile'];

// Guard: redirect unauthenticated users to login
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a minimal loader while Firebase checks auth state
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-500/30 flex items-center justify-center border border-white/10 animate-pulse">
            <span className="text-2xl">🦦</span>
          </div>
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

        {/* Onboarding (auth required) */}
        <Route path="/loading" element={<RequireAuth><LoadingPage /></RequireAuth>} />

        {/* Main App (auth required) */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/shelters" element={<RequireAuth><ShelterPage /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportPage /></RequireAuth>} />
        <Route path="/simulation" element={<RequireAuth><SimulationPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Full-screen pages (auth required) */}
        <Route path="/navigation/:shelterId" element={<RequireAuth><NavigationPage /></RequireAuth>} />

        {/* Legacy redirects */}
        <Route path="/location" element={<Navigate to="/loading" replace />} />
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
    <AuthProvider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
