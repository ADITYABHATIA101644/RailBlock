/**
 * Maps raw Convex/network errors from the auth mutations to short,
 * human-friendly messages — and classifies which ones are worth retrying.
 */

export interface ClassifiedAuthError {
  /** Friendly one-liner shown in the form. */
  message: string;
  /** Raw error string (kept for details/expansion). */
  raw: string;
  /** Transient backend/network issue — safe to auto-retry. */
  retryable: boolean;
  /** User locked out or rate limited — do not retry silently. */
  locked: boolean;
}

const RETRYABLE_PATTERNS = [
  "fetch failed",
  "networkerror",
  "network error",
  "failed to fetch",
  "loadfailed",
  "timeout",
  "timed out",
  "connection",
  "econnrefused",
  "socket",
  "websocket",
  "internal server error",
  "server error",
  "500",
  "502",
  "503",
  "504",
  "rate limited",
  "too many requests",
  "429",
];

const LOCK_PATTERNS = [
  "locked",
  "too many failed attempts",
  "too many login attempts",
];

export function classifyAuthError(err: unknown): ClassifiedAuthError {
  let raw = "Unknown error";
  if (err instanceof Error) raw = err.message;
  else if (typeof err === "string") raw = err;
  else if (err && typeof err === "object") {
    const m = (err as { message?: unknown; data?: unknown }).message;
    const d = (err as { data?: unknown }).data;
    if (typeof m === "string") raw = m;
    else if (typeof d === "string") raw = d;
  }
  const lower = raw.toLowerCase();

  const locked = LOCK_PATTERNS.some((p) => lower.includes(p));
  const retryable = !locked && RETRYABLE_PATTERNS.some((p) => lower.includes(p));

  let message: string;
  if (locked) {
    message = raw.includes("minute") ? raw : "Account temporarily locked. Please wait a few minutes and try again.";
  } else if (retryable) {
    // Shown only if all automatic retries are exhausted — invite a manual retry
    // instead of promising one that already happened.
    message = "Can't reach the railway backend right now. Check your connection and try again.";
  } else if (lower.includes("invalid email or password")) {
    message = "Invalid email or password. Please check your credentials.";
  } else if (lower.includes("already exists")) {
    message = "An account with this email already exists. Try signing in instead.";
  } else if (lower.includes("password must")) {
    message = raw;
  } else if (lower.includes("invalid email")) {
    message = "That email address doesn't look right. Please check it.";
  } else if (lower.includes("unauthenticated") || lower.includes("not signed in")) {
    message = "Your session has expired. Please sign in again.";
  } else {
    message = "Something went wrong. Please try again in a moment.";
  }

  return { message, raw, retryable, locked };
}
