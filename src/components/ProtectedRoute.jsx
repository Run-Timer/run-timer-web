import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

function ProtectedRoute({ children }) {

  const {
    currentUser,
    loading,
  } = useAuth();

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">

        Cargando...

      </div>

    );

  }

  if (!currentUser) {

    return <Navigate to="/login" />;

  }

  return children;
}

export default ProtectedRoute;