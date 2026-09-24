import { describe, expect, test } from "bun:test";
import { classifyAuthError, type ClassifiedAuthError } from "./auth-errors";

function c(err: unknown): ClassifiedAuthError {
  return classifyAuthError(err);
}

describe("classifyAuthError — lockouts", () => {
  test("detects account locked messages and is not retryable", () => {
    const r = c(new Error("Account temporarily locked due to too many failed attempts. Try again in 12 minutes."));
    expect(r.locked).toBe(true);
    expect(r.retryable).toBe(false);
    expect(r.message).toContain("12 minutes");
  });

  test("lock message with wait time is surfaced verbatim", () => {
    const r = c("Too many login attempts. Account temporarily locked for 15 minutes.");
    expect(r.locked).toBe(true);
    expect(r.message).toContain("15 minutes");
  });

  test("remaining-attempts errors are NOT lockouts", () => {
    const r = c(new Error("Invalid email or password. 3 attempts remaining."));
    expect(r.locked).toBe(false);
    expect(r.retryable).toBe(false);
    expect(r.message).toContain("Invalid email or password");
  });
});

describe("classifyAuthError — retryable network/server errors", () => {
  test("flags fetch/network failures as retryable", () => {
    for (const msg of ["TypeError: fetch failed", "Failed to fetch", "NetworkError when attempting to fetch resource.", "WebSocket closed unexpectedly"]) {
      const r = c(new Error(msg));
      expect(r.retryable).toBe(true);
      expect(r.locked).toBe(false);
    }
  });

  test("flags server errors and timeouts as retryable", () => {
    for (const msg of ["HTTP 503 Service Unavailable", "Request timed out", "Internal Server Error", "502"]) {
      expect(c(new Error(msg)).retryable).toBe(true);
    }
  });

  test("rate limit / 429 is retryable but not locked", () => {
    const r = c(new Error("Rate limited: too many requests (429)"));
    expect(r.retryable).toBe(true);
    expect(r.locked).toBe(false);
  });

  test("lock wins over retryable when both patterns match", () => {
    const r = c(new Error("Account locked after too many failed attempts (connection reset)"));
    expect(r.locked).toBe(true);
    expect(r.retryable).toBe(false);
  });
});

describe("classifyAuthError — friendly message mapping", () => {
  test("invalid credentials", () => {
    expect(c("Invalid email or password").message).toBe("Invalid email or password. Please check your credentials.");
  });

  test("duplicate signup", () => {
    expect(c("An account with this email already exists. Please sign in instead.").message).toContain("already exists");
  });

  test("server-side password rule surfaces verbatim", () => {
    const msg = "Password must contain at least one special character (!@#$%^&*)";
    expect(c(msg).message).toBe(msg);
  });

  const cases: Array<[string, string]> = [
    ["Invalid email address format", "That email address doesn't look right. Please check it."],
    ["Unauthenticated, user not signed in", "Your session has expired. Please sign in again."],
    ["ArgumentValidationError: Object is missing the required field", "Something went wrong. Please try again in a moment."],
  ];
  test.each(cases)("%s", (raw, expected) => {
    expect(c(raw).message).toBe(expected);
  });
});

describe("classifyAuthError — raw error shapes", () => {
  test("handles non-Error throws (strings, objects, null)", () => {
    expect(c("fetch failed").retryable).toBe(true);
    expect(c({ message: "locked" }).locked).toBe(true);
    expect(c({ data: "Too many requests" }).retryable).toBe(true);
    expect(c(null).message).toBe("Something went wrong. Please try again in a moment.");
    expect(c(undefined).raw).toBe("Unknown error");
  });
});
