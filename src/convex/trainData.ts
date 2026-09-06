"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const RAPIDAPI_HOST = "irctc1.p.rapidapi.com";

async function fetchApi(path: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.INDIAN_RAIL_API_KEY;
  if (!apiKey) {
    throw new Error("INDIAN_RAIL_API_KEY not configured.");
  }
  const url = `https://${RAPIDAPI_HOST}${path}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": apiKey,
    },
  });
  if (!res.ok) throw new Error(`IRCTC API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

function todayFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayYyyymmdd(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** Get live running status of a train */
export const getLiveTrain = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      `/api/v3/train/live-status?trainNo=${args.trainNumber}&date=${todayYyyymmdd()}`
    );

    if (data.ResponseCode !== "200" && data.status !== true && !data.data) {
      // Try alternate endpoint format
      const data2 = await fetchApi(
        `/api/trains?trainNo=${args.trainNumber}&date=${todayFormatted()}`
      );
      if (!data2.data && !data2.TrainNumber) {
        throw new Error((data.Message as string) || "Failed to fetch train status");
      }
      return parseTrainData(data2);
    }

    return parseTrainData(data);
  },
});

function parseTrainData(data: Record<string, unknown>): Record<string, unknown> {
  // Handle multiple API response formats
  const trainData = data.data as Record<string, unknown> | undefined;
  const trainNumber = (data.TrainNumber || trainData?.trainNumber || trainData?.train_no) as string;
  const route = (data.TrainRoute || trainData?.route || trainData?.stations || []) as Record<string, string>[];
  const currentStation = data.CurrentStation || trainData?.currentStation || null;

  return {
    trainNumber: String(trainNumber || "unknown"),
    startDate: (data.StartDate || trainData?.startDate) as string,
    currentStation: currentStation
      ? {
          name: (currentStation as Record<string, string>).StationName || (currentStation as Record<string, string>).stationName || "",
          code: (currentStation as Record<string, string>).StationCode || (currentStation as Record<string, string>).stationCode || "",
          scheduledArrival: (currentStation as Record<string, string>).ScheduleArrival || "",
          actualArrival: (currentStation as Record<string, string>).ActualArrival || "",
          delay: (currentStation as Record<string, string>).DelayInArrival || "",
        }
      : null,
    route: route.map((s: Record<string, string>) => ({
      station: s.StationName || s.stationName || s.station_name || "",
      code: s.StationCode || s.stationCode || s.station_code || "",
      scheduledArrival: s.ScheduleArrival || s.scheduled_arrival || "",
      actualArrival: s.ActualArrival || s.actual_arrival || "",
      delay: s.DelayInArrival || s.delay || "",
      scheduledDeparture: s.ScheduleDeparture || s.scheduled_departure || "",
      actualDeparture: s.ActualDeparture || s.actual_departure || "",
      delayDeparture: s.DelayInDeparture || "",
      isDeparted: s.IsDeparted || "",
    })),
  };
}

/** Get all trains at a station */
export const getLiveStation = action({
  args: { stationCode: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      `/api/v3/train/live-station?stationCode=${args.stationCode}&hours=2`
    );

    if (data.ResponseCode !== "200" && !data.data) {
      throw new Error((data.Message as string) || "Failed to fetch station data");
    }

    const trains = (data.Trains || data.data || []) as Record<string, string>[];
    return trains.map((t) => ({
      name: t.Name || t.name || t.train_name || "",
      number: t.Number || t.number || t.train_no || "",
      source: t.Source || t.source || "",
      destination: t.Destination || t.destination || "",
      scheduledArrival: t.ScheduleArrival || t.scheduled_arrival || "",
      expectedArrival: t.ExpectedArrival || t.expected_arrival || "",
      delay: t.DelayInArrival || t.delay || "",
      scheduledDeparture: t.ScheduleDeparture || t.scheduled_departure || "",
      expectedDeparture: t.ExpectedDeparture || t.expected_departure || "",
      delayDeparture: t.DelayInDeparture || "",
    }));
  },
});

/** Get PNR status */
export const getPnrStatus = action({
  args: { pnrNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(`/api/v1/pnr-check?pnrNumber=${args.pnrNumber}`);
    return data;
  },
});

/** Get trains between two stations */
export const getTrainsBetween = action({
  args: { from: v.string(), to: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(
      `/api/v3/train/between-stations?from=${args.from}&to=${args.to}&date=${todayFormatted()}`
    );
    return data.Trains || data.data || [];
  },
});

/** Get train schedule */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const data = await fetchApi(`/api/v3/train/schedule?trainNo=${args.trainNumber}`);
    return data.Route || data.data || data.schedule || [];
  },
});

/** Get cancelled trains today */
export const getCancelledTrains = action({
  args: {},
  handler: async () => {
    const data = await fetchApi(`/api/v3/train/cancelled?date=${todayFormatted()}`);
    return data.Trains || data.data || [];
  },
});
