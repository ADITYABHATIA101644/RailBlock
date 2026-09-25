import { useAuth } from "@/hooks/use-auth";
import { Loader2, WifiOff, RefreshCw, Train } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

/**
 * Gate for authenticated routes.
 *
 * - While loading: spinner.
 * - Backend temporarily unreachable (transient 502/network blip during a
 *   sandbox restart): show a reconnect screen — do NOT redirect to /login.
 *   The stored session token is still valid; redirecting would discard it and
 *   force a pointless re-login.
 * - Confirmed unauthenticated: redirect to /login preserving the return path.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, backendDown, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (backendDown && !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <WifiOff className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Reconnecting to the railway backend</h1>
          <p className="text-sm text-muted-foreground">
            The command center can't reach Convex right now — this is usually a brief network or
            sandbox hiccup. Your session is safe; we'll keep the connection open.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={retrySession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#050606] text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry now
            </button>
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Train className="w-3.5 h-3.5" /> Session preserved
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return children;
}
