import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Train,
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Radio,
  RefreshCw,
  Database,
  Route,
} from "lucide-react";

const popularStations = [
  { code: "NDLS", name: "New Delhi" },
  { code: "MAS", name: "Chennai" },
  { code: "HWH", name: "Howrah" },
  { code: "BCT", name: "Mumbai Central" },
  { code: "SBC", name: "KSR Bengaluru" },
  { code: "SC", name: "Secunderabad" },
  { code: "BPL", name: "Bhopal" },
  { code: "PNBE", name: "Patna" },
  { code: "LKO", name: "Lucknow" },
  { code: "ADI", name: "Ahmedabad" },
  { code: "JP", name: "Jaipur" },
  { code: "NGP", name: "Nagpur" },
  { code: "GKP", name: "Gorakhpur" },
  { code: "CNB", name: "Kanpur Central" },
  { code: "GHY", name: "Guwahati" },
  { code: "PURI", name: "Puri" },
  { code: "TVC", name: "Trivandrum" },
  { code: "CSTM", name: "Mumbai CST" },
  { code: "LTT", name: "Lokmanya Tilak" },
  { code: "BBS", name: "Bhubaneswar" },
];

function parseDelay(delayStr: string): number {
  if (!delayStr || delayStr === "RT" || delayStr === "-") return 0;
  const match = delayStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LiveTrainsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"train" | "station">("train");
  const [trainDetail, setTrainDetail] = useState<{
    number: string;
    name: string;
    route: {
      station: string;
      code: string;
      scheduledArrival: string;
      scheduledDeparture: string;
      day: number;
    }[];
    isLive?: boolean;
    from?: string;
    to?: string;
    type?: string;
    distance?: number;
    duration?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"real" | "demo">("real");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [stationResults, setStationResults] = useState<any[] | null>(null);

  const fetchLiveTrain = useAction(api.trainData.getLiveTrain);
  const fetchIRCTCSchedule = useAction(api.trainData.getTrainSchedule);
  const fetchRealSchedule = useAction(api.railwayData.getTrainSchedule);
  const searchRealTrains = useAction(api.railwayData.searchTrains);
  const searchRealStations = useAction(api.railwayData.searchStations);

  const handleTrainSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSearchResults(null);
    setStationResults(null);

    const trainNo = searchQuery.trim();

    // First try IRCTC live API for real-time data
    try {
      const liveData = (await fetchLiveTrain({ trainNumber: trainNo })) as any;
      if (liveData && liveData.route && liveData.route.length > 0) {
        setTrainDetail({
          number: liveData.trainNumber || trainNo,
          name: liveData.name || `Train ${trainNo}`,
          isLive: true,
          route: liveData.route.map((stop: any, i: number) => ({
            station: stop.station || "",
            code: stop.code || "",
            scheduledArrival: stop.scheduledArrival || stop.actualArrival || "-",
            scheduledDeparture: stop.scheduledDeparture || stop.actualDeparture || "-",
            day: i < 7 ? 1 : 2,
          })),
        });
        setDataSource("real");
        toast.success("Live train data loaded!", {
          description: `Train ${trainNo} — ${liveData.route.length} stops with real-time delays`,
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // Fall through to dataset search
    }

    // Then try the real railway dataset for schedule
    try {
      const schedule = (await fetchRealSchedule({ trainNumber: trainNo })) as any[];
      if (schedule && schedule.length > 0) {
        const trainName = schedule[0]?.trainName || `Train ${trainNo}`;
        setTrainDetail({
          number: trainNo,
          name: trainName,
          isLive: false,
          route: schedule.map((stop: any) => ({
            station: stop.stationName || "",
            code: stop.stationCode || "",
            scheduledArrival: stop.arrival || "Source",
            scheduledDeparture: stop.departure || "Destination",
            day: stop.day || 1,
          })),
        });
        setDataSource("real");
        toast.success("Train schedule loaded from Indian Railways database!", {
          description: `Train ${trainNo} — ${trainName} — ${schedule.length} stops`,
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // Fall through to search
    }

    // Search the dataset for matching trains
    try {
      const results = (await searchRealTrains({ query: trainNo })) as any[];
      if (results && results.length > 0) {
        setSearchResults(results);
        setDataSource("real");
        toast.info(`${results.length} trains found`, {
          description: "Click a train to see its full schedule",
        });
      } else {
        toast.info("No trains found", {
          description: "Try a different train number or name",
        });
      }
    } catch {
      toast.error("Search failed", {
        description: "Could not search railway database",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSearchResults(null);
    setStationResults(null);

    try {
      const results = (await searchRealStations({ query: searchQuery.trim() })) as any[];
      if (results && results.length > 0) {
        setStationResults(results);
        setDataSource("real");
        toast.success(`${results.length} stations found`, {
          description: `Showing results for "${searchQuery.trim()}"`,
        });
      } else {
        toast.info("No stations found", {
          description: "Try a station code (e.g. NDLS) or name",
        });
      }
    } catch {
      toast.error("Station search failed", {
        description: "Could not search station database",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchMode === "train") handleTrainSearch();
    else handleStationSearch();
  };

  const loadTrainFromResult = async (result: any) => {
    setIsLoading(true);
    setSearchResults(null);
    setStationResults(null);

    try {
      const schedule = (await fetchRealSchedule({ trainNumber: result.number })) as any[];
      if (schedule && schedule.length > 0) {
        setTrainDetail({
          number: result.number,
          name: result.name || schedule[0]?.trainName || `Train ${result.number}`,
          isLive: false,
          from: result.fromName || result.fromCode,
          to: result.toName || result.toCode,
          type: result.type,
          distance: result.distance,
          duration: result.durationH ? `${result.durationH}h ${result.durationM}m` : undefined,
          route: schedule.map((stop: any) => ({
            station: stop.stationName || "",
            code: stop.stationCode || "",
            scheduledArrival: stop.arrival || "Source",
            scheduledDeparture: stop.departure || "Destination",
            day: stop.day || 1,
          })),
        });
        toast.success("Full schedule loaded!", {
          description: `${result.name} — ${schedule.length} stops`,
        });
      } else {
        // Use basic info from search result
        setTrainDetail({
          number: result.number,
          name: result.name,
          isLive: false,
          from: result.fromName,
          to: result.toName,
          type: result.type,
          distance: result.distance,
          duration: result.durationH ? `${result.durationH}h ${result.durationM}m` : undefined,
          route: [
            { station: result.fromName, code: result.fromCode, scheduledArrival: "Source", scheduledDeparture: result.departure, day: 1 },
            { station: result.toName, code: result.toCode, scheduledArrival: result.arrival, scheduledDeparture: "Destination", day: result.durationH > 24 ? 2 : 1 },
          ],
        });
      }
    } catch {
      toast.error("Could not load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-primary/10 rounded-xl p-0.5">
            <button
              onClick={() => { setSearchMode("train"); setSearchResults(null); setStationResults(null); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "train" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              Train Number
            </button>
            <button
              onClick={() => { setSearchMode("station"); setSearchResults(null); setStationResults(null); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "station" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              Station / Name
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchMode === "train"
                    ? "Train number (12951) or name (Rajdhani)"
                    : "Station code (NDLS) or name (Delhi)"
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="flex items-center gap-2 text-xs">
          <Database className="w-3 h-3 text-primary" />
          <span className="text-primary font-medium">
            {dataSource === "real"
              ? "Real Indian Railways data — datameet/railways + IRCTC API"
              : "Demo data"}
          </span>
        </div>
      </div>

      {/* Search Results — trains from dataset */}
      {searchResults && searchResults.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Search Results — {searchResults.length} trains</h3>
            </div>
            <button onClick={() => setSearchResults(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Train</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Distance</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Classes</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((train: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-primary/5 cursor-pointer"
                    onClick={() => loadTrainFromResult(train)}
                  >
                    <td className="px-5 py-3">
                      <div className="font-mono font-semibold">{train.number}</div>
                      <div className="text-xs text-muted-foreground max-w-48 truncate">{train.name}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {train.fromCode} → {train.toCode}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{train.type || "Exp"}</span>
                    </td>
                    <td className="px-5 py-3 text-xs">{train.distance ? `${train.distance} km` : "-"}</td>
                    <td className="px-5 py-3 text-xs">{train.durationH}h {train.durationM}m</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-32 truncate">{train.classes || "SL, 3A, 2A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Results — stations from dataset */}
      {stationResults && stationResults.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Stations Found — {stationResults.length} results</h3>
            </div>
            <button onClick={() => setStationResults(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Code</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Station Name</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Zone</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">State</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {stationResults.map((station: any, i: number) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-primary/5">
                    <td className="px-5 py-3 font-mono font-bold text-primary">{station.code}</td>
                    <td className="px-5 py-3 font-medium">{station.name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{station.zone}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{station.state}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Train detail view with schedule */}
      {trainDetail && (
        <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Train className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">
                Train #{trainDetail.number} — {trainDetail.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {trainDetail.from && trainDetail.to ? `${trainDetail.from} → ${trainDetail.to}` : ""}
                {trainDetail.type ? ` • ${trainDetail.type}` : ""}
                {trainDetail.distance ? ` • ${trainDetail.distance} km` : ""}
                {trainDetail.duration ? ` • ${trainDetail.duration}` : ""}
                {` • `}
                {trainDetail.route.length} stops
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {trainDetail.isLive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live IRCTC
                </span>
              )}
              {!trainDetail.isLive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                  <Database className="w-3 h-3" />
                  Indian Railways DB
                </span>
              )}
              <button
                onClick={() => setTrainDetail(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">#</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Code</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Station</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Arrival</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Departure</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Day</th>
                </tr>
              </thead>
              <tbody>
                {trainDetail.route.map((stop, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-primary/5"
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground font-mono">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-bold">
                      {stop.code}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {stop.station}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {stop.scheduledArrival}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {stop.scheduledDeparture}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {stop.day === 1 ? (
                        <span className="text-chart-3 font-medium">Day 1</span>
                      ) : (
                        <span className="text-chart-4 font-medium">Day {stop.day}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popular stations */}
      {!trainDetail && !searchResults && !stationResults && (
        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3">Quick Access — Major Stations (from Indian Railways DB)</h3>
          <div className="flex flex-wrap gap-2">
            {popularStations.map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  setSearchQuery(s.code);
                  setSearchMode("station");
                  handleStationSearch();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <span className="font-mono font-bold">{s.code}</span>
                <span className="text-muted-foreground ml-1">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick search popular trains */}
      {!trainDetail && !searchResults && !stationResults && (
        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3">Popular Trains — click to see real schedule</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { num: "12951", name: "Mumbai Rajdhani" },
              { num: "12301", name: "Howrah Rajdhani" },
              { num: "12050", name: "Gatimaan Express" },
              { num: "12625", name: "Kerala Express" },
              { num: "12952", name: "Mumbai Rajdhani (Rtn)" },
              { num: "12434", name: "Chennai Rajdhani" },
              { num: "12565", name: "Darbhanga Rajdhani" },
              { num: "12311", name: "Kalka Mail" },
            ].map((t) => (
              <button
                key={t.num}
                onClick={() => {
                  setSearchQuery(t.num);
                  setSearchMode("train");
                  handleTrainSearch();
                }}
                className="p-3 rounded-xl border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all text-left"
              >
                <div className="font-mono font-bold text-sm text-primary">{t.num}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
