import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Database,
  Landmark,
  RailSymbol,
  CalendarClock,
  RefreshCw,
  ExternalLink,
  Search,
  TrainFront,
  Loader2,
  BadgeCheck,
} from "lucide-react";

interface LandRow {
  zone: string;
  zoneName: string;
  acres: number;
}

interface UpgradeYear {
  year: string;
  newLine: number;
  doubling: number;
  electrification: number;
}

interface UpgradeZone {
  zone: string;
  zoneName: string;
  routeKm: number;
}

interface Train {
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

type Tab = "land" | "upgradation" | "timetable";

const DATASET_LINKS: Record<Tab, string> = {
  land: "https://data.gov.in/catalog/zonal-railways-wise-data-railway-land-maintained-railways-31-march-2018",
  upgradation: "https://data.gov.in/catalog/zone-railways-wise-upgradation-doubling-and-electrification-railway-track-carried",
  timetable: "https://data.gov.in/catalog/indian-railways-time-table-trains-available-reservation-01112017",
};

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function GovDataView() {
  const getRailwayLand = useAction(api.govData.getRailwayLand);
  const getTrackUpgradation = useAction(api.govData.getTrackUpgradation);
  const searchTimetableAction = useAction(api.govData.searchTimetable);

  // Total trains indexed in the all-India DB (referenced from the timetable tab)
  const dbStats = useQuery(api.allTrains.getZoneStats, {});

  const [tab, setTab] = useState<Tab>("land");

  const [land, setLand] = useState<{
    asOn: string;
    totalAcres: number;
    totalHectares: number;
    zoneCount: number;
    rows: LandRow[];
    source: string;
  } | null>(null);
  const [upgrade, setUpgrade] = useState<{
    period: string;
    years: UpgradeYear[];
    totals: { newLine: number; doubling: number; electrification: number };
    zones: UpgradeZone[];
    source: string;
  } | null>(null);
  const [trains, setTrains] = useState<{
    asOn: string;
    total: number;
    results: Train[];
    source: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [l, u, t] = await Promise.all([
        getRailwayLand({}),
        getTrackUpgradation({}),
        searchTimetableAction({ query: "" }),
      ]);
      setLand(l as typeof land);
      setUpgrade(u as typeof upgrade);
      setTrains(t as typeof trains);
    } catch (e) {
      console.error("Gov data load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchTrains = async () => {
    try {
      const t = await searchTimetableAction({ query });
      setTrains(t as typeof trains);
    } catch (e) {
      console.error("Timetable search failed:", e);
    }
  };

  const maxAcres = land ? Math.max(...land.rows.map((r) => r.acres)) : 1;
  const maxKm = upgrade ? Math.max(...upgrade.zones.map((z) => z.routeKm)) : 1;
  const maxYearVal = upgrade
    ? Math.max(...upgrade.years.flatMap((y) => [y.newLine, y.doubling, y.electrification]))
    : 1;

  const tabs: { id: Tab; label: string; icon: typeof Landmark }[] = [
    { id: "land", label: "Railway Land", icon: Landmark },
    { id: "upgradation", label: "Track Upgradation", icon: RailSymbol },
    { id: "timetable", label: "Reservation Timetable", icon: CalendarClock },
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Government Open Data — Ministry of Railways
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live datasets from data.gov.in (OGD Platform India) feeding the block planner
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              Official Govt. Source
            </span>
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit items-center gap-1 rounded-full border border-border/50 bg-card/60 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && !land ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ── RAILWAY LAND ── */}
          {tab === "land" && land && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Total Land Holdings</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {fmt(land.totalAcres)} <span className="text-sm font-medium">acres</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ≈ {fmt(land.totalHectares)} hectares
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Zonal Railways</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{land.zoneCount}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">reporting divisions</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Largest Holding</p>
                  <p className="text-2xl font-bold text-chart-3 mt-1">
                    {land.rows[0]?.zone ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {fmt(land.rows[0]?.acres ?? 0)} acres
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Data As On</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{land.asOn.split(" ")[2]}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{land.asOn}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Zone-wise Railway Land (acres)
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Source: {land.source === "api" ? "data.gov.in API" : "Official snapshot"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {land.rows.map((r) => (
                    <div key={r.zone} className="flex items-center gap-3">
                      <span className="w-12 text-xs font-bold text-foreground shrink-0">{r.zone}</span>
                      <div className="flex-1 h-5 rounded-lg bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-primary/80 to-chart-3/80 transition-all duration-700"
                          style={{ width: `${(r.acres / maxAcres) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs font-mono text-muted-foreground shrink-0">
                        {fmt(r.acres)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TRACK UPGRADATION ── */}
          {tab === "upgradation" && upgrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">New Line</p>
                  <p className="text-2xl font-bold text-chart-2 mt-1">
                    {fmt(upgrade.totals.newLine)} <span className="text-sm">km</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Doubling</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {fmt(upgrade.totals.doubling)} <span className="text-sm">km</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="text-xs text-muted-foreground">Electrification</p>
                  <p className="text-2xl font-bold text-chart-4 mt-1">
                    {fmt(upgrade.totals.electrification)} <span className="text-sm">km</span>
                  </p>
                </div>
              </div>

              {/* Year-wise stacked bars */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Year-wise progress ({upgrade.period})
                </h3>
                <div className="space-y-4">
                  {upgrade.years.map((y) => (
                    <div key={y.year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-foreground">{y.year}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {fmt(y.newLine + y.doubling + y.electrification)} route-km total
                        </span>
                      </div>
                      <div className="flex h-6 rounded-lg overflow-hidden bg-muted/30">
                        <div
                          className="h-full bg-chart-2/80"
                          style={{ width: `${(y.newLine / maxYearVal) * 100}%` }}
                          title={`New line: ${y.newLine} km`}
                        />
                        <div
                          className="h-full bg-primary/80"
                          style={{ width: `${(y.doubling / maxYearVal) * 100}%` }}
                          title={`Doubling: ${y.doubling} km`}
                        />
                        <div
                          className="h-full bg-chart-4/80"
                          style={{ width: `${(y.electrification / maxYearVal) * 100}%` }}
                          title={`Electrification: ${y.electrification} km`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-chart-2/80" /> New line
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-primary/80" /> Doubling
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-chart-4/80" /> Electrification
                  </span>
                </div>
              </div>

              {/* Zone leaderboard */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Top zones — electrification (route-km)
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Source: {upgrade.source === "api" ? "data.gov.in API" : "Official snapshot"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {upgrade.zones.slice(0, 10).map((z) => (
                    <div key={z.zone} className="flex items-center gap-3">
                      <span className="w-12 text-xs font-bold text-foreground shrink-0">{z.zone}</span>
                      <div className="flex-1 h-5 rounded-lg bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-chart-4/80 to-primary/80 transition-all duration-700"
                          style={{ width: `${(z.routeKm / maxKm) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-mono text-muted-foreground shrink-0">
                        {fmt(z.routeKm)} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RESERVATION TIMETABLE ── */}
          {tab === "timetable" && trains && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-2.5">
                <TrainFront className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is the official OGD reservation snapshot (as on {trains.asOn}). The full,
                  searchable all-India database of{" "}
                  <span className="font-semibold text-foreground">
                    {dbStats ? `${dbStats.total.toLocaleString("en-IN")} live trains` : "all live trains"}
                  </span>{" "}
                  — with GPS routes, zones, classes and durations — lives in the{" "}
                  <span className="font-semibold text-foreground">Live Trains</span> tab.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void searchTrains()}
                    placeholder="Search train number, name, or station code (e.g. 12951, Rajdhani, NDLS)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-background/60 border border-border/50 focus:outline-none focus:border-primary/40 text-foreground"
                  />
                </div>
                <button
                  onClick={() => void searchTrains()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
                  <span className="text-xs text-muted-foreground">
                    Timetable as on {trains.asOn} · {trains.results.length} of {trains.total} trains
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Source: {trains.source === "api" ? "data.gov.in API" : "Official snapshot"}
                  </span>
                </div>
                <div className="divide-y divide-border/20 max-h-[480px] overflow-auto">
                  {trains.results.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground text-center">
                      No trains matched “{query}”.
                    </p>
                  ) : (
                    trains.results.map((t) => (
                      <div
                        key={t.number}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors"
                      >
                        <div className="w-14 shrink-0 text-center">
                          <div className="w-9 h-9 mx-auto rounded-lg bg-primary/15 flex items-center justify-center">
                            <TrainFront className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm text-foreground">
                              {t.number}
                            </span>
                            <span className="text-sm text-foreground truncate">{t.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t.from} → {t.to} · {t.days}
                            {t.classes ? ` · ${t.classes}` : ""}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <div className="text-sm font-semibold text-foreground">
                            {t.departure} → {t.arrival}
                          </div>
                          <div className="text-[10px] text-muted-foreground">dep → arr</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dataset provenance footer */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Database className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                <span className="font-semibold text-foreground">Data provenance:</span> All three
                datasets are published by the Ministry of Railways on the Open Government Data
                (OGD) Platform India. RailBlock AI pulls them at runtime and uses the same figures
                for asset availability baselines, track-age risk models, and traffic windows in the
                block planner.
              </p>
            </div>
            <a
              href={DATASET_LINKS[tab]}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
            >
              View on data.gov.in <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
