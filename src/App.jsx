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

const Competitions = lazy(() =>
  import("./pages/Competitions")
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard")
);
const Login = lazy(() =>
  import("./pages/Login")
);
const ParticipantProfile = lazy(() =>
  import("./pages/ParticipantProfile")
);
const Profile = lazy(() =>
  import("./pages/Profile")
);
const Register = lazy(() =>
  import("./pages/register")
);
const Results = lazy(() =>
  import("./pages/Results")
);
const Settings = lazy(() =>
  import("./pages/Settings")
);
const EditProfile = lazy(() =>
  import("./pages/EditProfile")
);

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
  return (
    <Suspense fallback={<RouteLoading />}>
      {element}
    </Suspense>
  );
}

function withProtection(element) {
  return (
    <ProtectedRoute>
      {element}
    </ProtectedRoute>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={withSuspense(<Login />)}
        />
        <Route
          path="/register"
          element={withSuspense(
            <Register />
          )}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route
          path="/dashboard"
          element={withProtection(
            withSuspense(<Dashboard />)
          )}
        />
        <Route
          path="/results"
          element={withProtection(
            withSuspense(<Results />)
          )}
        />
        <Route
          path="/competitions"
          element={withProtection(
            withSuspense(
              <Competitions />
            )
          )}
        />
        <Route
          path="/settings"
          element={withProtection(
            withSuspense(<Settings />)
          )}
        />
        <Route
          path="/profile"
          element={withProtection(
            withSuspense(<Profile />)
          )}
        />
        <Route
          path="/participantProfile"
          element={withProtection(
            withSuspense(
              <ParticipantProfile />
            )
          )}
        />
        <Route
          path="/editProfile"
          element={withProtection(
            withSuspense(
              <EditProfile />
            )
          )}
        />
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
