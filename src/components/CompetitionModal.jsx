import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { Timestamp } from "firebase/firestore";

function CompetitionModal({ isOpen, onClose, onSave, initialData, currentUser }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    category: "Libre",
    totalRounds: 3,
    status: "active",
    judgeUid: "",
    date: ""
  });

  useEffect(() => {
    let timeoutId;
    if (initialData) {
      timeoutId = setTimeout(() => setFormData({
        name: initialData.name || "",
        location: initialData.location || "",
        description: initialData.description || "",
        category: initialData.category || "Libre",
        totalRounds: initialData.totalRounds || 3,
        status: initialData.status || "active",
        judgeUid: initialData.judgeUid || "",
        date: initialData.date?.seconds 
          ? new Date(initialData.date.seconds * 1000).toISOString().split("T")[0] 
          : (initialData.date || "")
      }), 0);
    } else {
      timeoutId = setTimeout(() => setFormData({
        name: "",
        location: "",
        description: "",
        category: "Libre",
        totalRounds: 3,
        status: "active",
        judgeUid: "",
        date: new Date().toISOString().split("T")[0]
      }), 0);
    }
    
    return () => clearTimeout(timeoutId);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Firestore rules require specific fields
    const targetDate = new Date(formData.date);
    const dateTimestamp = Timestamp.fromDate(targetDate);
    
    const reminder7 = new Date(targetDate);
    reminder7.setDate(reminder7.getDate() - 7);
    
    const reminder1 = new Date(targetDate);
    reminder1.setDate(reminder1.getDate() - 1);

    const submission = {
      name: formData.name,
      location: formData.location,
      description: formData.description,
      category: formData.category,
      totalRounds: parseInt(formData.totalRounds, 10),
      status: formData.status,
      judgeUid: formData.judgeUid || "pending",
      date: dateTimestamp,
      reminder7days: Timestamp.fromDate(reminder7),
      reminder1day: Timestamp.fromDate(reminder1),
    };

    if (!initialData) {
      submission.createdByUid = currentUser.uid;
      submission.reminder7daysSent = false;
      submission.reminder1daySent = false;
    }

    onSave(submission, initialData?.id, initialData?.sourceCollection);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Editar Competencia" : "Nueva Competencia"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Fecha</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Ubicación</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Categoría</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white">
              {['Seguidor de línea', 'Laberinto', 'Sumo', 'Velocidad', 'Obstáculos', 'Libre'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Rondas (Max 20)</label>
              <input required type="number" min="1" max="20" value={formData.totalRounds} onChange={e => setFormData({...formData, totalRounds: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white">
                <option value="active">Activa</option>
                <option value="closed">Cerrada</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Descripción</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition text-gray-900 dark:text-white min-h-[80px]" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition shadow-md shadow-red-500/20">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CompetitionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
};

export default CompetitionModal;
