import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { KidsPage } from './pages/KidsPage';
import { SessionsPage } from './pages/SessionsPage';
import { RequestsPage } from './pages/RequestsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { LocationsPage } from './pages/LocationsPage';
import { BannersPage } from './pages/BannersPage';
import { AuditPage } from './pages/AuditPage';
import { CodesPage } from './pages/CodesPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { ReportsPage } from './pages/ReportsPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { Layout } from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="kids" element={<KidsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="codes" element={<CodesPage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
