import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const competitionsRef =
  collection(db, "competitions");

/* OBTENER TODAS */
export const getCompetitions =
  async () => {
    const snapshot =
      await getDocs(
        competitionsRef
      );

    return snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );
  };

/* CREAR */
export const createCompetition =
  async (
    competitionData
  ) => {
    return await addDoc(
      competitionsRef,
      competitionData
    );
  };

/* ACTUALIZAR */
export const updateCompetition =
  async (
    id,
    data
  ) => {
    const competitionDoc =
      doc(
        db,
        "competitions",
        id
      );

    await updateDoc(
      competitionDoc,
      data
    );
  };

/* ELIMINAR */
export const deleteCompetition =
  async (id) => {
    const competitionDoc =
      doc(
        db,
        "competitions",
        id
      );

    await deleteDoc(
      competitionDoc
    );
  };