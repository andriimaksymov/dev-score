import { Suspense, lazy } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Route-level code splitting: the landing page ships without the dashboard
// bundles, and each analysis flow loads only when visited.
const HomePage = lazy(() => import('./pages/HomePage'));
const AnalysisResultsPage = lazy(() => import('./pages/AnalysisResultsPage'));
const CvAnalysisPage = lazy(() => import('./pages/CvAnalysisPage'));
const LinkedinAnalysisPage = lazy(() => import('./pages/LinkedinAnalysisPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-transparent">
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

const RouteFallback = () => (
  <div role="status" className="flex min-h-screen items-center justify-center bg-slate-50">
    <Loader2 size={40} className="animate-spin text-violet-600" aria-hidden />
    <span className="sr-only">Loading page</span>
  </div>
);

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path="/analysis/:username" element={<AnalysisResultsPage />} />
          <Route path="/linkedin" element={<LinkedinAnalysisPage />} />
          <Route path="/cv" element={<CvAnalysisPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
