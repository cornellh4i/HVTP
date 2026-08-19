/**
 * The `session` cookie holds the current Firebase ID token so that Next
 * middleware can gate the admin routes before a page renders. It is not the
 * source of truth for auth — the backend verifies the token on every request.
 *
 * Kept in one place because the cookie's flags and lifetime have to stay in
 * sync with what `middleware.ts` expects.
 */
const SESSION_COOKIE = "session";

// Firebase ID tokens last an hour; the SDK refreshes them a few minutes early
// and AuthContext writes the new value here, so the cookie is renewed before
// it can expire under an active user.
const MAX_AGE_SECONDS = 3600;

export function setSessionCookie(token: string): void {
  // `Secure` would make the cookie silently fail over plain http in local dev.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${SESSION_COOKIE}=${token}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Strict${secure}`;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}
