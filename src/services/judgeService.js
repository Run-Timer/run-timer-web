import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// -- LLAMAR ROBOT A PISTA --
export const llamarRobotAPista = async ({ compId, robotId, robotNombre, juezUid, rondaActual }) => {
  try {
    const sesionRef = doc(db, "carrera_activa", "sesion_actual");
    const sesionDoc = await getDoc(sesionRef);

    if (sesionDoc.exists()) {
      const estado = sesionDoc.data()?.estado ?? "idle";
      if (estado !== "idle") {
        throw new Error("La pista está ocupada. Espera a que termine la ronda actual.");
      }
    }

    await setDoc(sesionRef, {
      compId,
      robotId,
      robotNombre, // Guardado para compatibilidad
      estado: "active",
      rondaActual,
      tiempoTemp: 0,
      juezUid,
      timestamp: serverTimestamp(),
    });

    // Registrar log
    await registrarLog({
      compId,
      robotId,
      accion: "llamado",
      juezUid,
    });

    return null;
  } catch (error) {
    return error.message;
  }
};

// -- CONFIRMAR RESULTADO --
export const confirmarResultado = async ({
  compId,
  robotId,
  category,
  round,
  tiempoMs,
  juezUid,
  status,
}) => {
  try {
    // Verificar que no exista un tiempo ya registrado para esta ronda
    const existe = await existeRonda(robotId, compId, round);
    if (existe) {
      throw new Error("Ya existe un tiempo registrado para esta ronda.");
    }

    const esBest = await calcularBestLap({
      compId,
      robotId,
      tiempoMs,
      status,
    });

    if (esBest && status === "completed") {
      await actualizarBestLapAnterior(compId, robotId);
    }

    await addDoc(collection(db, "race_times"), {
      robotId,
      compId,
      category: category || "Libre",
      round,
      timeMs: status === "completed" ? tiempoMs : 0,
      penaltyMs: 0,
      finalTimeMs: status === "completed" ? tiempoMs : 0,
      registeredByUid: juezUid,
      status,
      bestLap: esBest && status === "completed",
      registeredAt: serverTimestamp(),
    });

    // Registrar log
    await registrarLog({
      compId,
      robotId,
      accion: status,
      juezUid,
    });

    await resetearSesion();
    return null;
  } catch (error) {
    return error.message;
  }
};

// -- RESETEAR SESION --
export const resetearSesion = async () => {
  try {
    const sesionRef = doc(db, "carrera_activa", "sesion_actual");
    await setDoc(sesionRef, {
      compId: "",
      robotId: "",
      estado: "idle",
      rondaActual: 1,
      tiempoTemp: 0,
      juezUid: "",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al resetear sesión:", error);
  }
};

// -- AUXILIARES --

const existeRonda = async (robotId, compId, round) => {
  const q = query(
    collection(db, "race_times"),
    where("robotId", "==", robotId),
    where("compId", "==", compId),
    where("round", "==", round)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

const calcularBestLap = async ({ compId, robotId, tiempoMs, status }) => {
  if (status !== "completed") return false;
  try {
    const q = query(
      collection(db, "race_times"),
      where("compId", "==", compId),
      where("robotId", "==", robotId),
      where("status", "==", "completed")
    );
    const snap = await getDocs(q);
    if (snap.empty) return true;

    const tiempos = snap.docs.map((d) => d.data().finalTimeMs ?? 0);
    const menor = Math.min(...tiempos);
    return tiempoMs < menor;
  } catch (e) {
    return true; // Asumir best lap si falla
  }
};

const actualizarBestLapAnterior = async (compId, robotId) => {
  try {
    const q = query(
      collection(db, "race_times"),
      where("compId", "==", compId),
      where("robotId", "==", robotId),
      where("bestLap", "==", true)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(db, "race_times", d.id), { bestLap: false });
    }
  } catch (e) {
    console.error("Error actualizando best laps anteriores:", e);
  }
};

const registrarLog = async ({ compId, robotId, accion, juezUid }) => {
  try {
    await addDoc(collection(db, "pista_log"), {
      compId,
      robotId,
      accion,
      juezUid,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error registrando log de pista:", e);
  }
};
