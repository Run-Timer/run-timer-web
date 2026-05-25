import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export {
  auth,
  db,
  googleProvider,
} from "../firebase/firebase";
export const registerUser = async (
  email,
  password,
  nombre
) => {
  const response = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = response.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    nombre,
    role: "user",
    fcmToken: "",
    photoUrl: user.photoURL || "",
    creadoEn: serverTimestamp(),
  });

  return user;
};

export const loginUser = async (
  email,
  password
) => {
  const response = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return response.user;
};

export const loginWithGoogle = async () => {
  const response = await signInWithPopup(
    auth,
    googleProvider
  );

  const user = response.user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      nombre: user.displayName || "Usuario",
      role: "user",
      fcmToken: "",
      photoUrl: user.photoURL || "",
      creadoEn: serverTimestamp(),
    },
    { merge: true }
  );

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};