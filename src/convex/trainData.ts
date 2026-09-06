"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/* Indian Rail API — RapidAPI hosted */
const RAPID_API_HOST = "indian-railway-irctc.p.rapidapi.com";

async function fetchApi(endpoint: string, queryParams: Record<string, string>): Promise<Record<string, unknown>> {
  const apiKey = process.env.INDIAN_RAIL_API_KEY;
  if (!apiKey) {
    throw new Error("INDIAN_RAIL_API_KEY not configured.");
  }

  const url = new URL(`https://${RAPID_API_HOST}/${endpoint}`);
  for (const [k, val] of Object.entries(queryParams)) {
    url.searchParams.set(k, val);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": RAPID_API_HOST,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

function todayFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function str(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : fallback;
}

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi("api/v1/live", {
      trainNo: args.trainNumber,
      date: todayFormatted(),
    });

    const currentStation = data.CurrentStation || data.current_station;
    const trainRoute = (data.TrainRoute || data.route || []) as Record<string, unknown>[];

    const cs = currentStation as Record<string, unknown> | null | undefined;

    return {
      trainNumber: str(data.TrainNumber || data.train_number, args.trainNumber),
      startDate: str(data.StartDate || data.start_date),
      currentStation: cs
        ? {
            name: str(cs.StationName || cs.station_name),
            code: str(cs.StationCode || cs.station_code),
            scheduledArrival: str(cs.ScheduleArrival || cs.scheduled_arrival),
            actualArrival: str(cs.ActualArrival || cs.actual_arrival),
            delay: str(cs.DelayInArrival || cs.delay, "0"),
          }
        : null,
      route: trainRoute.map((s) => ({
        station: str(s.StationName || s.station_name),
        code: str(s.StationCode || s.station_code),
        scheduledArrival: str(s.ScheduleArrival || s.scheduled_arrival),
        actualArrival: str(s.ActualArrival || s.actual_arrival),
        delay: str(s.DelayInArrival || s.delay, "0"),
        scheduledDeparture: str(s.ScheduleDeparture || s.scheduled_departure),
        actualDeparture: str(s.ActualDeparture || s.actual_departure),
        delayDeparture: str(s.DelayInDeparture || s.delay_departure, "0"),
        isDeparted: str(s.IsDeparted),
      })),
    };
  },
});

/** Get all trains at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi("api/v1/liveStation", {
      station: args.stationCode,
      hours: "2",
    });

    const trains = (data.Trains || data.trains || []) as Record<string, unknown>[];

    return trains.map((t) => ({
      name: str(t.Name || t.name),
      number: str(t.Number || t.number),
      source: str(t.Source || t.source),
      destination: str(t.Destination || t.destination),
      scheduledArrival: str(t.ScheduleArrival || t.schedule_arrival),
      expectedArrival: str(t.ExpectedArrival || t.expected_arrival),
      delay: str(t.DelayInArrival || t.delay, "0"),
      scheduledDeparture: str(t.ScheduleDeparture || t.schedule_departure),
      expectedDeparture: str(t.ExpectedDeparture || t.expected_departure),
      delayDeparture: str(t.DelayInDeparture || t.delay_departure, "0"),
    }));
  },
});

/** Get trains between two stations */
export const getTrainsBetween = action({
  args: { from: v.string(), to: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi("api/v1/betweenStations", {
      from: args.from,
      to: args.to,
      date: todayFormatted(),
    });

    return data.Trains || data.trains || [];
  },
});

/** Get train schedule/route */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi("api/v1/trainSchedule", {
      trainNo: args.trainNumber,
    });

    return data.Route || data.route || [];
  },
});
