import { query } from "./_generated/server";

// TEMPORARY debug probe (safe: read-only). Lists rate-limit rows so we can
// tell whether login/signup handlers actually executed for user attempts.
export const debugRateLimits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rateLimits").collect();
  },
});
