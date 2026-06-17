import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { SchoolListPage } from './pages/SchoolList';
import { RiskInspectionPage } from './pages/RiskInspection';
import { RectificationPage } from './pages/Rectification';
import { RectificationModal } from './components/features/RectificationModal';
import { EventDetailDrawer } from './components/features/EventDetailDrawer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SchoolListPage />} />
          <Route path="/schools" element={<SchoolListPage />} />
          <Route path="/risk-inspection" element={<RiskInspectionPage />} />
          <Route path="/rectification" element={<RectificationPage />} />
        </Route>
      </Routes>
      <RectificationModal />
      <EventDetailDrawer />
    </Router>
  );
}
