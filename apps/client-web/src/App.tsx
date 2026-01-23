import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import SignInForm from "./components/sign-in/SignInForm";
import DashboardPage from "./components/dashboard/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SignInForm />} />
        </Route>

        {/* ---------- PROTECTED ROUTES ---------- */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
