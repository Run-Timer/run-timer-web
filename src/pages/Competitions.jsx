import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Cpu,
  Check,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  subscribeToCompetitions,
  toggleCompetitionRegistration,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from "../services/competitionService";
import CompetitionModal from "../components/CompetitionModal";

function Competitions() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  
  // Robot Registration States
  const [isRobotModalOpen, setIsRobotModalOpen] = useState(false);
  const [myRobots, setMyRobots] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState("");
  const [targetCompId, setTargetCompId] = useState("");
  const [targetSourceCol, setTargetSourceCol] = useState("competitions");

  const isAdmin = userData?.role === "admin";

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const unsubscribe =
      subscribeToCompetitions(
        (snapshotCompetitions) => {
          const compsArray =
            snapshotCompetitions.map(
              (competition) => {
                const formattedDate =
                  competition.date?.seconds
                    ? new Date(
                        competition.date.seconds *
                          1000
                      ).toLocaleDateString()
                    : competition.date;

                const isRegistered =
                  competition.userIds?.includes(
                    currentUser.uid
                  ) || false;

                const participantsCount =
                  competition.userIds
                    ? competition.userIds.length
                    : competition.participants || 0;

                return {
                  ...competition,
                  date: formattedDate,
                  registered: isRegistered,
                  participants: participantsCount,
                };
              }
            );

          setCompetitions(compsArray);
          setLoading(false);
        },
        (error) => {
          console.error(
            "Error cargando competiciones:",
            error
          );
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [navigate, currentUser]);

  const handleRegistration = async (competitionId, isRegistered) => {
    if (!currentUser || isAdmin) return;

    const competition = competitions.find((item) => item.id === competitionId);
    const sourceCollection = competition?.sourceCollection || "competitions";

    if (isRegistered) {
      if (!globalThis.confirm("¿Seguro que deseas cancelar tu inscripción? Se eliminará tu robot de la competencia.")) return;

      try {
        const q = query(
          collection(db, "robots"),
          where("captainUid", "==", currentUser.uid),
          where("compIdActual", "==", competitionId)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          for (const robotDoc of snap.docs) {
            await updateDoc(doc(db, "robots", robotDoc.id), { compIdActual: "" });
            await deleteDoc(doc(db, "competitions", competitionId, "enrollments", robotDoc.id));
          }
        }

        await toggleCompetitionRegistration(
          competitionId,
          currentUser.uid,
          true,
          sourceCollection
        );
      } catch (error) {
        console.error("Error cancelando inscripción:", error);
      }
    } else {
      try {
        const q = query(
          collection(db, "robots"),
          where("captainUid", "==", currentUser.uid)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          alert("Debes registrar al menos un robot en la sección 'Mis Robots' para poder inscribirte en la competencia.");
          navigate("/robots");
          return;
        }

        const robotsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const available = robotsList.filter(r => !r.compIdActual);

        if (available.length === 0) {
          alert("Todos tus robots ya están inscritos en otras competencias. Por favor, crea un nuevo robot o libera uno existente.");
          return;
        }

        setMyRobots(available);
        setSelectedRobotId(available[0].id);
        setTargetCompId(competitionId);
        setTargetSourceCol(sourceCollection);
        setIsRobotModalOpen(true);
      } catch (error) {
        console.error("Error obteniendo robots:", error);
      }
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedRobotId || !targetCompId) return;

    try {
      await setDoc(doc(db, "competitions", targetCompId, "enrollments", selectedRobotId), {
        robotId: selectedRobotId,
        captainUid: currentUser.uid,
        enrolledAt: serverTimestamp(),
        confirmed: true,
        participantNumber: 0,
      });

      await updateDoc(doc(db, "robots", selectedRobotId), {
        compIdActual: targetCompId,
      });

      await toggleCompetitionRegistration(
        targetCompId,
        currentUser.uid,
        false,
        targetSourceCol
      );

      setIsRobotModalOpen(false);
      setTargetCompId("");
      setSelectedRobotId("");
    } catch (e) {
      console.error("Error confirmando inscripción:", e);
      alert("Error: " + e.message);
    }
  };

  const handleSaveModal = async (data, id, sourceCollection) => {
    try {
      if (id) {
        await updateCompetition(id, data, sourceCollection);
      } else {
        await createCompetition(data);
      }
      setIsModalOpen(false);
      setEditingComp(null);
    } catch (error) {
      console.error("Error guardando competencia:", error);
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDelete = async (id, sourceCollection) => {
    if (globalThis.confirm("¿Seguro que deseas eliminar esta competencia?")) {
      try {
        await deleteCompetition(id, sourceCollection);
      } catch (error) {
        console.error("Error eliminando:", error);
        alert("Error al eliminar.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <p className="text-xl text-gray-400 dark:text-gray-500 animate-pulse">Cargando grilla de eventos...</p>
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

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            Competiciones
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {isAdmin 
              ? "Gestiona todas las competencias del sistema." 
              : "Próximas competencias disponibles para participar."}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingComp(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-md shadow-red-500/20"
          >
            <Plus size={20} />
            Nueva Competencia
          </button>
        )}
      </div>

      {/* EMPTY STATE & MAIN CONTENT */}
      {competitions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-10 text-center shadow-sm transition-colors duration-300">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            No hay competiciones actualmente
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Las nuevas competencias aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          {/* TITLE */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Próximas competiciones
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Inscríbete y participa en nuevas carreras.
            </p>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-4 font-semibold">Competición</th>
                  <th className="pb-4 font-semibold">Fecha</th>
                  <th className="pb-4 font-semibold">Ubicación</th>
                  <th className="pb-4 font-semibold">Categoría</th>
                  <th className="pb-4 font-semibold">Participantes</th>
                  <th className="pb-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((competition) => (
                  <tr
                    key={competition.id}
                    className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-900 dark:text-white transition"
                  >
                    {/* NAME */}
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-sm">
                          <Trophy size={22} />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            {competition.name}
                          </h2>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Competencia oficial
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="py-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CalendarDays size={18} className="text-gray-400 dark:text-gray-500" />
                        <span className="font-medium">{competition.date}</span>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="py-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <MapPin size={18} className="text-gray-400 dark:text-gray-500" />
                        <span className="font-medium">{competition.location}</span>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="py-6">
                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide">
                        {competition.category || "Estándar"}
                      </span>
                    </td>

                    {/* PARTICIPANTS */}
                    <td className="py-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Users size={18} className="text-gray-400 dark:text-gray-500" />
                        <span className="font-medium">{competition.participants}</span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="py-6">
                      {isAdmin ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Buscar doc original de state para edición
                              const raw = competitions.find(c => c.id === competition.id);
                              setEditingComp(raw);
                              setIsModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-blue-500 transition"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(competition.id, competition.sourceCollection)}
                            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-red-500 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegistration(competition.id, competition.registered)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
                            competition.registered
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200/20"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {competition.registered ? "Cancelar inscripción" : "Inscribirse"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para admin */}
      <CompetitionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingComp(null);
        }}
        onSave={handleSaveModal}
        initialData={editingComp}
        currentUser={currentUser}
      />

      {/* ══ MODAL DE SELECCIÓN DE ROBOT (USER) ══ */}
      {isRobotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Cpu className="text-red-500" size={20} />
                Selecciona tu Robot
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Selecciona cuál de tus robots disponibles inscribirás en esta competencia:
              </p>

              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {myRobots.map(robot => (
                  <div
                    key={robot.id}
                    onClick={() => setSelectedRobotId(robot.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedRobotId === robot.id
                        ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                        : "bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{robot.name}</p>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">{robot.tipoRobot} ({robot.category})</span>
                    </div>
                    {selectedRobotId === robot.id && (
                      <Check size={18} className="stroke-[3px]" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRobotModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEnrollment}
                  className="px-5 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition shadow-md shadow-red-500/20 text-sm"
                >
                  Confirmar Inscripción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Competitions;
