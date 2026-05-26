import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Award,
  BookOpen,
} from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/useAuth";

const CATEGORIES = ["Novato", "Intermedio", "Avanzado", "Experto"];
const TYPES = ["Seguidor de línea", "Laberinto", "Sumo", "Velocidad", "Obstáculos", "Libre"];

function MyRobots() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [robots, setRobots] = useState([]);
  const [competitions, setCompetitions] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRobot, setEditingRobot] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Novato",
    tipoRobot: "Seguidor de línea",
    description: "",
  });

  // 1. Cargar robots del capitán actual
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "robots"),
      where("captainUid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setRobots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error cargando robots:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Cargar nombres de las competencias para lookup
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "competitions"), (snap) => {
      const compsMap = {};
      snap.docs.forEach(d => {
        compsMap[d.id] = d.data().name;
      });
      setCompetitions(compsMap);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingRobot(null);
    setFormData({
      name: "",
      category: "Novato",
      tipoRobot: "Seguidor de línea",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (robot) => {
    setEditingRobot(robot);
    setFormData({
      name: robot.name || "",
      category: robot.category || "Novato",
      tipoRobot: robot.tipoRobot || "Seguidor de línea",
      description: robot.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingRobot) {
        // Editar
        await updateDoc(doc(db, "robots", editingRobot.id), {
          name: formData.name,
          category: formData.category,
          tipoRobot: formData.tipoRobot,
          description: formData.description,
        });
      } else {
        // Crear nuevo robot
        await addDoc(collection(db, "robots"), {
          name: formData.name,
          category: formData.category,
          tipoRobot: formData.tipoRobot,
          description: formData.description,
          captainUid: currentUser.uid,
          captainName: userData?.nombre || "Capitán",
          compIdActual: "",
          historial: [],
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error guardando robot:", e);
      alert("Error: " + e.message);
    }
  };

  const handleDelete = async (robotId, compIdActual) => {
    if (compIdActual) {
      alert("No puedes eliminar un robot que está actualmente inscrito en una competencia.");
      return;
    }

    if (globalThis.confirm("¿Seguro que deseas eliminar este robot?")) {
      try {
        await deleteDoc(doc(db, "robots", robotId));
      } catch (e) {
        console.error("Error eliminando robot:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <p className="text-xl text-zinc-500 animate-pulse">Cargando tus robots...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* ── VOLVER ── */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-md shadow-red-500/20"
        >
          <Plus size={20} />
          Nuevo Robot
        </button>
      </div>

      {/* ── CABECERA ── */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
          Mis Robots
          <Cpu className="text-red-500 animate-pulse" size={32} />
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Administra y configura tus robots competidores para los torneos de RunTimer.
        </p>
      </div>

      {/* ── LISTADO ── */}
      {robots.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
          <Cpu size={48} className="mx-auto text-zinc-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Aún no tienes robots registrados</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Registra tu primer robot para poder inscribirlo en competencias activas.
          </p>
          <button
            onClick={openAddModal}
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-sm"
          >
            Registrar Robot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => {
            const date = robot.createdAt?.seconds 
              ? new Date(robot.createdAt.seconds * 1000).toLocaleDateString()
              : "Reciente";

            return (
              <motion.div
                key={robot.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${
                      robot.compIdActual 
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-green-500/10 text-green-500 border-green-500/20"
                    }`}>
                      {robot.compIdActual ? "Competiendo" : "Disponible"}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(robot)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(robot.id, robot.compIdActual)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{robot.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5 line-clamp-2">{robot.description || "Sin descripción física."}</p>
                  
                  <div className="space-y-2.5 text-sm border-t border-gray-100 dark:border-zinc-800/80 pt-4">
                    <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5"><Layers size={14} /> Modalidad</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{robot.tipoRobot}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5"><Award size={14} /> Nivel</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{robot.category}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Creado</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{date}</span>
                    </div>
                  </div>
                </div>

                {robot.compIdActual && (
                  <div className="mt-5 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Inscrito en:</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {competitions[robot.compIdActual] || "Cargando torneo..."}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ══ MODAL DE CREACIÓN / EDICIÓN ══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRobot ? "Editar Robot" : "Registrar Robot"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Nombre del Robot</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white"
                  placeholder="Ej. SonicSpeed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Modalidad</label>
                  <select
                    value={formData.tipoRobot}
                    onChange={e => setFormData({...formData, tipoRobot: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white cursor-pointer"
                  >
                    {TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Nivel</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Descripción física</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white min-h-[80px]"
                  placeholder="Sensores, motores, peso, dimensiones, etc."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition shadow-md shadow-red-500/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default MyRobots;
