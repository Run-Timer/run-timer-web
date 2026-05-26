import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  Activity,
  User,
  Zap,
  Check,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/useAuth";
import {
  llamarRobotAPista,
  confirmarResultado,
  resetearSesion,
} from "../services/judgeService";
import { subscribeToLiveSession } from "../services/liveRaceService";

function formatMs(ms) {
  if (!ms && ms !== 0) return "--";
  return `${(ms / 1000).toFixed(3)}s`;
}

function JudgePanel() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  
  // Lista de robots inscritos en la competencia seleccionada
  const [enrolledRobots, setEnrolledRobots] = useState([]);
  const [raceTimes, setRaceTimes] = useState([]);
  
  // Sesión en vivo de la pista (RTDB)
  const [liveSession, setLiveSession] = useState({ status: "idle" });
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const isAdmin = userData?.role === "admin";

  // 1. Obtener competencias activas asignadas a este juez (o todas si es admin)
  useEffect(() => {
    if (!currentUser) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, "competitions"), where("status", "==", "active"));
    } else {
      q = query(
        collection(db, "competitions"),
        where("judgeUid", "==", currentUser.uid),
        where("status", "==", "active")
      );
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const comps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveCompetitions(comps);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando competencias:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isAdmin]);

  // 2. Suscribirse a la sesión activa en tiempo real (RTDB)
  useEffect(() => {
    const unsubscribe = subscribeToLiveSession((data) => {
      setLiveSession(data);
    });
    return () => unsubscribe();
  }, []);

  // 3. Obtener robots inscritos y race_times de la competencia seleccionada
  useEffect(() => {
    if (!selectedComp) {
      setEnrolledRobots([]);
      setRaceTimes([]);
      return;
    }

    // A. Escuchar enrollments (subcolección de competencia)
    const enrollmentsUnsub = onSnapshot(
      collection(db, "competitions", selectedComp.id, "enrollments"),
      async (snap) => {
        const robotIds = snap.docs.map(d => d.data().robotId);
        
        if (robotIds.length === 0) {
          setEnrolledRobots([]);
          return;
        }

        // Obtener datos detallados de cada robot
        const robotsData = await Promise.all(
          robotIds.map(async (id) => {
            const robotDoc = await getDoc(doc(db, "robots", id));
            return robotDoc.exists() ? { id: robotDoc.id, ...robotDoc.data() } : null;
          })
        );
        
        setEnrolledRobots(robotsData.filter(r => r !== null));
      }
    );

    // B. Escuchar race_times para esta competencia
    const raceTimesUnsub = onSnapshot(
      query(collection(db, "race_times"), where("compId", "==", selectedComp.id)),
      (snap) => {
        setRaceTimes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      enrollmentsUnsub();
      raceTimesUnsub();
    };
  }, [selectedComp]);

  // -- ACCIONES DE LA PISTA --

  const handleCallToTrack = async (robot, round) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      const err = await llamarRobotAPista({
        compId: selectedComp.id,
        robotId: robot.id,
        robotNombre: robot.name,
        juezUid: currentUser.uid,
        rondaActual: round,
      });
      if (err) alert(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMarkDns = async (robot, round) => {
    if (actionInProgress) return;
    if (!globalThis.confirm(`¿Marcar DNS (No se presentó) para ${robot.name} en la Ronda ${round}?`)) return;
    
    setActionInProgress(true);
    try {
      const err = await confirmarResultado({
        compId: selectedComp.id,
        robotId: robot.id,
        category: selectedComp.category,
        round,
        tiempoMs: 0,
        juezUid: currentUser.uid,
        status: "dns",
      });
      if (err) alert(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmResult = async (status) => {
    if (actionInProgress || !liveSession.robotId) return;
    
    setActionInProgress(true);
    try {
      const err = await confirmarResultado({
        compId: selectedComp.id,
        robotId: liveSession.robotId,
        category: selectedComp.category,
        round: liveSession.rondaActual,
        tiempoMs: liveSession.tiempoMs,
        juezUid: currentUser.uid,
        status,
      });
      if (err) alert(err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReleaseTrack = async () => {
    if (!globalThis.confirm("¿Seguro que deseas liberar la pista? Esto reiniciará el estado sin guardar ningún tiempo.")) return;
    
    setActionInProgress(true);
    try {
      await resetearSesion();
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <p className="text-xl text-zinc-500 animate-pulse">Cargando panel de juzgamiento...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* ── VOLVER ── */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => selectedComp ? setSelectedComp(null) : navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition shadow-sm"
        >
          <ArrowLeft size={16} />
          {selectedComp ? "Cambiar Competencia" : "Volver al inicio"}
        </button>

        {selectedComp && (
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {selectedComp.name}
          </span>
        )}
      </div>

      {/* ══ VISTA 1: SELECCIONAR COMPETENCIA ══ */}
      {!selectedComp ? (
        <div>
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">Panel de Juez</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Selecciona una competencia activa para iniciar el juzgamiento de pista.
            </p>
          </div>

          {activeCompetitions.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
              <Trophy size={48} className="mx-auto text-zinc-400 mb-4 animate-bounce" />
              <h2 className="text-xl font-bold mb-2">No tienes competencias activas</h2>
              <p className="text-gray-500 dark:text-gray-400">
                El administrador debe asignarte como juez a una competencia en estado activa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCompetitions.map(comp => (
                <motion.div
                  key={comp.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedComp(comp)}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                      <Trophy size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{comp.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4 line-clamp-2">{comp.description}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-400 uppercase tracking-wider">Categoría: {comp.category}</span>
                    <span className="text-red-500">Juzgar →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ══ VISTA 2: PANEL DE CONTROL DE PISTA Y ROBOTS ══ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: BANNER DE CONTROL DE PISTA (RTDB) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="text-red-500 animate-pulse" size={20} />
                Estado de la Pista
              </h2>

              <div className="bg-gray-50 dark:bg-black rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 text-center space-y-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  liveSession.status === "active" 
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : liveSession.status === "finished"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-green-500/10 text-green-500 border-green-500/20"
                }`}>
                  {liveSession.status === "active" ? "Corriendo..." : liveSession.status === "finished" ? "Tiempo Registrado" : "Libre"}
                </span>

                <div className="text-5xl font-extrabold font-mono text-gray-900 dark:text-white tabular-nums tracking-tight">
                  {formatMs(liveSession.tiempoMs)}
                </div>

                {liveSession.robotNombre && (
                  <div className="text-sm">
                    <span className="text-gray-400">Robot actual:</span>
                    <p className="font-bold text-gray-800 dark:text-white">{liveSession.robotNombre}</p>
                    <span className="text-xs text-zinc-500 font-mono">Ronda #{liveSession.rondaActual}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción del juez */}
              <div className="mt-6 space-y-3">
                {liveSession.status === "finished" && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleConfirmResult("completed")}
                      disabled={actionInProgress}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs gap-1 shadow-sm transition"
                    >
                      <Check size={16} />
                      Completar
                    </button>
                    <button
                      onClick={() => handleConfirmResult("dnf")}
                      disabled={actionInProgress}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1 shadow-sm transition"
                    >
                      <AlertTriangle size={16} />
                      DNF
                    </button>
                    <button
                      onClick={() => handleConfirmResult("dq")}
                      disabled={actionInProgress}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs gap-1 shadow-sm transition"
                    >
                      <XCircle size={16} />
                      DQ
                    </button>
                  </div>
                )}

                {liveSession.status !== "idle" && (
                  <button
                    onClick={handleReleaseTrack}
                    disabled={actionInProgress}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-red-500/30 hover:bg-red-500/5 text-red-500 font-bold text-sm transition"
                  >
                    <RotateCcw size={16} />
                    Liberar Pista (Reset)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA 2 Y 3: ROBOTS INSCRITOS Y SUS RONDAS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Robots Competidores</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                Llama a pista o registra penalizaciones para cada participante.
              </p>

              {enrolledRobots.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldAlert size={48} className="mx-auto text-zinc-400 mb-3" />
                  <p className="text-gray-500 dark:text-zinc-400">No hay robots inscritos en esta competencia.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledRobots.map(robot => {
                    const times = raceTimes.filter(t => t.robotId === robot.id);
                    const currentRound = times.length + 1;
                    const isFullyCompleted = currentRound > selectedComp.totalRounds;

                    return (
                      <div
                        key={robot.id}
                        className="bg-gray-50 dark:bg-black border border-gray-200/50 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{robot.name}</span>
                            <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-mono">
                              Ronda {Math.min(currentRound, selectedComp.totalRounds)}/{selectedComp.totalRounds}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                              <User size={12} /> {robot.captainName || "Capitán"}
                            </span>
                          </div>

                          {/* Tiempos de rondas previas */}
                          {times.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {times.map(t => (
                                <span
                                  key={t.id}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                    t.status === "completed"
                                      ? "bg-green-500/5 text-green-400 border-green-500/20"
                                      : t.status === "dns"
                                      ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                      : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                                  }`}
                                >
                                  R{t.round}: {t.status === "completed" ? formatMs(t.finalTimeMs) : t.status.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Botones de acción por robot */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {isFullyCompleted ? (
                            <span className="text-xs font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Check size={14} /> Finalizado
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMarkDns(robot, currentRound)}
                                disabled={actionInProgress || liveSession.status !== "idle"}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40"
                              >
                                <XCircle size={14} />
                                DNS
                              </button>
                              <button
                                onClick={() => handleCallToTrack(robot, currentRound)}
                                disabled={actionInProgress || liveSession.status !== "idle"}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition disabled:opacity-40"
                              >
                                <Play size={14} fill="currentColor" />
                                Llamar a Pista
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default JudgePanel;
