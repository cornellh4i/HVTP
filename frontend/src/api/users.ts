import { auth } from "@/lib/firebase/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { apiRequest } from "./APIWrapper";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

// Log in an existing user
export const logIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Set eagerly rather than waiting on AuthContext's listener, so the cookie is
  // in place before the login page redirects into a middleware-gated route.
  setSessionCookie(await credential.user.getIdToken());
  return credential.user;
};

// Log out the current user
export const logOut = async () => {
  clearSessionCookie();
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
