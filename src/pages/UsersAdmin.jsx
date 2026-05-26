import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Search,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/useAuth";

const ROLE_LABELS = {
  admin: "Administrador",
  judge: "Juez",
  captain: "Capitán",
  user: "Espectador / Normal"
};

const ROLE_COLORS = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20",
  judge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  captain: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  user: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
};

function UsersAdmin() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Solo el admin debería poder leer la colección completa de users
    if (userData?.role !== "admin") return;

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      // Ordenar por nombre (o por fecha si no tienen nombre)
      fetchedUsers.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error obteniendo usuarios:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
    } catch (error) {
      console.error("Error actualizando rol:", error);
      alert("No se pudo actualizar el rol: " + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <p className="text-xl text-zinc-500 animate-pulse">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* ── BOTÓN VOLVER ── */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>

      {/* ── CABECERA ── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            Gestión de Usuarios
            <Shield className="text-red-500" size={32} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Administra los roles y permisos de acceso al sistema.
          </p>
        </div>
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-red-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* ── MÉTRICAS RÁPIDAS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.keys(ROLE_LABELS).map(roleKey => (
          <div key={roleKey} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">{ROLE_LABELS[roleKey]}</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === roleKey).length}
            </p>
          </div>
        ))}
      </div>

      {/* ── TABLA DE USUARIOS ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck size={48} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
              <p className="text-gray-500 dark:text-zinc-400">No se encontraron usuarios.</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-left text-sm text-gray-500 dark:text-zinc-400 font-medium">
                  <th className="pb-4 pl-2">Usuario</th>
                  <th className="pb-4">Correo Electrónico</th>
                  <th className="pb-4">Fecha de Registro</th>
                  <th className="pb-4 text-center">Rol Actual</th>
                  <th className="pb-4 text-right pr-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const date = user.creadoEn?.seconds 
                    ? new Date(user.creadoEn.seconds * 1000).toLocaleDateString()
                    : "Desconocida";
                    
                  const userRole = user.role || "user";

                  return (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-300 dark:border-zinc-700">
                            {user.photoUrl ? (
                              <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <Users size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {user.nombre || "Usuario Sin Nombre"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
                              {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 text-gray-600 dark:text-zinc-300 text-sm">
                        {user.email || "Sin correo"}
                      </td>
                      
                      <td className="py-4 text-gray-500 dark:text-zinc-400 text-sm">
                        {date}
                      </td>

                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${ROLE_COLORS[userRole] || ROLE_COLORS.user}`}>
                          {userRole}
                        </span>
                      </td>

                      <td className="py-4 text-right pr-2">
                        <select
                          value={userRole}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500 transition cursor-pointer"
                        >
                          <option value="user">Espectador</option>
                          <option value="captain">Capitán</option>
                          <option value="judge">Juez</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default UsersAdmin;
