import { useEffect, useState } from "react";
import { db, auth } from "../services/authService";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Timer, Trophy, Activity, Medal, ArrowUpRight, ArrowLeft } from "lucide-react";

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [metrics, setMetrics] = useState({
    bestTime: "--",
    lastTime: "--",
    totalCompetitions: 0,
    victories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "resultados"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResults = [];
      let best = Infinity;
      let wins = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        const formattedDate = data.date?.seconds 
          ? new Date(data.date.seconds * 1000).toLocaleDateString()
          : data.date;

        fetchedResults.push({ id: doc.id, ...data, date: formattedDate });

        const numTime = parseFloat(data.time);
        if (numTime < best) best = numTime;
        if (data.position === "1°" || data.position === 1) wins++;
      });

      setResults(fetchedResults);

      if (fetchedResults.length > 0) {
        setMetrics({
          bestTime: best !== Infinity ? `${best}s` : "--",
          lastTime: fetchedResults[0].time ? `${fetchedResults[0].time}s` : "--",
          totalCompetitions: fetchedResults.length,
          victories: wins,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);
/*
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <p className="text-xl text-gray-400 dark:text-gray-500 animate-pulse">Cargando telemetría...</p>
      </div>
    );
  }*/

  const latestRace = results[0] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* BOTÓN VOLVER AL INICIO */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white transition shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">Mis Resultados</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Historial personal y rendimiento competitivo.</p>
      </div>

      {/* Grid de Tarjetas de Métricas Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        
        {/* Mejor tiempo */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Timer size={22} />
            </div>
            <ArrowUpRight className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Mejor tiempo</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{metrics.bestTime}</p>
        </div>

        {/* Último tiempo */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Activity size={22} />
            </div>
            <ArrowUpRight className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Último tiempo</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{metrics.lastTime}</p>
        </div>

        {/* Competencias */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trophy size={22} />
            </div>
            <ArrowUpRight className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Competencias</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{metrics.totalCompetitions}</p>
        </div>

        {/* Victorias */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Medal size={22} />
            </div>
            <ArrowUpRight className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <h2 className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Victorias</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{metrics.victories}</p>
        </div>
      </div>

      {/* Sección Última Competencia */}
      {latestRace && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 mb-10 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Última competencia</h2>
              <p className="text-gray-500 dark:text-gray-400">{latestRace.competition}</p>
            </div>
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide">
              {latestRace.status || "Finalizado"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors duration-300">
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm font-medium">Tiempo obtenido</p>
              <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">{latestRace.time}s</h2>
            </div>
            <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors duration-300">
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm font-medium">Posición</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">#{latestRace.position}</h2>
            </div>
            <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 transition-colors duration-300">
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm font-medium">Categoría</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{latestRace.category || "Estándar"}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Historial en Tabla */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Historial de competencias</h2>
          <p className="text-gray-500 dark:text-gray-400">Últimos resultados registrados en la base de datos.</p>
        </div>

        <div className="overflow-x-auto">
          {results.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 py-8 text-center font-medium">No hay competencias registradas aún.</p>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-4 font-semibold">Competencia</th>
                  <th className="pb-4 font-semibold">Fecha</th>
                  <th className="pb-4 font-semibold">Tiempo</th>
                  <th className="pb-4 font-semibold">Posición</th>
                  <th className="pb-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-900 dark:text-white transition">
                    <td className="py-5 font-semibold">{result.competition}</td>
                    <td className="py-5 text-gray-500 dark:text-gray-400">{result.date}</td>
                    <td className="py-5 font-bold text-green-600 dark:text-green-400">{result.time}s</td>
                    <td className="py-5 font-medium">{result.position}°</td>
                    <td className="py-5">
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                        {result.status || "Finalizado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Results;