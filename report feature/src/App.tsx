import { useState, useCallback } from 'react';
import type { FloodReport, AIVerificationResult, AutoTags, AppScreen, ReportFormOutput } from './types';
import { ReportCategory, VerificationStatus } from './types';
import MapScreen from './components/MapScreen';
import EmergencyMode from './components/EmergencyMode';
import AIVerification from './components/AIVerification';
import ReportForm from './components/ReportForm';
import { useGeolocation } from './hooks/useGeolocation';

function App() {
  const [screen, setScreen] = useState<AppScreen>('MAP');
  const [reports, setReports] = useState<FloodReport[]>([]);

  const geo = useGeolocation();

  // Pending report being verified
  const [pendingReport, setPendingReport] = useState<Omit<
    FloodReport,
    'id' | 'aiResult' | 'createdAt'
  > | null>(null);

  // ── Transitions ──
  const handleActivateEmergency = useCallback(() => {
    setScreen('EMERGENCY');
  }, []);

  const handleCancelEmergency = useCallback(() => {
    setScreen('MAP');
    setPendingReport(null);
  }, []);

  const handleSubmitEvidence = useCallback(
    (data: {
      photoDataURLs: string[];
      category: ReportCategory;
      description: string;
      autoTags: AutoTags;
    }) => {
      setPendingReport(data);
      setScreen('VERIFICATION');
    },
    [],
  );

  const handleVerificationComplete = useCallback(
    (result: AIVerificationResult) => {
      if (!pendingReport) return;

      // Only add to map if not rejected
      if (result.status !== VerificationStatus.REJECTED) {
        const newReport: FloodReport = {
          id: crypto.randomUUID(),
          photoDataURLs: pendingReport.photoDataURLs,
          category: pendingReport.category,
          description: pendingReport.description,
          autoTags: pendingReport.autoTags,
          aiResult: result,
          createdAt: new Date().toISOString(),
        };
        setReports((prev) => [newReport, ...prev]);
      }

      setPendingReport(null);
      setScreen('MAP');
    },
    [pendingReport],
  );

  const handleRetry = useCallback(() => {
    setScreen('EMERGENCY');
    setPendingReport(null);
  }, []);

  // ── Report Form ──
  const handleActivateReport = useCallback(() => {
    setScreen('REPORT');
  }, []);

  const handleReportSubmit = useCallback((data: ReportFormOutput) => {
    console.log('📋 Report submitted:', data);
    setScreen('MAP');
  }, []);

  const handleSafe = useCallback(() => {
    console.log('💚 User marked safe at:', geo.lat, geo.lng);
    setScreen('MAP');
  }, [geo.lat, geo.lng]);

  return (
    <>
      {screen === 'MAP' && (
        <MapScreen
          reports={reports}
          onActivateEmergency={handleActivateEmergency}
          onActivateReport={handleActivateReport}
        />
      )}

      {screen === 'EMERGENCY' && (
        <EmergencyMode
          onSubmit={handleSubmitEvidence}
          onCancel={handleCancelEmergency}
        />
      )}

      {screen === 'VERIFICATION' && pendingReport && (
        <AIVerification
          report={pendingReport}
          onComplete={handleVerificationComplete}
          onRetry={handleRetry}
        />
      )}

      {screen === 'REPORT' && (
        <ReportForm
          userLocation={{
            lat: geo.lat ?? 3.1412,
            lng: geo.lng ?? 101.6865,
            accuracy: geo.accuracy ?? 12.5,
          }}
          onSubmit={handleReportSubmit}
          onSafe={handleSafe}
          onCancel={() => setScreen('MAP')}
        />
      )}
    </>
  );
}

export default App;
