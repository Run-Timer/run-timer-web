/**
 * liveRaceService.js
 * Suscripciones de solo-lectura para la vista pública de carreras en vivo.
 * No requiere autenticación — las colecciones deben permitir lectura pública
 * en las reglas de Firestore.
 */

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { ref, onValue } from "firebase/database";

import { db, database } from "../firebase/firebase";

// Solo la colección principal — competencias no existe en este proyecto
const COMP_COLLECTIONS = ["competitions"];

/**
 * Suscripción a todas las competencias activas.
 * Lee ambas colecciones y filtra status === "activa" en el cliente
 * para evitar índices compuestos y permisos extra en Firestore.
 *
 * @param {(competitions: Array) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} unsubscribe
 */
/** Reune todos los docs cacheados en un array plano. */
function collectAll(snapshotsByCollection) {
  return COMP_COLLECTIONS.flatMap(
    (c) => snapshotsByCollection.get(c) ?? []
  );
}

/** Determina si una competencia está activa. */
function isActive(comp) {
  return (
    comp.status === "activa" ||
    comp.status === "active" ||
    comp.status === "Activa"
  );
}

export const subscribeToActiveCompetitions = (onData, onError) => {
  const snapshotsByCollection = new Map();

  const unsubscribes = COMP_COLLECTIONS.map((colName) =>
    onSnapshot(
      collection(db, colName),
      (snapshot) => {
        snapshotsByCollection.set(
          colName,
          snapshot.docs.map((d) => ({ id: d.id, sourceCollection: colName, ...d.data() }))
        );
        onData(collectAll(snapshotsByCollection).filter(isActive));
      },
      (error) => {
        console.error(`Competitions error (${colName}):`, error);
        if (onError) onError(error);
      }
    )
  );

  return () => unsubscribes.forEach((u) => u());
};

/**
 * Suscripción a la sesión activa del hardware (RTDB).
 * Devuelve el estado actual de la pista: tiempoMs, status del robot, etc.
 * @param {(data: object) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} unsubscribe
 */
export const subscribeToLiveSession = (onData, onError) => {
  const rootRef = ref(database);

  const unsubscribe = onValue(
    rootRef,
    (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        onData({ online: false, tiempoMs: 0, status: "idle" });
        return;
      }

      const hardware = value.hardware?.esp32 ?? {};
      const sesion = value.carrera_activa?.sesion_actual ?? {};
      const tiempoActual = value.tiempo_actual ?? {};

      onData({
        online: hardware.online ?? Boolean(value.comando || value.tiempo_actual),
        tiempoMs: tiempoActual.tiempoMs ?? 0,
        status: sesion.estado ?? "idle",
        robotId: sesion.robot_id ?? null,
        robotNombre: sesion.robot_nombre ?? null,
        rondaActual: sesion.ronda_actual ?? null,
        mejorTiempo: hardware.mejor_tiempo ?? null,
        sensoresCount: hardware.sensores_count ?? 0,
        participantesCount: hardware.participantes_count ?? 0,
        ultimoTiempoMs: sesion.tiempo_temp ?? null,
      });
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Suscripción a los tiempos de la colección race_times.
 * Filtra por compId en el cliente para evitar índices compuestos
 * y problemas de permisos con queries filtrados.
 *
 * Los documentos de race_times usan el campo "compId" (Flutter app).
 *
 * @param {string} competitionId
 * @param {(times: Array) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} unsubscribe
 */
export const subscribeToRaceTimes = (competitionId, onData, onError) => {
  if (!competitionId) return () => {};

  return onSnapshot(
    collection(db, "race_times"),
    (snapshot) => {
      const times = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        // El campo en Firestore es "compId" (usado por la app Flutter)
        .filter((t) => t.compId === competitionId || t.competitionId === competitionId);

      // Ordenar por finalTimeMs ascendente (mejor tiempo primero)
      times.sort(
        (a, b) =>
          (a.finalTimeMs ?? a.timeMs ?? Infinity) -
          (b.finalTimeMs ?? b.timeMs ?? Infinity)
      );

      onData(times);
    },
    (error) => {
      console.error("RaceTimes error:", error);
      if (onError) onError(error);
    }
  );
};
