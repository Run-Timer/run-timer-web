import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Flag,
  Timer,
  Trophy,
  Wifi,
  WifiOff,
  Zap,
  Clock,
  Users,
  Radio,
} from "lucide-react";
import logo from "../assets/logo.svg";
import {
  subscribeToActiveCompetitions,
  subscribeToLiveSession,
  subscribeToRaceTimes,
} from "../services/liveRaceService";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */

function formatMs(ms) {
  if (!ms && ms !== 0) return "--";
  const seconds = ms / 1000;
  return `${seconds.toFixed(3)}s`;
}

function statusLabel(status) {
  switch (status) {
    case "active":
    case "activo":
      return { text: "Robot en pista", color: "text-red-500", dot: "bg-red-500" };
    case "finished":
    case "finished_pending":
    case "finalizado":
      return { text: "Tiempo pendiente de confirmar", color: "text-amber-400", dot: "bg-amber-400" };
    default:
      return { text: "Pista libre", color: "text-green-400", dot: "bg-green-400" };
  }
}

/* ─────────────────────────────────────────────────────────
   Cronómetro en tiempo real (solo visual)
───────────────────────────────────────────────────────── */
function LiveTimer({ isActive, baseMs }) {
  const startRef = useRef(null);
  // Inicializar desde baseMs; se actualiza solo vía setInterval cuando está activo
  const [elapsed, setElapsed] = useState(() => baseMs ?? 0);

  useEffect(() => {
    if (!isActive) {
      // Cuando se detiene, actualizamos al valor de baseMs en el siguiente tick
      // para no llamar setState de forma síncrona en el cuerpo del efecto
      const id = setTimeout(() => setElapsed(baseMs ?? 0), 0);
      return () => clearTimeout(id);
    }
    startRef.current = Date.now() - (baseMs ?? 0);
    const interval = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 50);
    return () => clearInterval(interval);
  }, [isActive, baseMs]);

  const seconds = elapsed / 1000;
  return (
    <span className="font-mono tabular-nums">{seconds.toFixed(3)}s</span>
  );
}

/* ─────────────────────────────────────────────────────────
   Tarjeta de stat
───────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent = false }) {
  return (
    <div className={`
      bg-zinc-900 border rounded-2xl p-5 flex items-center gap-4 transition-all
      ${accent
        ? "border-red-500/40 shadow-lg shadow-red-500/10"
        : "border-zinc-800"
      }
    `}>
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center shrink-0
        ${accent ? "bg-red-500/15 text-red-500" : "bg-zinc-800 text-zinc-400"}
      `}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-white truncate">{value ?? "--"}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Fila de clasificación
───────────────────────────────────────────────────────── */
function PodiumColors(pos) {
  if (pos === 1) return "text-yellow-400 bg-yellow-400/15 border-yellow-400/30";
  if (pos === 2) return "text-slate-300 bg-slate-300/15 border-slate-300/30";
  if (pos === 3) return "text-amber-600 bg-amber-600/15 border-amber-600/30";
  return "text-zinc-500 bg-zinc-800/50 border-zinc-700/40";
}

