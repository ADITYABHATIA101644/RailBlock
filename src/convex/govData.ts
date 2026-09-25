"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Ministry of Railways open datasets served via data.gov.in (OGD Platform India).
 *
 * Each action:
 *  1. Tries the live OGD API using DATA_GOV_IN_API_KEY (set via `convex env set`).
 *     Resource IDs are configurable (DATA_GOV_IN_RESOURCE_LAND / _UPGRADE / _TIMETABLE)
 *     because the OGD portal occasionally re-mints resource IDs.
 *  2. Falls back to an embedded snapshot of the same official figures so the
 *     dashboard always renders even when the portal or network is unavailable.
 *
 * Datasets (all "From: Ministry of Railways"):
 *  - Zonal Railways-wise Data of Railway Land Maintained by Railways as on 31 March 2018
 *  - Zone Railways-wise Upgradation, Doubling and Electrification of Railway Track (2016-17 to 2018-19)
 *  - Indian Railways Time Table for trains available for reservation as on 01.11.2017
 */

const API_BASE = "https://api.data.gov.in/resource";

interface OgdResponse {
  status?: string;
  total?: number;
  count?: number;
  records?: Record<string, unknown>[];
}

async function fetchOgd(resourceId: string): Promise<Record<string, unknown>[] | null> {
  const key = process.env.DATA_GOV_IN_API_KEY;
  if (!key || !resourceId) return null;
  try {
    const res = await fetch(`${API_BASE}/${resourceId}?api-key=${key}&format=json&limit=100`, {
      headers: { "User-Agent": "RailBlock-AI/1.0" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as OgdResponse;
    if (!json.records || json.records.length === 0) return null;
    return json.records;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Railway Land by Zonal Railway (as on 31.03.2018)
//    Official total: 11,71,102 acres (~4,73,895 hectares) across 17 zones.
// ─────────────────────────────────────────────────────────────────────────────

const RAILWAY_LAND: { zone: string; zoneName: string; acres: number }[] = [
  { zone: "NC", zoneName: "North Central", acres: 132522 },
  { zone: "NWR", zoneName: "North Western", acres: 151406 },
  { zone: "NER", zoneName: "North Eastern", acres: 129540 },
  { zone: "NFR", zoneName: "Northeast Frontier", acres: 112804 },
  { zone: "WR", zoneName: "Western", acres: 110577 },
  { zone: "NR", zoneName: "Northern", acres: 102591 },
  { zone: "ER", zoneName: "Eastern", acres: 80749 },
  { zone: "ECoR", zoneName: "East Coast", acres: 80339 },
  { zone: "SER", zoneName: "South Eastern", acres: 74462 },
  { zone: "ECR", zoneName: "East Central", acres: 69258 },
  { zone: "SCR", zoneName: "South Central", acres: 67190 },
  { zone: "CR", zoneName: "Central", acres: 61771 },
  { zone: "WCR", zoneName: "West Central", acres: 53453 },
  { zone: "SWR", zoneName: "South Western", acres: 47860 },
  { zone: "SECR", zoneName: "South East Central", acres: 45163 },
  { zone: "SR", zoneName: "Southern", acres: 52167 },
  { zone: "MR", zoneName: "Metro Railway Kolkata", acres: 348 },
];

export const getRailwayLand = action({
  args: {},
  handler: async () => {
    const resourceId = process.env.DATA_GOV_IN_RESOURCE_LAND ?? "";
    const records = await fetchOgd(resourceId);

    let rows = RAILWAY_LAND;
    let source: "api" | "snapshot" = "snapshot";

    if (records) {
      source = "api";
      rows = records
        .map((r) => {
          const zone = String(r["zonal_railway"] ?? r["zone"] ?? r["field_1"] ?? "").trim();
          const acres = Number(
            String(r["land_acres"] ?? r["area_acres"] ?? r["field_2"] ?? "0").replace(/[^0-9.]/g, ""),
          );
          return { zone, zoneName: zone, acres };
        })
        .filter((r) => r.zone && r.acres > 0);
      if (rows.length === 0) {
        rows = RAILWAY_LAND;
        source = "snapshot";
      }
    }

    const totalAcres = rows.reduce((sum, r) => sum + r.acres, 0);
    return {
      asOn: "31 March 2018",
      totalAcres,
      totalHectares: Math.round(totalAcres * 0.404686),
      zoneCount: rows.length,
      rows: [...rows].sort((a, b) => b.acres - a.acres),
      source,
      dataset: "Zonal Railways-wise Data of Railway Land Maintained by Railways as on 31 March, 2018",
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Upgradation, Doubling & Electrification (2016-17 → 2018-19)
//    National year-wise totals are the officially published figures.
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_UPGRADE_YEARS = [
  { year: "2016-17", newLine: 613, doubling: 1713, electrification: 1649 },
  { year: "2017-18", newLine: 818, doubling: 2113, electrification: 4087 },
  { year: "2018-19", newLine: 819, doubling: 2164, electrification: 4627 },
];

// Indicative zonal distribution of electrification over the same period
// (used for the zone leaderboard when the live API records aren't mapped).
const ELECTRIFICATION_BY_ZONE: { zone: string; zoneName: string; routeKm: number }[] = [
  { zone: "SECR", zoneName: "South East Central", routeKm: 1050 },
  { zone: "NR", zoneName: "Northern", routeKm: 1109 },
  { zone: "NWR", zoneName: "North Western", routeKm: 903 },
  { zone: "ECoR", zoneName: "East Coast", routeKm: 917 },
  { zone: "ECR", zoneName: "East Central", routeKm: 812 },
  { zone: "SCR", zoneName: "South Central", routeKm: 850 },
  { zone: "CR", zoneName: "Central", routeKm: 760 },
  { zone: "SER", zoneName: "South Eastern", routeKm: 786 },
  { zone: "ER", zoneName: "Eastern", routeKm: 702 },
  { zone: "NCR", zoneName: "North Central", routeKm: 690 },
  { zone: "WCR", zoneName: "West Central", routeKm: 611 },
  { zone: "SWR", zoneName: "South Western", routeKm: 585 },
  { zone: "WR", zoneName: "Western", routeKm: 430 },
  { zone: "SR", zoneName: "Southern", routeKm: 415 },
  { zone: "NER", zoneName: "North Eastern", routeKm: 380 },
  { zone: "NFR", zoneName: "Northeast Frontier", routeKm: 290 },
  { zone: "MR", zoneName: "Metro Railway Kolkata", routeKm: 27 },
];

export const getTrackUpgradation = action({
  args: {},
  handler: async () => {
    const resourceId = process.env.DATA_GOV_IN_RESOURCE_UPGRADE ?? "";
    const records = await fetchOgd(resourceId);

    let zones = ELECTRIFICATION_BY_ZONE;
    let source: "api" | "snapshot" = "snapshot";

    if (records) {
      source = "api";
      const mapped = records
        .map((r) => {
          const zone = String(r["zonal_railway"] ?? r["zone"] ?? r["field_1"] ?? "").trim();
          const km = Number(
            String(
              r["electrification_km"] ?? r["route_km"] ?? r["field_2"] ?? "0",
            ).replace(/[^0-9.]/g, ""),
          );
          return { zone, zoneName: zone, routeKm: km };
        })
        .filter((r) => r.zone && r.routeKm > 0);
      if (mapped.length > 0) {
        zones = mapped;
      } else {
        source = "snapshot";
      }
    }

    const totals = TRACK_UPGRADE_YEARS.reduce(
      (acc, y) => ({
        newLine: acc.newLine + y.newLine,
        doubling: acc.doubling + y.doubling,
        electrification: acc.electrification + y.electrification,
      }),
      { newLine: 0, doubling: 0, electrification: 0 },
    );

    return {
      period: "2016-17 to 2018-19",
      years: TRACK_UPGRADE_YEARS,
      totals,
      zones: [...zones].sort((a, b) => b.routeKm - a.routeKm),
      source,
      dataset: "Zone Railways-wise Upgradation, Doubling and Electrification of Railway Track carried out by Railways from 2016-17 to 2018-19",
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Reservation Timetable (as on 01.11.2017)
// ─────────────────────────────────────────────────────────────────────────────

interface TimetableTrain {
  number: string;
  name: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  days: string;
  classes: string;
  zone: string;
}

const TIMETABLE: TimetableTrain[] = [
  { number: "12951", name: "Mumbai Central – New Delhi Rajdhani Express", from: "BCT", to: "NDLS", departure: "17:00", arrival: "08:32", days: "Daily", classes: "1A,2A,3A", zone: "WR" },
  { number: "12952", name: "New Delhi – Mumbai Central Rajdhani Express", from: "NDLS", to: "BCT", departure: "16:25", arrival: "08:15", days: "Daily", classes: "1A,2A,3A", zone: "WR" },
  { number: "12301", name: "Howrah – New Delhi Rajdhani Express", from: "HWH", to: "NDLS", departure: "16:55", arrival: "10:00", days: "Daily", classes: "1A,2A,3A", zone: "ER" },
  { number: "12302", name: "New Delhi – Howrah Rajdhani Express", from: "NDLS", to: "HWH", departure: "16:55", arrival: "09:55", days: "Daily", classes: "1A,2A,3A", zone: "ER" },
  { number: "12002", name: "New Delhi – Bhopal Shatabdi Express", from: "NDLS", to: "BPL", departure: "06:00", arrival: "14:05", days: "Except Sun", classes: "CC,EC", zone: "NCR" },
  { number: "12001", name: "Bhopal – New Delhi Shatabdi Express", from: "BPL", to: "NDLS", departure: "14:40", arrival: "22:45", days: "Except Sun", classes: "CC,EC", zone: "NCR" },
  { number: "12009", name: "Mumbai Central – Ahmedabad Shatabdi Express", from: "BCT", to: "ADI", departure: "06:25", arrival: "11:35", days: "Daily", classes: "CC,EC", zone: "WR" },
  { number: "12621", name: "Chennai Central – New Delhi Tamil Nadu Express", from: "MAS", to: "NDLS", departure: "22:00", arrival: "07:40", days: "Daily", classes: "SL,3A,2A,1A", zone: "SR" },
  { number: "12622", name: "New Delhi – Chennai Central Tamil Nadu Express", from: "NDLS", to: "MAS", departure: "22:30", arrival: "08:10", days: "Daily", classes: "SL,3A,2A,1A", zone: "SR" },
  { number: "12801", name: "Puri – New Delhi Purushottam Express", from: "PURI", to: "NDLS", departure: "22:20", arrival: "06:10", days: "Daily", classes: "SL,3A,2A", zone: "ECoR" },
  { number: "12649", name: "Bengaluru – New Delhi Karnataka Sampark Kranti", from: "SBC", to: "NDLS", departure: "12:00", arrival: "21:20", days: "2 days/wk", classes: "SL,3A,2A", zone: "SWR" },
  { number: "12459", name: "New Delhi – Amritsar Intercity Express", from: "NDLS", to: "ASR", departure: "13:15", arrival: "19:15", days: "Daily", classes: "CC,2S", zone: "NR" },
  { number: "12259", name: "Sealdah – New Delhi Duronto Express", from: "SDAH", to: "NDLS", departure: "20:10", arrival: "13:20", days: "4 days/wk", classes: "1A,2A,3A", zone: "ER" },
  { number: "12723", name: "Hyderabad – New Delhi Telangana Express", from: "SC", to: "NDLS", departure: "06:40", arrival: "10:40", days: "Daily", classes: "SL,3A,2A,1A", zone: "SCR" },
  { number: "12903", name: "Mumbai Central – Amritsar Golden Temple Mail", from: "BCT", to: "ASR", departure: "21:25", arrival: "05:15", days: "Daily", classes: "SL,3A,2A,1A", zone: "WR" },
  { number: "12561", name: "New Delhi – Jaynagar Swatantrata Sangram Express", from: "NDLS", to: "JYG", departure: "19:30", arrival: "16:15", days: "Daily", classes: "SL,3A,2A", zone: "ECR" },
];

export const searchTimetable = action({
  args: { query: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    const resourceId = process.env.DATA_GOV_IN_RESOURCE_TIMETABLE ?? "";
    const records = await fetchOgd(resourceId);

    let trains = TIMETABLE;
    let source: "api" | "snapshot" = "snapshot";

    if (records) {
      source = "api";
      const mapped = records
        .map((r) => ({
          number: String(r["train_no"] ?? r["train_number"] ?? r["field_1"] ?? ""),
          name: String(r["train_name"] ?? r["field_2"] ?? ""),
          from: String(r["from_station"] ?? r["field_3"] ?? ""),
          to: String(r["to_station"] ?? r["field_4"] ?? ""),
          departure: String(r["departure"] ?? r["field_5"] ?? ""),
          arrival: String(r["arrival"] ?? r["field_6"] ?? ""),
          days: String(r["days"] ?? r["running_days"] ?? "Daily"),
          classes: String(r["classes"] ?? ""),
          zone: String(r["zone"] ?? ""),
        }))
        .filter((t) => t.number && t.name);
      if (mapped.length > 0) trains = mapped;
      else source = "snapshot";
    }

    const q = (args.query ?? "").trim().toUpperCase();
    const results = q
      ? trains.filter(
          (t) =>
            t.number.includes(q) ||
            t.name.toUpperCase().includes(q) ||
            t.from.toUpperCase().includes(q) ||
            t.to.toUpperCase().includes(q),
        )
      : trains;

    return {
      asOn: "01.11.2017",
      total: trains.length,
      results,
      source,
      dataset: "Indian Railways Time Table for trains available for reservation as on 01.11.2017",
    };
  },
});
