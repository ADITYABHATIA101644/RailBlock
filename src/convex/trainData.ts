"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const BASE_URL = "http://indianrailapi.com/api/v2";

async function fetchApi(endpoint: string, pathParams: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.INDIAN_RAIL_API_KEY;
  if (!apiKey) {
    throw new Error("INDIAN_RAIL_API_KEY not configured. Add it in Convex dashboard → Settings → Environment Variables.");
  }
  const url = `${BASE_URL}/${endpoint}/apikey/${apiKey}/${pathParams}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Indian Rail API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

function todayFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      "LiveTrainStatus",
      `trainnumber/${args.trainNumber}/date/${todayFormatted()}/`
    );

    if (data.ResponseCode !== "200") {
      throw new Error((data.Message as string) || "Failed to fetch train status");
    }

    return {
      trainNumber: data.TrainNumber,
      startDate: data.StartDate,
      currentStation: data.CurrentStation
        ? {
            name: (data.CurrentStation as Record<string, string>).StationName,
            code: (data.CurrentStation as Record<string, string>).StationCode,
            scheduledArrival: (data.CurrentStation as Record<string, string>).ScheduleArrival,
            actualArrival: (data.CurrentStation as Record<string, string>).ActualArrival,
            delay: (data.CurrentStation as Record<string, string>).DelayInArrival,
          }
        : null,
      route: ((data.TrainRoute as Record<string, string>[]) || []).map((s) => ({
        station: s.StationName,
        code: s.StationCode,
        scheduledArrival: s.ScheduleArrival,
        actualArrival: s.ActualArrival,
        delay: s.DelayInArrival,
        scheduledDeparture: s.ScheduleDeparture,
        actualDeparture: s.ActualDeparture,
        delayDeparture: s.DelayInDeparture,
        isDeparted: s.IsDeparted,
      })),
    };
  },
});

/** Get all trains at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      "LiveStation",
      `Station/${args.stationCode}/hours/2/`
    );

    if (data.ResponseCode !== "200") {
      throw new Error((data.Message as string) || "Failed to fetch station data");
    }

    return ((data.Trains as Record<string, string>[]) || []).map((t) => ({
      name: t.Name,
      number: t.Number,
      source: t.Source,
      destination: t.Destination,
      scheduledArrival: t.ScheduleArrival,
      expectedArrival: t.ExpectedArrival,
      delay: t.DelayInArrival,
      scheduledDeparture: t.ScheduleDeparture,
      expectedDeparture: t.ExpectedDeparture,
      delayDeparture: t.DelayInDeparture,
    }));
  },
});

/** Get trains between two stations */
export const getTrainsBetween = action({
  args: { from: v.string(), to: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      "TrainBetweenStations",
      `From/${args.from}/To/${args.to}/Date/${todayFormatted()}/`
    );

    if (data.ResponseCode !== "200") {
      throw new Error((data.Message as string) || "Failed to fetch trains");
    }

    return data.Trains || [];
  },
});

/** Get train schedule/route */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      "TrainSchedule",
      `TrainNumber/${args.trainNumber}/`
    );

    if (data.ResponseCode !== "200") {
      throw new Error((data.Message as string) || "Failed to fetch schedule");
    }

    return data.Route || [];
  },
});
