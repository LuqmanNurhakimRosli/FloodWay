import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import { WelcomePage } from './pages/WelcomePage';
import { LocationPage } from './pages/LocationPage';
import { PredictionPage } from './pages/PredictionPage';
import { ShelterPage } from './pages/ShelterPage';
import { NavigationPage } from './pages/NavigationPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/shelters" element={<ShelterPage />} />
          <Route path="/navigation/:shelterId" element={<NavigationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;
