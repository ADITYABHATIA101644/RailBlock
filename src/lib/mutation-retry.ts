/**
 * Tiny retry helper for Convex mutations that may fail transiently
 * (network blips, rate limits, cold deployments). Used by the auth pages
 * so a flaky connection doesn't surface a scary error to the user.
 */

export interface RetryOptions {
  /** Return true to retry this error. */
  shouldRetry?: (err: unknown) => boolean;
  /** Called before each retry wait. */
  onRetry?: (attempt: number, delayMs: number, err: unknown) => void;
  /** Total attempts including the first (default 3). */
  maxAttempts?: number;
  /** Base backoff in ms; grows linearly per attempt (default 1200). */
  baseDelayMs?: number;
}

export async function runWithRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const shouldRetry = opts.shouldRetry ?? (() => false);
  const baseDelay = opts.baseDelayMs ?? 1200;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts || !shouldRetry(err)) throw err;
      const delay = baseDelay * attempt;
      opts.onRetry?.(attempt, delay, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}
