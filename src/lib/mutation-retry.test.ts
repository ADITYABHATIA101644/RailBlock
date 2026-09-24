import { describe, expect, test } from "bun:test";
import { runWithRetry } from "./mutation-retry";

describe("runWithRetry", () => {
  test("returns immediately when fn succeeds", async () => {
    let calls = 0;
    const result = await runWithRetry(
      async () => {
        calls++;
        return "ok";
      },
      { baseDelayMs: 1, shouldRetry: () => true },
    );
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  test("retries retryable failures and succeeds", async () => {
    let calls = 0;
    const retries: number[] = [];
    const result = await runWithRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error("fetch failed");
        return "recovered";
      },
      {
        baseDelayMs: 1,
        shouldRetry: () => true,
        onRetry: (attempt) => retries.push(attempt),
      },
    );
    expect(result).toBe("recovered");
    expect(calls).toBe(3);
    expect(retries).toEqual([1, 2]);
  });

  test("throws immediately when shouldRetry returns false", async () => {
    let calls = 0;
    await expect(
      runWithRetry(
        async () => {
          calls++;
          throw new Error("Invalid email or password");
        },
        { baseDelayMs: 1, shouldRetry: () => false, maxAttempts: 3 },
      ),
    ).rejects.toThrow("Invalid email or password");
    expect(calls).toBe(1);
  });

  test("gives up after maxAttempts and rethrows the last error", async () => {
    let calls = 0;
    await expect(
      runWithRetry(
        async () => {
          calls++;
          throw new Error(`still down (call ${calls})`);
        },
        { baseDelayMs: 1, shouldRetry: () => true, maxAttempts: 3 },
      ),
    ).rejects.toThrow("still down (call 3)");
    expect(calls).toBe(3);
  });

  test("passes the attempt number to fn", async () => {
    const seen: number[] = [];
    await runWithRetry(
      async (attempt) => {
        seen.push(attempt);
        if (attempt < 2) throw new Error("blip");
        return null;
      },
      { baseDelayMs: 1, shouldRetry: () => true, maxAttempts: 2 },
    );
    expect(seen).toEqual([1, 2]);
  });

  test("default shouldRetry never retries", async () => {
    let calls = 0;
    await expect(
      runWithRetry(async () => {
        calls++;
        throw new Error("nope");
      }),
    ).rejects.toThrow("nope");
    expect(calls).toBe(1);
  });
});
