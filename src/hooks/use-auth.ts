import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

/**
 * Session-token auth (from /login and /signup pages).
 * Validates the token against the Convex `security` backend and returns the
 * user when the session is active. Returns null state when no token exists.
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
  const validateSessionMutation = useMutation(api.security.validateSession);

  useEffect(() => {
    const token = localStorage.getItem("railblock_session_token");
    if (!token) {
      setSessionLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await validateSessionMutation({ sessionToken: token });
        if (cancelled) return;
        if (result) {
          setSessionUser(result);
        } else {
          // Invalid/expired session — clean up stale token
          localStorage.removeItem("railblock_session_token");
          setSessionUser(null);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("railblock_session_token");
          setSessionUser(null);
        }
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("railblock_session_token");
    sessionStorage.removeItem("railblock_role");
    setSessionUser(null);
    setSessionLoading(false);
  }, []);

  return { sessionUser, sessionLoading, clearSession };
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
  const { sessionUser, sessionLoading, clearSession } = useSessionAuth();

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
  };
}
