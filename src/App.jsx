import { Routes, Route, Navigate } from 'react-router-dom';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import Toast from './components/ui/Toast';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}

