import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { SchoolListPage } from './pages/SchoolList';
import { RiskInspectionPage } from './pages/RiskInspection';
import { RectificationPage } from './pages/Rectification';
import { InspectionTasksPage } from './pages/InspectionTasks';
import { RectificationModal } from './components/features/RectificationModal';
import { EventDetailDrawer } from './components/features/EventDetailDrawer';
import { CreateTaskModal } from './components/features/CreateTaskModal';
import { TaskDetailModal } from './components/features/TaskDetailModal';
import { LedgerModal } from './components/features/LedgerModal';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SchoolListPage />} />
          <Route path="/schools" element={<SchoolListPage />} />
          <Route path="/risk-inspection" element={<RiskInspectionPage />} />
          <Route path="/rectification" element={<RectificationPage />} />
          <Route path="/inspection-tasks" element={<InspectionTasksPage />} />
        </Route>
      </Routes>
      <RectificationModal />
      <EventDetailDrawer />
      <CreateTaskModal />
      <TaskDetailModal />
      <LedgerModal />
    </Router>
  );
}
