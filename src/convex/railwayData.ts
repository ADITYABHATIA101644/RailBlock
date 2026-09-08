"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Real Indian Railways data from datameet/railways (CC0 License)
// https://github.com/datameet/railways
const STATIONS_URL =
  "https://raw.githubusercontent.com/datameet/railways/master/stations.json";
const TRAINS_URL =
  "https://raw.githubusercontent.com/datameet/railways/master/trains.json";
const SCHEDULES_URL =
  "https://raw.githubusercontent.com/datameet/railways/master/schedules.json";

interface GeoJSONFeature {
  geometry: { type: string; coordinates: number[] };
  properties: Record<string, unknown>;
}

interface StationData {
  code: string;
  name: string;
  state: string;
  zone: string;
  address: string;
  lat: number;
  lng: number;
}

interface TrainData {
  number: string;
  name: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  zone: string;
  type: string;
  classes: string;
  distance: number;
  durationH: number;
  durationM: number;
  departure: string;
  arrival: string;
  sleeper: boolean;
  firstAC: boolean;
  secondAC: boolean;
  thirdAC: boolean;
  chairCar: boolean;
  coords: number[][];
}

interface ScheduleEntry {
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  arrival: string;
  departure: string;
  day: number;
}

// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL)
    return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchJSON(url: string): Promise<unknown> {
  const cached = getCached<unknown>(url);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: { "User-Agent": "RailBlock-AI/1.0 (Hackathon)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  setCache(url, data);
  return data;
}

/** Fetch all Indian railway stations with real GPS coordinates */
export const getStations = action({
  args: {},
  handler: async () => {
    const geojson = (await fetchJSON(STATIONS_URL)) as {
      features: GeoJSONFeature[];
    };

    const stations: StationData[] = geojson.features.map((f) => ({
      code: String(f.properties.code || ""),
      name: String(f.properties.name || ""),
      state: String(f.properties.state || ""),
      zone: String(f.properties.zone || ""),
      address: String(f.properties.address || ""),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));

    return {
      count: stations.length,
      stations: stations.slice(0, 2000), // API limit
    };
  },
});

/** Search stations by code or name */
export const searchStations = action({
  args: { query: v.string() },
  handler: async (_ctx, args) => {
    const geojson = (await fetchJSON(STATIONS_URL)) as {
      features: GeoJSONFeature[];
    };

    const q = args.query.toUpperCase();
    const matches = geojson.features
      .map((f) => ({
        code: String(f.properties.code || ""),
        name: String(f.properties.name || ""),
        state: String(f.properties.state || ""),
        zone: String(f.properties.zone || ""),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }))
      .filter(
        (s) =>
          s.code.toUpperCase().includes(q) ||
          s.name.toUpperCase().includes(q) ||
          s.state.toUpperCase().includes(q),
      )
      .slice(0, 50);

    return matches;
  },
});

/** Get all trains with their routes */
export const getTrains = action({
  args: {},
  handler: async () => {
    const geojson = (await fetchJSON(TRAINS_URL)) as {
      features: GeoJSONFeature[];
    };

    const trains: TrainData[] = geojson.features.map((f) => ({
      number: String(f.properties.number || ""),
      name: String(f.properties.name || ""),
      fromCode: String(f.properties.from_station_code || ""),
      fromName: String(f.properties.from_station_name || ""),
      toCode: String(f.properties.to_station_code || ""),
      toName: String(f.properties.to_station_name || ""),
      zone: String(f.properties.zone || ""),
      type: String(f.properties.type || ""),
      classes: String(f.properties.classes || ""),
      distance: Number(f.properties.distance || 0),
      durationH: Number(f.properties.duration_h || 0),
      durationM: Number(f.properties.duration_m || 0),
      departure: String(f.properties.departure || ""),
      arrival: String(f.properties.arrival || ""),
      sleeper: Boolean(f.properties.sleeper),
      firstAC: Boolean(f.properties.first_ac),
      secondAC: Boolean(f.properties.second_ac),
      thirdAC: Boolean(f.properties.third_ac),
      chairCar: Boolean(f.properties.chair_car),
      coords: (f.geometry?.coordinates || []) as unknown as number[][],
    }));

    return {
      count: trains.length,
      trains: trains.slice(0, 3000),
    };
  },
});

/** Search trains by number, name, or station */
export const searchTrains = action({
  args: { query: v.string() },
  handler: async (_ctx, args) => {
    const geojson = (await fetchJSON(TRAINS_URL)) as {
      features: GeoJSONFeature[];
    };

    const q = args.query.toUpperCase();
    const matches = geojson.features
      .map((f) => ({
        number: String(f.properties.number || ""),
        name: String(f.properties.name || ""),
        fromCode: String(f.properties.from_station_code || ""),
        fromName: String(f.properties.from_station_name || ""),
        toCode: String(f.properties.to_station_code || ""),
        toName: String(f.properties.to_station_name || ""),
        zone: String(f.properties.zone || ""),
        type: String(f.properties.type || ""),
        distance: Number(f.properties.distance || 0),
        durationH: Number(f.properties.duration_h || 0),
        durationM: Number(f.properties.duration_m || 0),
        departure: String(f.properties.departure || ""),
        arrival: String(f.properties.arrival || ""),
        classes: String(f.properties.classes || ""),
      }))
      .filter(
        (t) =>
          t.number.includes(q) ||
          t.name.toUpperCase().includes(q) ||
          t.fromCode.toUpperCase().includes(q) ||
          t.fromName.toUpperCase().includes(q) ||
          t.toCode.toUpperCase().includes(q) ||
          t.toName.toUpperCase().includes(q),
      )
      .slice(0, 50);

    return matches;
  },
});

/** Get schedule for a specific train */
export const getTrainSchedule = action({
  args: { trainNumber: v.string() },
  handler: async (_ctx, args) => {
    const schedules = (await fetchJSON(SCHEDULES_URL)) as Record<
      string,
      unknown
    >[];

    const trainNo = args.trainNumber.trim();
    const stops: ScheduleEntry[] = schedules
      .filter((s) => String(s.train_number) === trainNo)
      .sort((a, b) => Number(a.day) - Number(b.day))
      .map((s) => ({
        trainNumber: String(s.train_number),
        trainName: String(s.train_name),
        stationCode: String(s.station_code),
        stationName: String(s.station_name),
        arrival: String(s.arrival),
        departure: String(s.departure),
        day: Number(s.day),
      }));

    return stops;
  },
});

/** Get trains between two stations */
export const getTrainsBetweenStations = action({
  args: { from: v.string(), to: v.string() },
  handler: async (_ctx, args) => {
    const geojson = (await fetchJSON(TRAINS_URL)) as {
      features: GeoJSONFeature[];
    };

    const from = args.from.toUpperCase();
    const to = args.to.toUpperCase();

    const matches = geojson.features
      .filter((f) => {
        const fc = String(f.properties.from_station_code || "").toUpperCase();
        const tc = String(f.properties.to_station_code || "").toUpperCase();
        return fc === from || tc === to || fc === to || tc === from;
      })
      .map((f) => ({
        number: String(f.properties.number || ""),
        name: String(f.properties.name || ""),
        fromCode: String(f.properties.from_station_code || ""),
        fromName: String(f.properties.from_station_name || ""),
        toCode: String(f.properties.to_station_code || ""),
        toName: String(f.properties.to_station_name || ""),
        type: String(f.properties.type || ""),
        distance: Number(f.properties.distance || 0),
        durationH: Number(f.properties.duration_h || 0),
        durationM: Number(f.properties.duration_m || 0),
        departure: String(f.properties.departure || ""),
        arrival: String(f.properties.arrival || ""),
      }))
      .slice(0, 50);

    return matches;
  },
});

/** Get railway zone statistics */
export const getZoneStats = action({
  args: {},
  handler: async () => {
    const geojson = (await fetchJSON(STATIONS_URL)) as {
      features: GeoJSONFeature[];
    };

    const zoneMap = new Map<string, number>();
    for (const f of geojson.features) {
      const zone = String(f.properties.zone || "Unknown");
      zoneMap.set(zone, (zoneMap.get(zone) || 0) + 1);
    }

    return Array.from(zoneMap.entries())
      .map(([zone, count]) => ({ zone, stationCount: count }))
      .sort((a, b) => b.stationCount - a.stationCount);
  },
});
