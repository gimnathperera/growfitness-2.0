import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardPage from "./components/dashboard/DashboardPage";
import SignInPage from "./pages/SignInPage";
import BookAFreeSession from "./pages/BookAFreeSession";
import { KidProvider } from "./contexts/kid/KidProvider";

// Create a wrapper component that conditionally applies KidProvider
function DashboardWrapper() {
  const { role } = useAuth();
  
  if (role === 'PARENT') {
    return (
      <KidProvider>
        <DashboardPage />
      </KidProvider>
    );
  }
  
  return <DashboardPage />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/free-session" element={<BookAFreeSession />} />
        </Route>

        {/* ---------- PROTECTED ROUTES ---------- */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardWrapper />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;