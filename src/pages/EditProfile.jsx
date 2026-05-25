import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EditProfile() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const fileInputRef = useRef(null);

  const [nombre, setNombre] = useState(userData?.nombre || currentUser?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    userData?.photoUrl || currentUser?.photoURL || "https://ui-avatars.com/api/?name=RunTimer"
  );

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setStatus({ type: "error", message: "Las nuevas contraseñas no coinciden." });
        setLoading(false);
        return;
      }
      if (!currentPassword) {
        setStatus({ type: "error", message: "Debes ingresar tu contraseña actual para realizar cambios de seguridad." });
        setLoading(false);
        return;
      }
    }

    try {
      console.log("Datos enviados:", { nombre, imageFile, currentPassword, newPassword });

      setStatus({ type: "success", message: "Perfil actualizado correctamente." });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus({ 
        type: "error", 
        message: error.message || "Ocurrió un error al actualizar el perfil." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 md:p-10 flex justify-center items-start transition-colors duration-300"
    >
      <div className="w-full max-w-3xl">
        
        {/* BOTÓN VOLVER CON ESTILO UNIFICADO */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white transition shadow-sm"
          >
            <ArrowLeft size={16} />
            Volver al Perfil
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Editar Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECCIÓN FOTO DE PERFIL */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm transition-colors duration-300">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <img
                src={imagePreview}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700 group-hover:opacity-70 dark:group-hover:opacity-60 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-gray-900 dark:text-white bg-black/10 dark:bg-black/40 rounded-full">
                <Camera size={24} className="text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Foto de perfil</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Sube una imagen cuadrada en formato JPG o PNG.</p>
              <button
                type="button"
                onClick={triggerFileInput}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold transition"
              >
                Cambiar imagen
              </button>
            </div>
          </div>

          {/* MENSAJES DE STATUS */}
          {status.type && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-2xl flex items-center gap-3 border ${
                status.type === "success" 
                  ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-semibold">{status.message}</p>
            </motion.div>
          )}

          {/* INFORMACIÓN PERSONAL */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 space-y-6 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold border-b border-gray-100 dark:border-zinc-800 pb-4 text-gray-900 dark:text-white">Información Personal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                  <User size={16} /> Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 focus:border-red-500 dark:focus:border-red-500 focus:outline-none transition w-full font-medium"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-400 dark:text-gray-500 text-sm font-medium flex items-center gap-2">
                  <Mail size={16} /> Correo electrónico
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-2xl px-4 py-3.5 text-gray-400 dark:text-zinc-600 cursor-not-allowed w-full font-medium"
                />
              </div>
            </div>
          </div>

          {/* SEGURIDAD / CONTRASEÑAS */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 space-y-6 shadow-sm transition-colors duration-300">
            <div>
              <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Seguridad</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Deja los campos en blanco si no deseas cambiar tu contraseña.</p>
            </div>
            <hr className="border-gray-100 dark:border-zinc-800" />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                    <Lock size={16} /> Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 focus:border-red-500 focus:outline-none transition w-full"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                    <Lock size={16} /> Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 focus:border-red-500 focus:outline-none transition w-full"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>

              {/* CONTRASEÑA ACTUAL REQUERIDA */}
              {(newPassword || confirmPassword) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-2 pt-2"
                >
                  <label className="text-red-500 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                    <Lock size={16} /> Contraseña actual requerida
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-black border border-red-400/60 dark:border-red-500/40 text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 focus:border-red-500 focus:outline-none transition w-full md:w-1/2"
                    placeholder="Ingresa tu clave actual"
                    required
                />
                </motion.div>
              )}
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-red-500/10 disabled:shadow-none w-full sm:w-auto justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
}

export default EditProfile;