"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Seeder action (Node runtime) for the all-India train database.
 *
 * Pulls EVERY train (~8,000) from the open datameet/railways dataset (CC0)
 * and inserts it into the `trains` table via internal mutations in allTrains.ts.
 *
 * Usage: call `api.trainSeeder.seedStep` repeatedly until `done` is true.
 * The cursor lives in appMeta, so seeding is resumable and re-runs are
 * idempotent (existing train numbers are skipped).
 */

const TRAINS_URL =
  "https://raw.githubusercontent.com/datameet/railways/master/trains.json";

interface TrainFeature {
  geometry?: { coordinates?: number[][] };
  properties: Record<string, unknown>;
}

export interface TrainRecord {
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
  coords?: [number, number][];
}

let trainsCache: TrainFeature[] | null = null;

async function fetchTrainsJson(): Promise<TrainFeature[]> {
  if (trainsCache) return trainsCache;
  const res = await fetch(TRAINS_URL, {
    headers: { "User-Agent": "RailBlock-AI/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch trains dataset: ${res.status}`);
  const json = (await res.json()) as { features?: TrainFeature[] };
  trainsCache = json.features ?? [];
  return trainsCache;
}

const ZONE_NAME_MAP: Record<string, string> = {
  northern: "NR",
  "north central": "NCR",
  "north central railway": "NCR",
  "north eastern": "NER",
  "northeast frontier": "NFR",
  eastern: "ER",
  "east central": "ECR",
  "east coast": "ECOR",
  "south eastern": "SER",
  "south east central": "SECR",
  "south central": "SCR",
  southern: "SR",
  "south western": "SWR",
  "west central": "WCR",
  western: "WR",
  central: "CR",
  "north western": "NWR",
  metro: "MR",
  "metro railway": "MR",
  "metro railway kolkata": "MR",
};

const KNOWN_ZONES = new Set([
  "NR", "NCR", "NER", "NFR", "ER", "ECR", "ECOR", "SECR", "SCR", "SR",
  "SWR", "WCR", "WR", "CR", "NWR", "SER", "MR",
]);

function normalizeZone(raw: string): string {
  const s = raw.trim();
  if (!s) return "UNKNOWN";
  const upper = s.toUpperCase().replace(/[^A-Z]/g, "");
  if (KNOWN_ZONES.has(upper)) return upper;
  const mapped = ZONE_NAME_MAP[s.toLowerCase()];
  if (mapped) return mapped;
  return upper.slice(0, 5) || "UNKNOWN";
}

function classify(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("vande bharat")) return "Vande Bharat";
  if (n.includes("gatimaan")) return "Gatimaan";
  if (n.includes("jan shatabdi")) return "Jan Shatabdi";
  if (n.includes("shatabdi")) return "Shatabdi";
  if (n.includes("rajdhani")) return "Rajdhani";
  if (n.includes("duronto")) return "Duronto";
  if (n.includes("garib rath")) return "Garib Rath";
  if (n.includes("humsafar")) return "Humsafar";
  if (n.includes("tejas")) return "Tejas";
  if (n.includes("sampark kranti")) return "Sampark Kranti";
  if (n.includes("antyodaya")) return "Antyodaya";
  if (n.includes("double decker")) return "Double Decker";
  if (n.includes("intercity")) return "Intercity";
  if (n.includes("superfast")) return "Superfast";
  if (n.includes("special")) return "Special";
  if (n.includes("memu") || n.includes("demu")) return "MEMU/DEMU";
  if (n.includes("passenger")) return "Passenger";
  return "Mail/Express";
}

function downsample(coords: number[][] | undefined): [number, number][] {
  const clean = (coords ?? []).filter(
    (c) => Array.isArray(c) && c.length >= 2 && isFinite(c[0]) && isFinite(c[1]),
  );
  if (clean.length === 0) return [];
  const step = Math.max(1, Math.ceil(clean.length / 40));
  const out: [number, number][] = [];
  for (let i = 0; i < clean.length; i += step) {
    out.push([clean[i][1], clean[i][0]]); // store [lat, lng]
  }
  return out;
}

function mapFeature(f: TrainFeature): TrainRecord | null {
  try {
    const p = f.properties ?? {};
    const number = String(p.number ?? p.train_no ?? "").trim();
    const name = String(p.name ?? p.train_name ?? "").trim();
    if (!number || !name) return null;
    const durationH = Number(p.duration_h ?? 0) || 0;
    const durationM = Number(p.duration_m ?? 0) || 0;
    const coords = downsample(f.geometry?.coordinates);
    return {
      number,
      name,
      fromCode: String(p.from_station_code ?? "").trim().toUpperCase(),
      fromName: String(p.from_station_name ?? "").trim(),
      toCode: String(p.to_station_code ?? "").trim().toUpperCase(),
      toName: String(p.to_station_name ?? "").trim(),
      zone: normalizeZone(String(p.zone ?? "")),
      type: classify(name),
      distance: Number(p.distance ?? 0) || 0,
      departure: String(p.departure ?? "").trim() || "--",
      arrival: String(p.arrival ?? "").trim() || "--",
      durationMin: durationH * 60 + durationM,
      classes: String(p.classes ?? "").trim() || undefined,
      coords: coords.length ? coords : undefined,
    };
  } catch {
    return null;
  }
}

/** One seeding step: fetch dataset (cached) + insert one batch. Call in a loop until done. */
export const seedStep = action({
  args: { batch: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const features = await fetchTrainsJson();
    const batch = args.batch ?? 150;
    const offset = await ctx.runQuery(internal.allTrains.getSeedCursor, {});
    const slice = features.slice(offset, offset + batch);
    let inserted = 0;
    if (slice.length > 0) {
      const mapped = slice
        .map(mapFeature)
        .filter((t): t is TrainRecord => t !== null);
      inserted = await ctx.runMutation(internal.allTrains.seedBatch, {
        trains: mapped,
      });
    }
    const cursor = Math.min(offset + batch, features.length);
    const done = cursor >= features.length;
    await ctx.runMutation(internal.allTrains.setSeedCursor, {
      cursor,
      total: features.length,
      done,
    });
    return { inserted, cursor, done, total: features.length };
  },
});
