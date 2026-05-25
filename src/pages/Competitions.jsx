import { useEffect, useState } from "react";
import { db, auth } from "../services/authService";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
} from "lucide-react";

function Competitions() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Escuchar la colección "competencias" en tiempo real desde Firestore
    const unsubscribe = onSnapshot(collection(db, "competencias"), (snapshot) => {
      const compsArray = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Formatear fecha si viene como Timestamp de Firebase
        const formattedDate = data.date?.seconds 
          ? new Date(data.date.seconds * 1000).toLocaleDateString()
          : data.date;

        // Comprobar si el ID del usuario actual está en la lista de inscritos
        const isRegistered = data.userIds?.includes(currentUser.uid) || false;
        // Contar participantes reales basados en el arreglo o usar el número estático del documento
        const participantsCount = data.userIds ? data.userIds.length : (data.participants || 0);

        compsArray.push({
          id: doc.id,
          ...data,
          date: formattedDate,
          registered: isRegistered,
          participants: participantsCount
        });
      });
      
      setCompetitions(compsArray);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando competiciones:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, currentUser]);

  // Función lógica para Inscribirse / Cancelar Inscripción real en Firestore
  const handleRegistration = async (competitionId, isRegistered) => {
    if (!currentUser) return;

    const compRef = doc(db, "competencias", competitionId);

    try {
      if (isRegistered) {
        // Cancelar: remover el UID del piloto del arreglo en Firestore
        await updateDoc(compRef, {
          userIds: arrayRemove(currentUser.uid)
        });
      } else {
        // Inscribirse: añadir el UID del piloto al arreglo en Firestore
        await updateDoc(compRef, {
          userIds: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error al gestionar la inscripción:", error);
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
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
          Competiciones
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Próximas competencias disponibles para participar.
        </p>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Competitions;