"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const RAPIDAPI_HOST = "irctc1.p.rapidapi.com";

async function fetchApi(path: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.INDIAN_RAIL_API_KEY;
  if (!apiKey) {
    throw new Error("No API key. Add INDIAN_RAIL_API_KEY in Convex → Settings → Environment Variables.");
  }
  const url = `https://${RAPIDAPI_HOST}${path}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": apiKey,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API returned ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

function todayYyyymmdd(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function todayFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const date = todayYyyymmdd();
    const dateFormatted = todayFormatted();
    const trainNo = args.trainNumber.trim();

    // Try multiple endpoint formats
    const endpoints = [
      `/api/v3/train/live-status?trainNo=${trainNo}&date=${date}`,
      `/api/v3/train/live-status?train_number=${trainNo}&date=${dateFormatted}`,
      `/api/v2/livetrainstatus/trainnumber/${trainNo}/date/${date}/`,
    ];

    let lastError = "";
    for (const endpoint of endpoints) {
      try {
        const data = await fetchApi(endpoint);
        if (data.ResponseCode === "200" || data.status === true || data.TrainNumber || data.data) {
          return parseTrainData(data);
        }
        lastError = `No data in response: ${JSON.stringify(data).slice(0, 100)}`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }
    throw new Error(`Could not fetch train ${trainNo}. ${lastError}`);
  },
});

function parseTrainData(data: Record<string, unknown>): Record<string, unknown> {
  const trainData = (data.data || data) as Record<string, unknown>;
  const trainNumber = String(data.TrainNumber || trainData?.trainNumber || trainData?.train_no || "unknown");
  const route = (data.TrainRoute || trainData?.route || trainData?.stations || []) as Record<string, string>[];
  const currentStation = data.CurrentStation || trainData?.currentStation || null;

  return {
    trainNumber,
    startDate: (data.StartDate || trainData?.startDate) as string,
    currentStation: currentStation
      ? {
          name: String((currentStation as Record<string, string>).StationName || (currentStation as Record<string, string>).stationName || ""),
          code: String((currentStation as Record<string, string>).StationCode || (currentStation as Record<string, string>).stationCode || ""),
          scheduledArrival: String((currentStation as Record<string, string>).ScheduleArrival || ""),
          actualArrival: String((currentStation as Record<string, string>).ActualArrival || ""),
          delay: String((currentStation as Record<string, string>).DelayInArrival || ""),
        }
      : null,
    route: (Array.isArray(route) ? route : []).map((s: Record<string, string>) => ({
      station: String(s.StationName || s.stationName || s.station_name || ""),
      code: String(s.StationCode || s.stationCode || s.station_code || ""),
      scheduledArrival: String(s.ScheduleArrival || s.scheduled_arrival || ""),
      actualArrival: String(s.ActualArrival || s.actual_arrival || ""),
      delay: String(s.DelayInArrival || s.delay || "-"),
      scheduledDeparture: String(s.ScheduleDeparture || s.scheduled_departure || ""),
      actualDeparture: String(s.ActualDeparture || s.actual_departure || ""),
      delayDeparture: String(s.DelayInDeparture || ""),
      isDeparted: String(s.IsDeparted || ""),
    })),
  };
}

/** Get all trains at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const code = args.stationCode.trim().toUpperCase();
    const endpoints = [
      `/api/v3/train/live-station?stationCode=${code}&hours=2`,
      `/api/v3/train/live-station?station=${code}&hours=2`,
      `/api/v2/livestation/Station/${code}/hours/2/`,
    ];

    let lastError = "";
    for (const endpoint of endpoints) {
      try {
        const data = await fetchApi(endpoint);
        const trains = (data.Trains || data.data || data.trains || []) as Record<string, string>[];
        if (Array.isArray(trains) && trains.length > 0) {
          return trains.map((t) => ({
            name: String(t.Name || t.name || t.train_name || ""),
            number: String(t.Number || t.number || t.train_no || ""),
            source: String(t.Source || t.source || ""),
            destination: String(t.Destination || t.destination || ""),
            scheduledArrival: String(t.ScheduleArrival || t.scheduled_arrival || ""),
            expectedArrival: String(t.ExpectedArrival || t.expected_arrival || ""),
            delay: String(t.DelayInArrival || t.delay || "-"),
            scheduledDeparture: String(t.ScheduleDeparture || t.scheduled_departure || ""),
            expectedDeparture: String(t.ExpectedDeparture || t.expected_departure || ""),
            delayDeparture: String(t.DelayInDeparture || ""),
          }));
        }
        lastError = "Empty train list";
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
    const data = await fetchApi(
      `/api/v3/train/between-stations?from=${args.from.toUpperCase()}&to=${args.to.toUpperCase()}&date=${todayFormatted()}`
    );
    return data.Trains || data.data || [];
  },
});

/** Get train schedule */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(`/api/v3/train/schedule?trainNo=${args.trainNumber.trim()}`);
    return data.Route || data.data || data.schedule || [];
  },
});
