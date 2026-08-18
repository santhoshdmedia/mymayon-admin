import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import Districts  from "./pages/Districts";
import Packages   from "./pages/Packages";
import Enquiries  from "./pages/Enquiries";
import Settings   from "./pages/Settings";
import { Spinner } from "./components/ui";

function Guard({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><AdminLayout /></Guard>}>
            <Route index              element={<Dashboard />} />
            <Route path="districts"  element={<Districts />} />
            <Route path="packages"   element={<Packages />} />
            <Route path="enquiries"  element={<Enquiries />} />
            <Route path="settings"   element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
