import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { WorkoutHistory } from './pages/WorkoutHistory';
import SessionDetail from './pages/SessionDetails';   // ← BARU

// ============================================
// Router setup — sama konsepnya dengan Next.js
// tapi manual. BrowserRouter = provider,
// Routes = switch, Route = satu halaman.
//
// Layout wraps semua pages (sidebar + mobile nav)
// ============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Routes lama */}
          <Route index element={<Dashboard />} />
          <Route path="progress" element={<Progress />} />
          <Route path="history" element={<WorkoutHistory />} />

          {/* Route baru — detail satu session */}
          <Route path="sessions/:sessionId" element={<SessionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;