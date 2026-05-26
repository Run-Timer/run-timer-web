import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/**
 * RoleRoute — wrapper que protege una ruta exigiendo:
 *   1. Sesión activa  (redirige a /login si no hay)
 *   2. Al menos uno de los roles permitidos (redirige a /dashboard si el rol
 *      del usuario no está en la lista `allowedRoles`)
 *
 * Uso:
 *   <RoleRoute allowedRoles={["admin"]}>
 *     <AdminPage />
 *   </RoleRoute>
 */
function RoleRoute({ children, allowedRoles = [] }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="
        min-h-screen bg-black text-white
        flex items-center justify-center
      ">
        Cargando...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userData?.role ?? "user";

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RoleRoute;
