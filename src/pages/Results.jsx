import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  Timer, Trophy, Medal, ArrowLeft,
  Activity, Star, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/useAuth";

/* ─── helpers ─────────────────────────────────────────── */

function formatMs(ms) {
  if (!ms && ms !== 0) return "--";
  return `${(ms / 1000).toFixed(3)}s`;
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: "Completado", cls: "bg-green-500/10 text-green-400 border-green-500/20" },
    dns:       { label: "DNS",        cls: "bg-zinc-700/40 text-zinc-400 border-zinc-700/30" },
    dnf:       { label: "DNF",        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    dq:        { label: "DQ",         cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const { label, cls } = map[status] ?? map.dns;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${cls}`}>
      {label}
    </span>
  );
}
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

function StatusIcon({ status }) {
  if (status === "completed") return <CheckCircle size={14} className="text-green-400" />;
  if (status === "dnf")       return <AlertTriangle size={14} className="text-amber-400" />;
  return <XCircle size={14} className="text-red-400" />;
}
StatusIcon.propTypes = { status: PropTypes.string.isRequired };

/* ─── componente principal ────────────────────────────── */

function Results() {
  const navigate   = useNavigate();
  const { currentUser } = useAuth();

  const [robots,       setRobots]       = useState([]);   // robots del usuario
  const [raceTimes,    setRaceTimes]    = useState([]);   // todos sus race_times
  const [competitions, setCompetitions] = useState([]);   // todas las competencias
  const [loading,      setLoading]      = useState(true);

  /* 1 ── Robots del usuario */
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "robots"),
      where("captainUid", "==", currentUser.uid)
    );
    return onSnapshot(q,
      (snap) => setRobots(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err)  => console.error("Robots error:", err)
    );
  }, [currentUser]);

  /* 2 ── race_times de TODOS los robots del usuario */
  useEffect(() => {
    if (robots.length === 0) {
      // Diferir setState para evitar llamada síncrona dentro del efecto
      const id = setTimeout(() => {
        setRaceTimes([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(id);
    }

    const robotIds = robots.map((r) => r.id);

    // Firestore 'in' acepta máx 30 valores — suficiente para un capitán
    const q = query(
      collection(db, "race_times"),
      where("robotId", "in", robotIds.slice(0, 30))
    );
    return onSnapshot(q,
      (snap) => {
        setRaceTimes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("RaceTimes error:", err);
        setLoading(false);
      }
    );
  }, [robots]);

  /* 3 ── Competencias (para nombres) */
  useEffect(() => {
    return onSnapshot(collection(db, "competitions"),
      (snap) => setCompetitions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err)  => console.error("Competitions error:", err)
    );
  }, []);

  /* ── Mapas de lookup ── */
  const robotMap = useMemo(
    () => Object.fromEntries(robots.map((r) => [r.id, r])),
    [robots]
  );
  const compMap = useMemo(
    () => Object.fromEntries(competitions.map((c) => [c.id, c])),
    [competitions]
  );

  /* ── Métricas calculadas ── */
  const metrics = useMemo(() => {
    const completed = raceTimes.filter((r) => r.status === "completed");
    const bestTime  = completed.length
      ? Math.min(...completed.map((r) => r.finalTimeMs ?? r.timeMs ?? Infinity))
      : null;
    const bestLaps       = raceTimes.filter((r) => r.bestLap).length;
    const uniqueComps    = new Set(raceTimes.map((r) => r.compId)).size;

    return { bestTime, bestLaps, totalRaces: raceTimes.length, uniqueComps };
  }, [raceTimes]);

  /* ── Historial ordenado por fecha desc ── */
  const history = useMemo(() =>
    [...raceTimes].sort((a, b) => {
      const ta = a.registeredAt?.seconds ?? 0;
      const tb = b.registeredAt?.seconds ?? 0;
      return tb - ta;
    }),
    [raceTimes]
  );

  const lastRace = history[0] ?? null;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Cargando telemetría...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-black text-white p-6 md:p-10"
    >
      {/* ── VOLVER ── */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold hover:bg-zinc-800 transition mb-8"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </button>

      {/* ── CABECERA ── */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Mis Resultados</h1>
        <p className="text-zinc-400 text-lg">Historial personal y rendimiento competitivo.</p>
      </div>

      {/* ── MÉTRICAS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {[
          {
            icon: <Timer size={22} />,
            label: "Mejor tiempo",
            value: metrics.bestTime === null ? "--" : formatMs(metrics.bestTime),
            accent: metrics.bestTime !== null,
          },
          {
            icon: <Activity size={22} />,
            label: "Total carreras",
            value: metrics.totalRaces,
            accent: false,
          },
          {
            icon: <Trophy size={22} />,
            label: "Competencias",
            value: metrics.uniqueComps,
            accent: false,
          },
          {
            icon: <Star size={22} />,
            label: "Best laps",
            value: metrics.bestLaps,
            accent: metrics.bestLaps > 0,
          },
        ].map(({ icon, label, value, accent }) => (
          <div
            key={label}
            className={`rounded-2xl p-6 border transition-all ${
              accent
                ? "bg-red-500/5 border-red-500/30 shadow-lg shadow-red-500/5"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              accent ? "bg-red-500/15 text-red-500" : "bg-zinc-800 text-zinc-400"
            }`}>
              {icon}
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* ── ÚLTIMA CARRERA ── */}
      {lastRace && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Última carrera</h2>
              <p className="text-zinc-400 text-sm">
                {compMap[lastRace.compId]?.name ?? lastRace.compId}
              </p>
            </div>
            <StatusBadge status={lastRace.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Robot",   value: robotMap[lastRace.robotId]?.name ?? lastRace.robotId },
              { label: "Tiempo",  value: formatMs(lastRace.finalTimeMs ?? lastRace.timeMs), highlight: true },
              { label: "Ronda",   value: `#${lastRace.round ?? "--"}` },
              { label: "Categoría", value: lastRace.category ?? "--" },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-black border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
                <p className={`text-xl font-bold ${highlight ? "text-green-400" : "text-white"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORIAL EN TABLA ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-1">Historial de carreras</h2>
        <p className="text-zinc-500 text-sm mb-6">
          Todos los tiempos registrados de tus robots en competencias.
        </p>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Medal size={48} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500">No hay carreras registradas aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Robot</th>
                  <th className="pb-3 font-semibold">Competencia</th>
                  <th className="pb-3 font-semibold">Ronda</th>
                  <th className="pb-3 font-semibold">Tiempo final</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rt) => {
                  const robot = robotMap[rt.robotId];
                  const comp  = compMap[rt.compId];
                  const date  = rt.registeredAt?.seconds
                    ? new Date(rt.registeredAt.seconds * 1000).toLocaleDateString("es-CO")
                    : "--";
                  return (
                    <tr
                      key={rt.id}
                      className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition text-sm"
                    >
                      <td className="py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {rt.bestLap && (
                            <Star size={13} className="text-yellow-400 shrink-0" fill="currentColor" />
                          )}
                          {robot?.name ?? rt.robotId}
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400">{comp?.name ?? rt.compId}</td>
                      <td className="py-4 text-zinc-300">#{rt.round ?? "--"}</td>
                      <td className="py-4 font-bold font-mono">
                        <span className={rt.status === "completed" ? "text-green-400" : "text-zinc-500"}>
                          {rt.status === "completed" ? formatMs(rt.finalTimeMs ?? rt.timeMs) : "--"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={rt.status} />
                          <StatusBadge status={rt.status} />
                        </div>
                      </td>
                      <td className="py-4 text-zinc-500">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Results;
