import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * All-India train database — DB queries (V8).
 *
 * The `trains` table is seeded from the open datameet/railways dataset (CC0,
 * ~8,000 real Indian Railways trains) by the seeder action in trainSeeder.ts.
 * Everything here serves fast DB-backed search, map sampling, zone/type stats
 * and station traffic to every dashboard tab.
 */

const SEED_KEY = "trains_seed";

export const getSeedCursor = internalQuery({
  args: {},
  handler: async (ctx) => {
    const meta = await ctx.db
      .query("appMeta")
      .withIndex("by_key", (q) => q.eq("key", SEED_KEY))
      .first();
    const value = meta?.value as { cursor?: number } | undefined;
    return value?.cursor ?? 0;
  },
});

export const seedBatch = internalMutation({
  args: {
    trains: v.array(
      v.object({
        number: v.string(),
        name: v.string(),
        fromCode: v.string(),
        fromName: v.string(),
        toCode: v.string(),
        toName: v.string(),
        zone: v.string(),
        type: v.string(),
        distance: v.number(),
        departure: v.string(),
        arrival: v.string(),
        durationMin: v.number(),
        classes: v.optional(v.string()),
        coords: v.optional(v.array(v.array(v.number()))),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    for (const t of args.trains) {
      if (!t.number || !t.name) continue;
      const existing = await ctx.db
        .query("trains")
        .withIndex("by_number", (q) => q.eq("number", t.number))
        .first();
      if (existing) continue;
      await ctx.db.insert("trains", {
        number: t.number,
        name: t.name,
        fromCode: t.fromCode,
        fromName: t.fromName,
        toCode: t.toCode,
        toName: t.toName,
        zone: t.zone,
        type: t.type,
        distance: t.distance,
        departure: t.departure,
        arrival: t.arrival,
        durationMin: t.durationMin,
        classes: t.classes,
        coords: t.coords,
        search:
          `${t.number} ${t.name} ${t.fromName} ${t.toName} ${t.fromCode} ${t.toCode} ${t.zone} ${t.type}`.toLowerCase(),
        tokens: buildTokens(t),
      });
      inserted++;
    }
    return inserted;
  },
});

function buildTokens(t: {
  number: string;
  name: string;
  fromName: string;
  toName: string;
}): string[] {
  const blob = `${t.number} ${t.name} ${t.fromName} ${t.toName}`.toLowerCase();
  const words = blob
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3)
    .slice(0, 24);
  return Array.from(new Set(words));
}

export const setSeedCursor = internalMutation({
  args: { cursor: v.number(), total: v.number(), done: v.boolean() },
  handler: async (ctx, args) => {
    const meta = await ctx.db
      .query("appMeta")
      .withIndex("by_key", (q) => q.eq("key", SEED_KEY))
      .first();
    if (meta) {
      await ctx.db.patch(meta._id, { value: args });
    } else {
      await ctx.db.insert("appMeta", { key: SEED_KEY, value: args });
    }
  },
});

// ─── Public queries ───

/** Seed progress for UI banners. */
export const getSeedStatus = query({
  args: {},
  handler: async (ctx) => {
    const meta = await ctx.db
      .query("appMeta")
      .withIndex("by_key", (q) => q.eq("key", SEED_KEY))
      .first();
    const value = meta?.value as
      | { cursor?: number; total?: number; done?: boolean }
      | undefined;
    return {
      cursor: value?.cursor ?? 0,
      total: value?.total ?? 0,
      done: value?.done ?? false,
    };
  },
});

/** Total trains indexed + zone/type facets. */
export const getZoneStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("trains").collect();
    const byZone = new Map<string, number>();
    const byType = new Map<string, number>();
    for (const r of rows) {
      byZone.set(r.zone, (byZone.get(r.zone) ?? 0) + 1);
      byType.set(r.type, (byType.get(r.type) ?? 0) + 1);
    }
    return {
      total: rows.length,
      zones: Array.from(byZone.entries())
        .map(([zone, count]) => ({ zone, count }))
        .sort((a, b) => b.count - a.count),
      types: Array.from(byType.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
});

/** Full-DB train search. Empty query returns newest trains. */
export const searchTrains = query({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    zone: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const q = (args.query ?? "").trim().toLowerCase();
    let rows: Array<{
      _id: string;
      number: string;
      name: string;
      fromCode: string;
      fromName: string;
      toCode: string;
      toName: string;
      zone: string;
      type: string;
      distance: number;
      departure: string;
      arrival: string;
      durationMin: number;
      classes?: string;
      coords?: number[][];
    }>;

    if (q === "") {
      rows = await ctx.db.query("trains").order("desc").take(limit);
    } else if (/^\d{2,5}$/.test(q)) {
      // Train-number-ish: numeric prefix match via the search index
      rows = await ctx.db
        .query("trains")
        .withIndex("by_search", (t) =>
          t.gte("search", q).lt("search", `${q}\uffff`),
        )
        .take(limit);
      if (rows.length === 0) {
        const all = await ctx.db.query("trains").order("desc").take(2000);
        rows = all.filter((t) => t.number.includes(q));
      }
    } else {
      // Prefix match on the search blob
      rows = await ctx.db
        .query("trains")
        .withIndex("by_search", (t) =>
          t.gte("search", q).lt("search", `${q}\uffff`),
        )
        .take(limit);
      if (rows.length < limit) {
        // Substring fallback for non-prefix matches ("mumbai raj" etc.) —
        // bounded scan; the table is ~8k small rows so this stays well within
        // query read limits and returns only `limit` docs to the client.
        const all = await ctx.db.query("trains").collect();
        const seen = new Set(rows.map((r) => r._id));
        for (const r of all) {
          if (rows.length >= limit) break;
          if (seen.has(r._id)) continue;
          if (r.search.includes(q)) {
            rows.push(r);
            seen.add(r._id);
          }
        }
      }
    }

    if (args.zone) rows = rows.filter((r) => r.zone === args.zone);
    if (args.type) rows = rows.filter((r) => r.type === args.type);

    return rows.slice(0, limit).map((r) => ({
      number: r.number,
      name: r.name,
      fromCode: r.fromCode,
      fromName: r.fromName,
      toCode: r.toCode,
      toName: r.toName,
      zone: r.zone,
      type: r.type,
      distance: r.distance,
      departure: r.departure,
      arrival: r.arrival,
      durationMin: r.durationMin,
      classes: r.classes,
      hasRoute: (r.coords?.length ?? 0) > 0,
    }));
  },
});

/** Small sample of real trains (spread across zones) for the live map. */
export const getMapTrains = query({
  args: { perZone: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const k = args.perZone ?? 2;
    const zones = [
      "NR", "NCR", "NER", "NFR", "ER", "ECR", "ECOR", "SECR", "SCR", "SR",
      "SWR", "WCR", "WR", "CR", "NWR", "SER", "MR",
    ];
    const out: Array<{
      number: string;
      name: string;
      fromCode: string;
      fromName: string;
      toCode: string;
      toName: string;
      zone: string;
      type: string;
      distance: number;
      departure: string;
      arrival: string;
      durationMin: number;
      classes?: string;
      coords: number[][];
    }> = [];
    const seen = new Set<string>();

    for (const z of zones) {
      const rowset = await ctx.db
        .query("trains")
        .withIndex("by_zone", (q) => q.eq("zone", z))
        .take(k);
      for (const r of rowset) {
        if (seen.has(r.number)) continue;
        seen.add(r.number);
        out.push({
          number: r.number,
          name: r.name,
          fromCode: r.fromCode,
          fromName: r.fromName,
          toCode: r.toCode,
          toName: r.toName,
          zone: r.zone,
          type: r.type,
          distance: r.distance,
          departure: r.departure,
          arrival: r.arrival,
          durationMin: r.durationMin,
          classes: r.classes,
          coords: r.coords ?? [],
        });
      }
    }
    if (out.length < 12) {
      const extra = await ctx.db.query("trains").order("desc").take(24);
      for (const r of extra) {
        if (out.length >= 20) break;
        if (seen.has(r.number)) continue;
        seen.add(r.number);
        out.push({
          number: r.number,
          name: r.name,
          fromCode: r.fromCode,
          fromName: r.fromName,
          toCode: r.toCode,
          toName: r.toName,
          zone: r.zone,
          type: r.type,
          distance: r.distance,
          departure: r.departure,
          arrival: r.arrival,
          durationMin: r.durationMin,
          classes: r.classes,
          coords: r.coords ?? [],
        });
      }
    }
    return out;
  },
});

/** Traffic through a station: departures, arrivals, hourly histogram, top trains. */
export const getStationTraffic = query({
  args: { stationCode: v.string() },
  handler: async (ctx, args) => {
    const code = args.stationCode.trim().toUpperCase();
    if (!code) {
      return {
        stationCode: code,
        totalDepartures: 0,
        totalArrivals: 0,
        total: 0,
        histogram: [] as { hour: string; count: number }[],
        top: [] as {
          number: string;
          name: string;
          type: string;
          zone: string;
          direction: "dep" | "arr";
          otherEnd: string;
          time: string;
        }[],
      };
    }
    const departing = await ctx.db
      .query("trains")
      .withIndex("by_from", (q) => q.eq("fromCode", code))
      .collect();
    const arriving = await ctx.db
      .query("trains")
      .withIndex("by_to", (q) => q.eq("toCode", code))
      .collect();

    const hourly = new Array(24).fill(0) as number[];
    const bump = (hhmm: string) => {
      const m = /^(\d{1,2}):/.exec(hhmm.trim());
      if (m) {
        const h = parseInt(m[1]);
        if (h >= 0 && h < 24) hourly[h]++;
      }
    };
    for (const t of departing) bump(t.departure);
    for (const t of arriving) bump(t.arrival);

    const histogram = hourly.map((count, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      count,
    }));

    const seen = new Set<string>();
    const top = [...departing, ...arriving]
      .filter((t) => {
        if (seen.has(t.number)) return false;
        seen.add(t.number);
        return true;
      })
      .sort((a, b) => a.departure.localeCompare(b.departure))
      .slice(0, 30)
      .map((t) => ({
        number: t.number,
        name: t.name,
        type: t.type,
        zone: t.zone,
        direction: (t.fromCode === code ? "dep" : "arr") as "dep" | "arr",
        otherEnd: t.fromCode === code ? t.toCode : t.fromCode,
        time: t.fromCode === code ? t.departure : t.arrival,
      }));

    return {
      stationCode: code,
      totalDepartures: departing.length,
      totalArrivals: arriving.length,
      total: departing.length + arriving.length,
      histogram,
      top,
    };
  },
});
