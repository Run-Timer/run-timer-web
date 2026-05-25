import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Palette,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/authService";
import { auth } from "../firebase/firebase"; 
import { sendPasswordResetEmail } from "firebase/auth";

function Settings() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  // Cambia el tema localmente y actualiza las clases del elemento raíz HTML
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, currentUser.email);
      alert(`Se ha enviado un correo de restablecimiento a: ${currentUser.email}`);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-12 flex justify-center transition-colors duration-300"
    >
      <div className="w-full max-w-3xl space-y-8">
        
        {/* BOTÓN VOLVER AL INICIO */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white transition shadow-sm"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </button>
        </div>

        {/* ENCABEZADO */}
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los parámetros de tu cuenta y personalización de RunTimer.</p>
        </div>

        {/* SECCIÓN PERFIL */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
            <img
              src={userData?.photoUrl || currentUser?.photoURL || "https://ui-avatars.com/api/?name=RunTimer"}
              alt="Perfil"
              className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-md"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userData?.nombre || currentUser?.displayName || "Usuario RunTimer"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 justify-center sm:justify-start mt-1">
                <Mail size={14} /> {currentUser?.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full uppercase tracking-wider">
                Rol: {userData?.role || "admin"}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/editProfile")}
            className="px-5 py-3 bg-red-500 hover:bg-red-600 transition rounded-2xl text-white font-semibold text-sm w-full sm:w-auto shadow-sm"
          >
            Editar perfil
          </button>
        </div>

        {/* COMPONENTES DE AJUSTES */}
        <div className="space-y-5">
          
          {/* CONTROL DE APARIENCIA */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-300">
            <button
              onClick={() => setShowThemeOptions(!showThemeOptions)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Apariencia</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tema actual: {theme === "dark" ? "Oscuro" : "Claro"}</p>
                </div>
              </div>
              <ChevronRight className={`text-gray-500 transition-transform duration-200 ${showThemeOptions ? "rotate-90" : ""}`} size={20} />
            </button>

            {showThemeOptions && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 border-t border-gray-100 dark:border-zinc-800/60 flex flex-col gap-2">
                <button
                  onClick={() => { setTheme("light"); setShowThemeOptions(false); }}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between text-sm font-medium transition ${theme === "light" ? "bg-red-500 text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"}`}
                >
                  <div className="flex items-center gap-3"><Sun size={18} /> Claro</div>
                  {theme === "light" && <span className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <button
                  onClick={() => { setTheme("dark"); setShowThemeOptions(false); }}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between text-sm font-medium transition ${theme === "dark" ? "bg-red-500 text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"}`}
                >
                  <div className="flex items-center gap-3"><Moon size={18} /> Oscuro</div>
                  {theme === "dark" && <span className="w-2 h-2 rounded-full bg-white" />}
                </button>
              </div>
            )}
          </div>

          {/* CONTROL DE SEGURIDAD */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza tus credenciales de acceso</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-2 rounded-xl">
                <ShieldAlert size={14} />
                <span>Te enviaremos un link seguro a tu correo.</span>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-sm font-semibold rounded-xl text-gray-900 dark:text-white transition disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Restablecer contraseña"}
              </button>
            </div>
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            className="w-full p-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-3xl flex items-center justify-center gap-3 font-bold transition mt-4 shadow-sm"
          >
            <LogOut size={20} />
            Cerrar sesión activa
          </button>

        </div>
      </div>
    </motion.div>
  );
}

export default Settings;