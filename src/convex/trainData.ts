"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const RAPIDAPI_HOST = "irctc1.p.rapidapi.com";
const API_KEY_ENV = "INDIAN_RAIL_API_KEY";

// Simple in-memory cache (resets on cold start, but helps within a session)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAYS = [2000, 5000, 10000]; // retries for 429

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchApi(
  path: string,
  retries = 3,
): Promise<Record<string, unknown>> {
  const apiKey = process.env[API_KEY_ENV];
  if (!apiKey) {
    throw new Error(
      "No API key. Add INDIAN_RAIL_API_KEY in Convex Settings → Environment Variables.",
    );
  }

  const cacheKey = path;
  const cached = getCached(cacheKey);
  if (cached) return cached as Record<string, unknown>;

  const url = `https://${RAPIDAPI_HOST}${path}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    const bodyText = await res.text().catch(() => "");

    if (res.status === 429) {
      // Rate limited — wait and retry
      const delay = RETRY_DELAYS[attempt] || 10000;
      console.log(
        `[trainData] 429 rate limited on attempt ${attempt + 1}, waiting ${delay}ms`,
      );
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw new Error(
        `Rate limited by Indian Railways API (429). The free tier allows limited requests. Try again in a few minutes, or the app will use cached/demo data.`,
      );
    }

    if (!res.ok) {
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw new Error(
        `API returned ${res.status}: ${bodyText.slice(0, 200) || res.statusText}`,
      );
    }

    try {
      const parsed = JSON.parse(bodyText) as Record<string, unknown>;
      setCache(cacheKey, parsed);
      return parsed;
    } catch {
      throw new Error(
        `Invalid JSON from API: ${bodyText.slice(0, 200)}`,
      );
    }
  }

  throw new Error("Exhausted retries");
}

function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function parseTrainData(data: Record<string, unknown>): Record<string, unknown> {
  const trainNumber = String(
    data.TrainNumber || data.trainNumber || data.train_no || "unknown",
  );

  const route = (data.TrainRoute || data.route || data.stations || []) as Record<
    string,
    string
  >[];

  const currentStation = data.CurrentStation || data.currentStation || null;
  const curStation = currentStation as Record<string, string> | null;

  return {
    trainNumber,
    startDate: (data.StartDate || data.startDate) as string,
    currentStation: curStation
      ? {
          name: String(
            curStation.StationName || curStation.stationName || "",
          ),
          code: String(
            curStation.StationCode || curStation.stationCode || "",
          ),
          scheduledArrival: String(curStation.ScheduleArrival || ""),
          actualArrival: String(curStation.ActualArrival || ""),
          delay: String(curStation.DelayInArrival || ""),
        }
      : null,
    route: (Array.isArray(route) ? route : []).map(
      (s: Record<string, string>) => ({
        station: String(
          s.StationName || s.stationName || s.station_name || "",
        ),
        code: String(
          s.StationCode || s.stationCode || s.station_code || "",
        ),
        scheduledArrival: String(s.ScheduleArrival || s.scheduled_arrival || ""),
        actualArrival: String(s.ActualArrival || s.actual_arrival || ""),
        delay: String(s.DelayInArrival || s.delay || "-"),
        scheduledDeparture: String(
          s.ScheduleDeparture || s.scheduled_departure || "",
        ),
        actualDeparture: String(s.ActualDeparture || s.actual_departure || ""),
        delayDeparture: String(s.DelayInDeparture || ""),
        isDeparted: String(s.IsDeparted || ""),
      }),
    ),
  };
}

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const dateFormatted = todayFormatted();
    const trainNo = args.trainNumber.trim();

    const endpoints = [
      `/api/v1/liveTrainStatus?trainNo=${trainNo}&date=${dateFormatted}`,
      `/api/v1/liveTrainStatus?train_number=${trainNo}&date=${dateFormatted}`,
    ];

    let lastError = "";
    for (const endpoint of endpoints) {
      try {
        const data = await fetchApi(endpoint);

        if (
          data.ResponseCode === "200" ||
          data.status === true ||
          data.TrainNumber ||
          data.trainNumber ||
          data.data
        ) {
          return parseTrainData(data);
        }
        lastError = `Unexpected response: ${JSON.stringify(data).slice(0, 150)}`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }
    throw new Error(
      `Could not fetch train ${trainNo}. Last error: ${lastError}`,
    );
  },
});

/** Get all trains at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const code = args.stationCode.trim().toUpperCase();

    const endpoints = [
      `/api/v1/getLiveStation?stationCode=${code}&hours=2`,
      `/api/v1/getLiveStation?station=${code}&hours=2`,
    ];

    let lastError = "";
    for (const endpoint of endpoints) {
      try {
        const data = await fetchApi(endpoint);

        const trains =
          (data.Trains as Record<string, string>[]) ||
          (data.data as Record<string, string>[]) ||
          (data.trains as Record<string, string>[]) ||
          [];

        if (Array.isArray(trains) && trains.length > 0) {
          return trains.map((t) => ({
            name: String(t.Name || t.name || t.train_name || ""),
            number: String(t.Number || t.number || t.train_no || ""),
            source: String(t.Source || t.source || ""),
            destination: String(t.Destination || t.destination || ""),
            scheduledArrival: String(t.ScheduleArrival || ""),
            expectedArrival: String(t.ExpectedArrival || ""),
            delay: String(t.DelayInArrival || t.delay || "-"),
            scheduledDeparture: String(t.ScheduleDeparture || ""),
            expectedDeparture: String(t.ExpectedDeparture || ""),
            delayDeparture: String(t.DelayInDeparture || ""),
          }));
        }
        lastError = `Empty train list from ${endpoint}`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }
    throw new Error(`No trains found at ${code}. ${lastError}`);
  },
});

/** Get trains between two stations */
export const getTrainsBetween = action({
  args: { from: v.string(), to: v.string() },
  handler: async (_ctx, args) => {
    const from = args.from.toUpperCase();
    const to = args.to.toUpperCase();

    const data = await fetchApi(
      `/api/v3/trainBetweenStations?from=${from}&to=${to}&date=${todayFormatted()}`,
    );
    return (data.Trains || data.data || data.trains || []) as Record<
      string,
      string
    >[];
  },
});

/** Get train schedule */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      `/api/v1/getTrainSchedule?trainNo=${args.trainNumber.trim()}`,
    );
    return (data.Route || data.data || data.schedule || []) as Record<
      string,
      string
    >[];
  },
});
