import {
  Suspense,
  lazy,
  useEffect,
} from "react";
import {
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

/* ─── Rutas públicas ──────────────────────────────────── */
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/register"));
const LiveRaces = lazy(() => import("./pages/LiveRaces"));

/* ─── Rutas compartidas (cualquier usuario autenticado) ── */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const ParticipantProfile = lazy(() => import("./pages/ParticipantProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const MyRobots = lazy(() => import("./pages/MyRobots"));
const Results = lazy(() => import("./pages/Results"));

/* ─── Rutas restringidas (admin / judge) ─────────────── */
const Competitions = lazy(() => import("./pages/Competitions"));
const UsersAdmin = lazy(() => import("./pages/UsersAdmin"));
const JudgePanel = lazy(() => import("./pages/JudgePanel"));

// Roles con acceso de gestión (admin + judge)
const MANAGE_ROLES = ["admin", "judge"];


/* ─── Helpers ─────────────────────────────────────────── */
function RouteLoading() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center transition-colors duration-300">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Cargando vista...
      </p>
    </div>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

/** Ruta que requiere solo autenticación (cualquier rol). */
function withProtection(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

/** Ruta que requiere autenticación + rol específico. */
function withRole(element, allowedRoles) {
  return (
    <RoleRoute allowedRoles={allowedRoles}>
      {element}
    </RoleRoute>
  );
}

/* ─── Router animado ─────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ══ RUTAS PÚBLICAS ══════════════════════════════ */}
        <Route
          path="/login"
          element={withSuspense(<Login />)}
        />
        <Route
          path="/register"
          element={withSuspense(<Register />)}
        />
        {/* Vista pública: cualquiera puede ver carreras en vivo */}
        <Route
          path="/live"
          element={withSuspense(<LiveRaces />)}
        />

        {/* Redirigir raíz al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ══ RUTAS AUTENTICADAS (cualquier rol) ══════════ */}
        <Route
          path="/dashboard"
          element={withProtection(withSuspense(<Dashboard />))}
        />
        <Route
          path="/profile"
          element={withProtection(withSuspense(<Profile />))}
        />
        <Route
          path="/editProfile"
          element={withProtection(withSuspense(<EditProfile />))}
        />
        <Route
          path="/participantProfile"
          element={withProtection(withSuspense(<ParticipantProfile />))}
        />
        <Route
          path="/settings"
          element={withProtection(withSuspense(<Settings />))}
        />
        <Route
          path="/robots"
          element={withProtection(withSuspense(<MyRobots />))}
        />
        {/* Resultados: todos los usuarios autenticados pueden ver */}
        <Route
          path="/results"
          element={withProtection(withSuspense(<Results />))}
        />

        {/* ══ RUTAS RESTRINGIDAS POR ROL ═══════════════════
            Competitions → solo admin y judge pueden gestionar  */}
        <Route
          path="/competitions"
          element={withRole(withSuspense(<Competitions />), MANAGE_ROLES)}
        />
        <Route
          path="/judge"
          element={withRole(withSuspense(<JudgePanel />), MANAGE_ROLES)}
        />
        <Route
          path="/users"
          element={withRole(withSuspense(<UsersAdmin />), ["admin"])}
        />

        {/* Cualquier ruta desconocida → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

/* ─── App ────────────────────────────────────────────── */
function App() {
  // Inicialización del tema al cargar
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