function RaceRow({ position, robotName, robotCategory, tiempo, isBest }) {
  const colors = PodiumColors(position);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: position * 0.04 }}
      className={`
        flex items-center gap-4 p-4 rounded-xl border mb-2 transition-all
        ${isBest ? "bg-yellow-400/5 border-yellow-400/20" : "bg-zinc-900/50 border-zinc-800/60"}
      `}
    >
      {/* Posición */}
      <div className={`
        w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border
        ${colors}
      `}>
        {position}°
      </div>

      {/* Nombre */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{robotName ?? "Robot"}</p>
        {robotCategory && (
          <p className="text-xs text-zinc-500">{robotCategory}</p>
        )}
      </div>

      {/* Tiempo */}
      <div className="text-right">
        <p className={`
          text-lg font-bold font-mono tabular-nums
          ${position === 1 ? "text-yellow-400" : "text-white"}
        `}>
          {formatMs(tiempo * 1000)}
        </p>
        {isBest && (
          <span className="text-xs text-yellow-500 font-semibold">Mejor</span>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Página principal pública
───────────────────────────────────────────────────────── */
function LiveRaces() {
  const [session, setSession] = useState({
    online: false,
    status: "idle",
    tiempoMs: 0,
    robotNombre: null,
    rondaActual: null,
    mejorTiempo: null,
    sensoresCount: 0,
    participantesCount: 0,
    ultimoTiempoMs: null,
  });
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [raceTimes, setRaceTimes] = useState([]);
  const [now, setNow] = useState(new Date());

  // Reloj en tiempo real para la cabecera
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Suscripción a sesión en vivo (RTDB)
  useEffect(() => {
    const unsub = subscribeToLiveSession(
      (data) => setSession(data),
      (err) => console.error("LiveSession error:", err)
    );
    return unsub;
  }, []);

  // Suscripción a competencias activas
  useEffect(() => {
    const unsub = subscribeToActiveCompetitions(
      (comps) => {
        setCompetitions(comps);
        if (comps.length > 0 && !selectedCompId) {
          setSelectedCompId(comps[0].id);
        }
      },
      (err) => console.error("Competitions error:", err)
    );
    return unsub;
  }, [selectedCompId]);

  // Suscripción a tiempos de la competencia seleccionada
  useEffect(() => {
    if (!selectedCompId) return;
    const unsub = subscribeToRaceTimes(
      selectedCompId,
      (times) => setRaceTimes(times),
      (err) => console.error("RaceTimes error:", err)
    );
    return unsub;
  }, [selectedCompId]);

  const trackStatus = statusLabel(session.status);
  const isRacing = session.status === "active" || session.status === "activo";
  const selectedComp = competitions.find((c) => c.id === selectedCompId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img src={logo} alt="RunTimer" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">RunTimer</h1>
              <p className="text-xs text-zinc-500 leading-tight">Carreras en vivo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Estado online/offline */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border
              ${session.online
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-zinc-700 text-zinc-500"
              }
            `}>
              {session.online
                ? <Wifi size={13} />
                : <WifiOff size={13} />
              }
              {session.online ? "Sistema online" : "Sistema offline"}
            </div>

            {/* Hora */}
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
              <Clock size={13} />
              {now.toLocaleTimeString("es-CO")}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── BANNER ESTADO PISTA ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={session.status}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={`
              rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4
              ${isRacing
                ? "bg-red-500/10 border-red-500/30"
                : session.status === "finished" || session.status === "finalizado"
                ? "bg-amber-400/10 border-amber-400/30"
                : "bg-zinc-900 border-zinc-800"
              }
            `}
          >
            {/* Ícono pulsante */}
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center shrink-0
              ${isRacing ? "bg-red-500/20" : "bg-zinc-800"}
            `}>
              {isRacing
                ? <Radio size={28} className="text-red-500 animate-pulse" />
                : <Flag size={28} className="text-zinc-400" />
              }
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${trackStatus.dot} animate-pulse`} />
                <span className={`text-sm font-semibold ${trackStatus.color}`}>
                  {trackStatus.text}
                </span>
              </div>

              {session.robotNombre && (
                <p className="text-2xl font-bold text-white">
                  {session.robotNombre}
                  {session.rondaActual && (
                    <span className="text-sm text-zinc-400 font-normal ml-2">
                      · Ronda {session.rondaActual}
                    </span>
                  )}
                </p>
              )}

              {!session.robotNombre && !isRacing && (
                <p className="text-zinc-500">
                  Esperando el inicio de la próxima carrera...
                </p>
              )}
            </div>

            {/* Cronómetro en vivo */}
            <div className={`
              text-right shrink-0
              ${isRacing ? "text-red-400" : "text-zinc-500"}
            `}>
              <p className="text-xs font-medium uppercase tracking-wider mb-0.5">
                {isRacing ? "Tiempo en pista" : "Último tiempo"}
              </p>
              <p className="text-4xl font-bold font-mono tabular-nums">
                {isRacing
                  ? <LiveTimer isActive={true} baseMs={session.tiempoMs} />
                  : session.ultimoTiempoMs
                    ? formatMs(session.ultimoTiempoMs)
                    : "--"
                }
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Zap size={22} />}
            label="Mejor tiempo"
            value={session.mejorTiempo ? `${session.mejorTiempo}s` : "--"}
            accent={Boolean(session.mejorTiempo)}
          />
          <StatCard
            icon={<Trophy size={22} />}
            label="Competencias"
            value={competitions.length}
          />
          <StatCard
            icon={<Users size={22} />}
            label="Participantes"
            value={session.participantesCount || "--"}
          />
          <StatCard
            icon={<Activity size={22} />}
            label="Sensores"
            value={session.online ? (session.sensoresCount || "OK") : "Off"}
          />
        </div>

        {/* ── COMPETENCIAS ACTIVAS ── */}
        {competitions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Trophy size={52} className="mx-auto text-zinc-700 mb-4" />
            <h2 className="text-xl font-bold mb-2">No hay competencias activas</h2>
            <p className="text-zinc-500">Las carreras aparecerán aquí en tiempo real.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Lista / selector de competencias ── */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
                Competencias activas
              </h2>
              {competitions.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                return (
                  <button
                    key={comp.id}
                    id={`comp-btn-${comp.id}`}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all
                      ${isSelected
                        ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/5"
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                        ${isSelected ? "bg-red-500/20 text-red-500" : "bg-zinc-800 text-zinc-500"}
                      `}>
                        <Trophy size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{comp.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {comp.category && (
                            <span className="text-xs text-zinc-500">{comp.category}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Activa
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Clasificación en tiempo real ── */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Clasificación
                  {selectedComp && (
                    <span className="text-zinc-700 ml-2 font-normal normal-case">
                      — {selectedComp.name}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  EN VIVO
                </div>
              </div>

              {raceTimes.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
                  <Timer size={40} className="mx-auto text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm">
                    Aún no hay tiempos registrados para esta competencia.
                  </p>
                </div>
              ) : (
                <div>
                  {raceTimes.map((rt, idx) => (
                    <RaceRow
                      key={rt.id}
                      position={idx + 1}
                      robotName={rt.robotNombre ?? rt.robot_nombre ?? rt.robotId}
                      robotCategory={rt.categoria ?? rt.category}
                      tiempo={rt.tiempo ?? rt.bestTime ?? rt.tiempoMs / 1000}
                      isBest={idx === 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="border-t border-zinc-900 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} RunTimer · UFPSO · Datos en tiempo real</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${session.online ? "bg-green-500 animate-pulse" : "bg-zinc-700"}`} />
            <span>{session.online ? "Conectado a Firebase Realtime" : "Sin conexión al hardware"}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LiveRaces;
