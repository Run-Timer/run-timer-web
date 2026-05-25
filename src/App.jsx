import { useEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Competitions from "./pages/Competitions";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ParticipantProfile from "./pages/ParticipantProfile";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./pages/EditProfile";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Rutas Privadas Protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/competitions" element={
          <ProtectedRoute>
            <Competitions />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/participantProfile" element={
          <ProtectedRoute>
            <ParticipantProfile />
          </ProtectedRoute>
        } />
        <Route path="/editProfile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // ESCUCHA E INICIALIZACIÓN GLOBAL DEL TEMA
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
      <AnimatedRoutes />
    </div>
  );
}

export default App;