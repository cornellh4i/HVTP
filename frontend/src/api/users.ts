import { auth } from "@/lib/firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { apiRequest } from "./APIWrapper";

// Sign up a new user with Firebase Auth, then create their Firestore document
export const signUp = async (name: string, email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
  return apiRequest("/api/addUser", {
    method: "POST",
    body: { id: credential.user.uid, name, email },
    token,
  });
};

// Log in an existing user
export const logIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
  return credential.user;
};

// Log out the current user
export const logOut = async () => {
  document.cookie = "session=; path=/; max-age=0";
  await signOut(auth);
};

// Fetch all users
export const getAllUsers = async () => {
  return apiRequest("/api/getAllUsers", { method: "GET" });
};

// Fetch a single user by ID
export const getUserById = async (id: string) => {
  return apiRequest(`/api/getUserById/${encodeURIComponent(id)}`, { method: "GET" });
};

// Update a user
export const updateUser = async (id: string, data: object) => {
  return apiRequest(`/api/updateUser/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

// Delete a user
export const deleteUser = async (id: string) => {
  return apiRequest(`/api/deleteUser/${encodeURIComponent(id)}`, { method: "DELETE" });
};
