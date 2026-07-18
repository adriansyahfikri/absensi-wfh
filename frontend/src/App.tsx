import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Role } from './api/types';
import { LoginPage } from './pages/LoginPage';
import { CheckInPage } from './pages/CheckInPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === Role.ADMIN ? '/admin' : '/check-in'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleHome />} />

      <Route element={<ProtectedRoute allow={[Role.EMPLOYEE]} />}>
        <Route path="/check-in" element={<CheckInPage />} />
      </Route>

      <Route element={<ProtectedRoute allow={[Role.ADMIN]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
