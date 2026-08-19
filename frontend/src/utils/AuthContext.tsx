"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { logOut } from "@/api/users";
import { generateTasks } from "@/api/tasks";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasGeneratedTasksRef = useRef(false);

  useEffect(() => {
    // onIdTokenChanged (rather than onAuthStateChanged) also fires when the SDK
    // silently refreshes the ID token roughly every hour. Writing the new token
    // to the cookie each time keeps it from expiring under a user who is still
    // active, which would otherwise bounce them out of the admin pages.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          setSessionCookie(await firebaseUser.getIdToken());
        } catch (error) {
          console.error("Failed to refresh session cookie:", error);
        }

        if (!hasGeneratedTasksRef.current) {
          hasGeneratedTasksRef.current = true;
          generateTasks().catch((error) => {
            console.error("Failed to generate tasks on sign-in:", error);
          });
        }
      } else {
        clearSessionCookie();
        hasGeneratedTasksRef.current = false;
      }
    });
    return unsubscribe;
  }, []);

  // Force sign-out after IDLE_TIMEOUT_MS of no user activity.
  useEffect(() => {
    if (!user) return;

    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        logOut().catch((error) => {
          console.error("Failed to log out after idle timeout:", error);
        });
      }, IDLE_TIMEOUT_MS);
    };

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetIdleTimer, { passive: true })
    );

    return () => {
      clearTimeout(idleTimer);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}