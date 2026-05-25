import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export const COMPETITION_COLLECTIONS = [
  "competitions",
  "competencias",
];

const normalizeCompetition = (
  snapshot,
  sourceCollection
) => ({
  id: snapshot.id,
  sourceCollection,
  ...snapshot.data(),
});

const buildCompetitionList = (
  snapshotsByCollection
) => {
  const competitions = new Map();

  [...COMPETITION_COLLECTIONS]
    .reverse()
    .forEach((collectionName) => {
      const docs =
        snapshotsByCollection.get(collectionName) || [];

      docs.forEach((item) => {
        competitions.set(item.id, item);
      });
    });

  return Array.from(competitions.values());
};

export const subscribeToCompetitions = (
  onData,
  onError
) => {
  const snapshotsByCollection = new Map();

  const unsubscribes =
    COMPETITION_COLLECTIONS.map((collectionName) =>
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          snapshotsByCollection.set(
            collectionName,
            snapshot.docs.map((docSnapshot) =>
              normalizeCompetition(
                docSnapshot,
                collectionName
              )
            )
          );

          onData(
            buildCompetitionList(
              snapshotsByCollection
            )
          );
        },
        (error) => {
          if (onError) {
            onError(error);
          }
        }
      )
    );

  return () => {
    unsubscribes.forEach((unsubscribe) =>
      unsubscribe()
    );
  };
};

export const getCompetitions =
  async () => {
    const snapshots = await Promise.all(
      COMPETITION_COLLECTIONS.map(
        (collectionName) =>
          getDocs(
            collection(db, collectionName)
          ).then((snapshot) =>
            snapshot.docs.map((docSnapshot) =>
              normalizeCompetition(
                docSnapshot,
                collectionName
              )
            )
          )
      )
    );

    const snapshotsByCollection = new Map(
      COMPETITION_COLLECTIONS.map(
        (collectionName, index) => [
          collectionName,
          snapshots[index],
        ]
      )
    );

    return buildCompetitionList(
      snapshotsByCollection
    );
  };

export const createCompetition =
  async (
    competitionData,
    sourceCollection = "competitions"
  ) => {
    return addDoc(
      collection(db, sourceCollection),
      competitionData
    );
  };

export const updateCompetition =
  async (
    id,
    data,
    sourceCollection = "competitions"
  ) => {
    const competitionDoc = doc(
      db,
      sourceCollection,
      id
    );

    await updateDoc(
      competitionDoc,
      data
    );
  };

export const deleteCompetition =
  async (
    id,
    sourceCollection = "competitions"
  ) => {
    const competitionDoc = doc(
      db,
      sourceCollection,
      id
    );

    await deleteDoc(
      competitionDoc
    );
  };

export const toggleCompetitionRegistration =
  async (
    competitionId,
    userId,
    isRegistered,
    sourceCollection = "competitions"
  ) => {
    const competitionDoc = doc(
      db,
      sourceCollection,
      competitionId
    );

    await updateDoc(
      competitionDoc,
      {
        userIds: isRegistered
          ? arrayRemove(userId)
          : arrayUnion(userId),
      }
    );
  };
