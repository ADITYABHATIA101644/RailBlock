"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/* ===== Types ===== */
interface TrainRoute {
  SerialNo: string;
  StationName: string;
  StationCode: string;
  Distance: string;
  IsDeparted: string;
  Day: string;
  ScheduleArrival: string;
  ActualArrival: string;
  DelayInArrival: string;
  ScheduleDeparture: string;
  ActualDeparture: string;
  DelayInDeparture: string;
}

interface LiveTrainResponse {
  ResponseCode: string;
  StartDate: string;
  TrainNumber: string;
  CurrentPosition: unknown;
  CurrentStation: TrainRoute;
  TrainRoute: TrainRoute[];
  Message: string;
}

interface StationTrain {
  Name: string;
  Number: string;
  Source: string;
  Destination: string;
  ScheduleArrival: string;
  ScheduleDeparture: string;
  Halt: string;
  ExpectedArrival: string;
  DelayInArrival: string;
  ExpectedDeparture: string;
  DelayInDeparture: string;
}

interface LiveStationResponse {
  ResponseCode: string;
  Status: string;
  Trains: StationTrain[];
  Message: string;
}

/* ===== Helper ===== */
async function fetchIndianRailApi(endpoint: string, params: Record<string, string>): Promise<unknown> {
  const apiKey = process.env.INDIAN_RAIL_API_KEY;
  if (!apiKey) {
    throw new Error("INDIAN_RAIL_API_KEY not configured");
  }
  const url = new URL(`https://indianrailapi.com/api/v2/${endpoint}`);
  url.searchParams.set("apikey", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Indian Rail API error: ${res.status}`);
  return res.json();
}

/* ===== Actions ===== */

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = (await fetchIndianRailApi("LiveTrainStatus", {
      TrainNumber: args.trainNumber,
      Date: new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
    })) as LiveTrainResponse;

    if (data.ResponseCode !== "200") {
      throw new Error(data.Message || "Failed to fetch train status");
    }

    return {
      trainNumber: data.TrainNumber,
      startDate: data.StartDate,
      currentStation: data.CurrentStation
        ? {
            name: data.CurrentStation.StationName,
            code: data.CurrentStation.StationCode,
            scheduledArrival: data.CurrentStation.ScheduleArrival,
            actualArrival: data.CurrentStation.ActualArrival,
            delay: data.CurrentStation.DelayInArrival,
          }
        : null,
      route: data.TrainRoute.map((s) => ({
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

/** Get all trains currently at or arriving at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const data = (await fetchIndianRailApi("LiveStation", {
      Station: args.stationCode,
      Hours: "2",
    })) as LiveStationResponse;

    if (data.ResponseCode !== "200") {
      throw new Error(data.Message || "Failed to fetch station data");
    }

    return data.Trains.map((t) => ({
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
    const data = (await fetchIndianRailApi("TrainBetweenStations", {
      From: args.from,
      To: args.to,
      Date: new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
    })) as { Trains?: unknown[]; ResponseCode: string; Message: string };

    if (data.ResponseCode !== "200") {
      throw new Error(data.Message || "Failed to fetch trains");
    }

    return data.Trains || [];
  },
});

/** Get cancelled trains for today */
export const getCancelledTrains = action({
  args: {},
  handler: async () => {
    const data = (await fetchIndianRailApi("CancelledTrains", {
      Date: new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
    })) as { Trains?: unknown[]; ResponseCode: string; Message: string };

    if (data.ResponseCode !== "200") {
      throw new Error(data.Message || "Failed to fetch cancelled trains");
    }

    return data.Trains || [];
  },
});

/** Get train schedule/route */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = (await fetchIndianRailApi("TrainSchedule", {
      TrainNumber: args.trainNumber,
    })) as { Route?: unknown[]; ResponseCode: string; Message: string };

    if (data.ResponseCode !== "200") {
      throw new Error(data.Message || "Failed to fetch schedule");
    }

    return data.Route || [];
  },
});
