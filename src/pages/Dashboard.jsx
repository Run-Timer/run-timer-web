import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  LayoutDashboard,
  Settings,
  Timer,
  Trophy,
  Users,
  Wifi,
  X,
} from "lucide-react";
import logo from "../assets/logo.svg";

import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/authService";
import { db, database } from "../firebase/firebase"; 
import { collection, onSnapshot, query } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

function Dashboard() {
  const navigate = useNavigate();
  const [isAnimating, setAnimating] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentUser, userData } = useAuth();

  // Inicializamos con valores por defecto vacíos o en "Cargando..."
  const [esp32Data, setEsp32Data] = useState({
    online: false,
    mejorTiempo: "0.00s",
    sensoresActivos: "0",
    participantes: "0"
  });

  useEffect(() => {
    // ESCUCHA EN TIEMPO REAL DESDE FIRESTORE (Competencias)
    const q = query(collection(db, "competitions")); 
    
    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setCompetitions(data);
      console.log("Competitions actualizadas en tiempo real:", data);
    }, (error) => {
      console.error("Error cargando competitions realtime:", error);
    });

    // ESCUCHA EN TIEMPO REAL DESDE REALTIME DATABASE (Hardware / ESP32)
    const esp32Ref = ref(database, "hardware/esp32"); 
    
    const unsubscribeRTDB = onValue(esp32Ref, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        setEsp32Data({
          online: value.online ?? false,
          mejorTiempo: value.mejor_tiempo ? `${value.mejor_tiempo}s` : "0.00s",
          sensoresActivos: value.sensores_count ?? "0",
          participantes: value.participantes_count ?? "0"
        });
        console.log("Datos de hardware actualizados en tiempo real:", value);
      }
    }, (error) => {
      console.error("Error en RTDB:", error);
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeRTDB();
    };
  }, []);

  const goTo = (route) => {
    setAnimating(true);
    setTimeout(() => {
      navigate(route);
    }, 250);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isAnimating ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex transition-colors duration-300"
    >
      {/* SIDEBAR */}
      <aside className="w-72 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-900 p-6 hidden md:flex flex-col transition-colors duration-300">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
            <img src={logo} alt="RunTimer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RunTimer</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sistema de carreras</p>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <button className="flex items-center gap-4 bg-red-500 text-white px-5 py-4 rounded-2xl font-semibold shadow-md shadow-red-500/10">
            <LayoutDashboard size={22} />
            Dashboard
          </button>
          <button onClick={() => goTo("/competitions")} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 hover:bg-gray-200/80 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition font-medium">
            <Trophy size={22} />
            Competencias
          </button>
          <button onClick={() => goTo("/results")} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 hover:bg-gray-200/80 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition font-medium">
            <Activity size={22} />
            Resultados
          </button>
          <button onClick={() => goTo("/profile")} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 hover:bg-gray-200/80 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition font-medium">
            <Users size={22} />
            Perfil
          </button>
          <button onClick={() => goTo("/settings")} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 hover:bg-gray-200/80 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition font-medium">
            <Settings size={22} />
            Configuración
          </button>
        </nav>

        <div className="mt-auto">
          {/* Bloque Estado del Sistema */}
          <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 mb-4 transition-colors duration-300">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Estado del sistema</h3>
              <div className={`flex items-center gap-2 ${esp32Data.online ? "text-green-600 dark:text-green-400" : "text-red-500"} text-sm font-medium`}>
                <span className={`w-2 h-2 rounded-full ${esp32Data.online ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                {esp32Data.online ? "Online" : "Offline"}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Competencias</span>
                <span className="font-semibold text-gray-900 dark:text-white">{competitions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Usuario</span>
                <span className="font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wider bg-gray-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{userData?.role || "admin"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Sensores</span>
                <span className={`font-semibold ${esp32Data.online ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  {esp32Data.online ? "Conectados" : "Desconectados"}
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white transition py-4 rounded-2xl font-semibold shadow-sm">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitoreo en tiempo real de las carreras.</p>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Botón Notificaciones */}
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition shadow-sm">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black" />
            </button>

            {/* Ventana de Notificaciones */}
            {showNotifications && (
              <div className="absolute top-20 right-0 w-[360px] bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl z-50 overflow-hidden transition-colors duration-300">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">Notificaciones</h2>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white" onClick={() => setShowNotifications(false)}><X size={20} /></button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition cursor-pointer">
                    <p className="font-semibold text-gray-900 dark:text-white">Sistema en línea</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Listo para capturar tiempos de velocistas.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil Header */}
            <button onClick={() => goTo("/Editprofile")} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-3 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer shadow-sm text-left">
              <img
                src={userData?.photoUrl || currentUser?.photoURL || "https://ui-avatars.com/api/?name=RunTimer"}
                alt="Perfil"
                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
              />
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{userData?.nombre || currentUser?.displayName || "Usuario"}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{currentUser?.email}</p>
              </div>
            </button>
          </div>
        </div>

        {/* STATS - TARJETAS VINCULADAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <Card icon={<Timer />} title="Mejor tiempo" value={esp32Data.mejorTiempo} />
          <Card icon={<Trophy />} title="Competencias activas" value={competitions.length} />
          <Card icon={<Users />} title="Participantes" value={esp32Data.participantes} />
          <Card icon={<Wifi />} title="Sensores activos" value={esp32Data.sensoresActivos} />
        </div>
      </main>
    </motion.div>
  );
}

// COMPONENTE CARD LOCAL CON SOPORTE LIGHT/DARK MODE
function Card({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
      <div className="flex justify-between mb-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
          {icon}
        </div>
        <Activity className="text-green-500 dark:text-green-400" size={20} />
      </div>
      <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">{title}</h2>
      <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default Dashboard;