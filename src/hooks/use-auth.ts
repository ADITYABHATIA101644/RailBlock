import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

/**
 * Session-token auth (from /login and /signup pages).
 * Validates the token against the Convex `security` backend and returns the
 * user when the session is active. Returns null state when no token exists.
 *
 * Resilience: a transient backend/network failure (e.g. the sandbox briefly
 * returning 502 during a restart) must NOT destroy the stored token — the
 * session may still be perfectly valid on the server. Only an explicit
 * "session invalid" response removes it. Transient failures trigger bounded
 * retries with backoff, plus immediate revalidation when the browser reports
 * connectivity restored.
 */
function useSessionAuth() {
  const [sessionUser, setSessionUser] = useState<{
    userId: string;
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    division?: string;
    zone?: string;
  } | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(
    () => localStorage.getItem("railblock_session_token") !== null,
  );
  const [sessionUnavailable, setSessionUnavailable] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const validateSessionMutation = useMutation(api.security.validateSession);

  useEffect(() => {
    const token = localStorage.getItem("railblock_session_token");
    if (!token) {
      setSessionLoading(false);
      setSessionUnavailable(false);
      return;
    }
    let cancelled = false;
    // Bounded backoff: 0s, 2s, 4s, 8s, 16s between attempts (6 tries total).
    const delaysMs = [0, 2000, 4000, 8000, 16000];

    (async () => {
      setSessionLoading(true);
      for (let attempt = 0; attempt < delaysMs.length; attempt++) {
        if (delaysMs[attempt] > 0) {
          await new Promise((r) => setTimeout(r, delaysMs[attempt]));
        }
        if (cancelled) return;
        try {
          const result = await validateSessionMutation({ sessionToken: token });
          if (cancelled) return;
          if (result) {
            setSessionUser(result);
            setSessionUnavailable(false);
            setSessionLoading(false);
            return;
          }
          // Server explicitly says the session is invalid/expired — the only
          // case where deleting the stored token is correct.
          localStorage.removeItem("railblock_session_token");
          setSessionUser(null);
          setSessionUnavailable(false);
          setSessionLoading(false);
          return;
        } catch {
          // Transient failure — keep the token and retry after a backoff.
          if (cancelled) return;
        }
      }
      // All retries exhausted: keep the token, surface a reconnect affordance.
      if (!cancelled) {
        setSessionUser(null);
        setSessionUnavailable(true);
        setSessionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryNonce]);

  // Revalidate immediately once connectivity is back (or on manual retry).
  useEffect(() => {
    const handleOnline = () => setRetryNonce((n) => n + 1);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("railblock_session_token");
    sessionStorage.removeItem("railblock_role");
    setSessionUser(null);
    setSessionLoading(false);
    setSessionUnavailable(false);
  }, []);

  const retrySession = useCallback(() => setRetryNonce((n) => n + 1), []);

  return { sessionUser, sessionLoading, sessionUnavailable, clearSession, retrySession };
}

/**
 * Unified auth hook. Supports BOTH auth systems:
 * 1. Session-token auth (email+password via /login, /signup) — primary
 * 2. Convex Auth (email OTP, guest anonymous via /auth) — legacy fallback
 * Whichever reports an authenticated user wins.
 */
export function useAuth() {
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthed } = useConvexAuth();
  const convexUser = useQuery(api.users.currentUser);
  const { signIn, signOut: convexSignOut } = useAuthActions();
  const { sessionUser, sessionLoading, sessionUnavailable, clearSession, retrySession } = useSessionAuth();

  const hasSessionUser = sessionUser !== null;

  // Session-token auth wins if present; otherwise fall back to Convex Auth.
  const isAuthenticated = hasSessionUser || isConvexAuthed;
  const isLoading = sessionLoading || (isConvexAuthLoading && !hasSessionUser) || (!hasSessionUser && isConvexAuthed && convexUser === undefined);

  const user = hasSessionUser
    ? sessionUser
    : isConvexAuthed
      ? convexUser
      : null;

  const signOut = async () => {
    // Sign out from both systems (only the active one will do anything)
    clearSession();
    if (isConvexAuthed || isConvexAuthLoading) {
      try {
        await convexSignOut();
      } catch {
        // Not signed in via Convex Auth — ignore
      }
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
    backendDown: sessionUnavailable,
    retrySession,
  };
}
