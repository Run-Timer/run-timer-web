import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  // loading: true mientras Firebase Auth resuelve la sesión
  // loadingUser: true mientras se obtiene el documento de Firestore
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setLoadingUser(true);
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          setUserData(userSnap.exists() ? userSnap.data() : null);
        } catch (error) {
          console.error("Error al cargar userData:", error);
          setUserData(null);
        } finally {
          setLoadingUser(false);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoadingUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ currentUser, userData, loading: loading || loadingUser }),
    [currentUser, userData, loading, loadingUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
