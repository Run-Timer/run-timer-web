import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/authService";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Trophy,
  Timer,
  Medal,
  Activity,
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    nombre: "",
    categoria: "Piloto",
    ubicacion: "No especificada",
    edad: "--",
  });
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ bestTime: "--", wins: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // 1. Conseguir perfil de Firestore real
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        } else {
          // Si no hay documento en Firestore, usamos los datos de Auth básicos
          setProfileData((prev) => ({
            ...prev,
            nombre: user.displayName || "Usuario de RunTimer",
          }));
        }

        // 2. Conseguir historial corto para el perfil (últimos 3) desde Firestore
        const q = query(
          collection(db, "resultados"),
          where("userId", "==", user.uid),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const userHistory = [];
        let best = Infinity;
        let wins = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userHistory.push({ id: doc.id, ...data });
          
          if (parseFloat(data.time) < best) best = parseFloat(data.time);
          if (data.position === "1°" || data.position === 1) wins++;
        });

        setHistory(userHistory);
        setStats({
          bestTime: best !== Infinity ? `${best}s` : "--",
          wins: wins,
          total: userHistory.length,
        });

      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <p className="text-xl text-gray-400 dark:text-gray-500 animate-pulse">Cargando perfil de competidor...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* Botón Volver al Inicio (Igual al de Settings) */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white transition shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>

      {/* BANNER / INFO PRINCIPAL */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 mb-10 shadow-sm transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="w-36 h-36 rounded-full bg-red-500 flex items-center justify-center text-5xl font-bold text-white shadow-md">
            {profileData.nombre ? profileData.nombre.charAt(0).toUpperCase() : "C"}
          </div>

          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">{profileData.nombre}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>{profileData.categoria || "Profesional"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{profileData.ubicacion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{profileData.edad} años</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-5 py-3 rounded-2xl font-semibold w-fit text-sm">
                Activo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRICAS DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        
        {/* Mejor tiempo */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Timer size={22} />
            </div>
            <TrendingUp className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Mejor tiempo</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.bestTime}</p>
        </div>

        {/* Victorias */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trophy size={22} />
            </div>
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Victorias</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.wins}</p>
        </div>

        {/* Competencias */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Activity size={22} />
            </div>
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Competencias</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        {/* Ranking */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Medal size={22} />
            </div>
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Ranking</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">#2</p>
        </div>
      </div>

      {/* LOGROS */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 mb-10 shadow-sm transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Logros</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-5 py-3 rounded-2xl font-semibold text-sm">
            🏆 Campeón Regional
          </div>
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-5 py-3 rounded-2xl font-semibold text-sm">
            ⚡ Sub 2.20s
          </div>
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-5 py-3 rounded-2xl font-semibold text-sm">
            🔥 5 victorias seguidas
          </div>
        </div>
      </div>

      {/* HISTORIAL RECIENTE */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Historial reciente</h2>
          <p className="text-gray-500 dark:text-gray-400">Últimas competencias registradas en Firestore.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-left text-gray-500 dark:text-gray-400">
                <th className="pb-4 font-semibold">Competencia</th>
                <th className="pb-4 font-semibold">Fecha</th>
                <th className="pb-4 font-semibold">Tiempo</th>
                <th className="pb-4 font-semibold">Posición</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-900 dark:text-white transition">
                  <td className="py-5 font-semibold">{item.competition}</td>
                  <td className="py-5 text-gray-500 dark:text-gray-400">{item.date}</td>
                  <td className="py-5 font-bold text-green-600 dark:text-green-400">{item.time}s</td>
                  <td className="py-5 font-medium">{item.position}°</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400 dark:text-gray-500">
                    No se encontraron marcas de tiempo registradas para este piloto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;