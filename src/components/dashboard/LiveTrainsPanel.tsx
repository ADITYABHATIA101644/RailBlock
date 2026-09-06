import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Train,
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Radio,
} from "lucide-react";

const popularStations = [
  { code: "NDLS", name: "New Delhi" }, { code: "MAS", name: "Chennai Central" },
  { code: "HWH", name: "Howrah" }, { code: "BCT", name: "Mumbai Central" },
  { code: "SBC", name: "Bangalore" }, { code: "SC", name: "Secunderabad" },
  { code: "BPL", name: "Bhopal" }, { code: "PNBE", name: "Patna" },
  { code: "LKO", name: "Lucknow" }, { code: "ADI", name: "Ahmedabad" },
  { code: "JP", name: "Jaipur" }, { code: "NGP", name: "Nagpur" },
  { code: "MFP", name: "Muzaffarpur" }, { code: "GKP", name: "Gorakhpur" },
  { code: "CNB", name: "Kanpur Central" }, { code: "JAT", name: "Jammu Tawi" },
  { code: "KOAA", name: "Kolkata" }, { code: "PURI", name: "Puri" },
  { code: "GHY", name: "Guwahati" }, { code: "TVC", name: "Trivandrum" },
];

const demoTrains = [
  { number: "12951", name: "Mumbai Rajdhani", source: "NDLS", destination: "BCT", delay: "RT", status: "running", currentStation: "Vadodara", speed: "130 km/h" },
  { number: "12002", name: "Bhopal Shatabdi", source: "NDLS", destination: "BPL", delay: "15 M", status: "running", currentStation: "Agra Cantt", speed: "145 km/h" },
  { number: "12260", name: "Swarna Jayanti", source: "NDLS", destination: "SDAH", delay: "25 M", status: "running", currentStation: "Prayagraj", speed: "110 km/h" },
  { number: "12050", name: "Gatimaan Express", source: "NDLS", destination: "AGC", delay: "RT", status: "running", currentStation: "Mathura", speed: "160 km/h" },
  { number: "12301", name: "Howrah Rajdhani", source: "HWH", destination: "NDLS", delay: "42 M", status: "delayed", currentStation: "Mughal Sarai", speed: "120 km/h" },
  { number: "12625", name: "Kerala Express", source: "NDLS", destination: "TVC", delay: "RT", status: "running", currentStation: "Nagpur", speed: "115 km/h" },
  { number: "12952", name: "Mumbai Rajdhani", source: "BCT", destination: "NDLS", delay: "10 M", status: "running", currentStation: "Vadodara", speed: "125 km/h" },
  { number: "12313", name: "Sealdah Rajdhani", source: "SDAH", destination: "NDLS", delay: "RT", status: "running", currentStation: "Patna", speed: "135 km/h" },
  { number: "12802", name: "Puri Rajdhani", source: "PURI", destination: "NDLS", delay: "35 M", status: "delayed", currentStation: "Rourkela", speed: "105 km/h" },
  { number: "12434", name: "Chennai Rajdhani", source: "MAS", destination: "NDLS", delay: "RT", status: "running", currentStation: "Balharshah", speed: "128 km/h" },
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
  const [liveData, setLiveData] = useState<any[] | null>(null);
  const [trainDetail, setTrainDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useLiveData, setUseLiveData] = useState(false);

  const fetchLiveTrain = useAction(api.trainData.getLiveTrain);
  const fetchLiveStation = useAction(api.trainData.getLiveStation);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      if (searchMode === "train") {
        const data = await fetchLiveTrain({ trainNumber: searchQuery.trim() }) as any;
        setTrainDetail({ number: data.trainNumber || searchQuery.trim(), route: data.route || [] });
        setLiveData(null);
        setUseLiveData(true);
      } else {
        const data = await fetchLiveStation({ stationCode: searchQuery.trim().toUpperCase() }) as any;
        setLiveData(Array.isArray(data) ? data : []);
        setTrainDetail(null);
        setUseLiveData(true);
      }
    } catch (error) {
      console.warn("Live API unavailable:", error);
      toast.error("Live API unavailable", {
        description: error instanceof Error ? error.message : "Check API key or try again.",
      });
      // Fall back to demo data
      if (searchMode === "train") {
        const demo = demoTrains.find((t) => t.number === searchQuery.trim());
        if (demo) {
          setTrainDetail({
            number: demo.number,
            route: [
              { station: demo.source, code: demo.source, scheduledArrival: "Source", actualArrival: "Source", delay: "-", scheduledDeparture: "08:00 AM", actualDeparture: "08:00 AM", delayDeparture: "00 M" },
              { station: demo.currentStation, code: "---", scheduledArrival: "12:00 PM", actualArrival: "12:" + String(parseDelay(demo.delay)).padStart(2, "0") + " PM", delay: demo.delay, scheduledDeparture: "12:05 PM", actualDeparture: "12:" + String(parseDelay(demo.delay) + 5).padStart(2, "0") + " PM", delayDeparture: demo.delay },
              { station: demo.destination, code: demo.destination, scheduledArrival: "06:00 PM", actualArrival: "06:" + String(parseDelay(demo.delay)).padStart(2, "0") + " PM", delay: demo.delay, scheduledDeparture: "Destination", actualDeparture: "Destination", delayDeparture: "-" },
            ],
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayTrains = useLiveData ? (liveData || []) : demoTrains;
  const hasLiveData = useLiveData && liveData;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-primary/10 rounded-xl p-0.5">
            <button onClick={() => setSearchMode("train")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "train" ? "bg-primary text-primary-foreground" : "text-primary"}`}>
              Train Number
            </button>
            <button onClick={() => setSearchMode("station")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "station" ? "bg-primary text-primary-foreground" : "text-primary"}`}>
              Station Code
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={searchMode === "train" ? "Enter train number (e.g. 12951)" : "Enter station code (e.g. NDLS)"}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Search
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {useLiveData ? (
            <>
              <Radio className="w-3 h-3 text-chart-3 animate-pulse" />
              <span className="text-chart-3 font-medium">Live data from Indian Railways API</span>
              <button onClick={() => setUseLiveData(false)} className="ml-auto text-muted-foreground hover:text-foreground">Switch to demo</button>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-chart-4/50" />
              <span className="text-chart-4 font-medium">Demo data — search any train number for live data</span>
            </>
          )}
        </div>
      </div>

      {/* Train detail view */}
      {trainDetail && (
        <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Train className="w-5 h-5 text-primary" /></div>
            <div>
              <h3 className="font-semibold">Train #{trainDetail.number}</h3>
              <p className="text-xs text-muted-foreground">Live route with delays</p>
            </div>
            <button onClick={() => setTrainDetail(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Code</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Station</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Sched. Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Actual Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Sched. Dep</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Actual Dep</th>
                </tr>
              </thead>
              <tbody>
                {trainDetail.route.map((stop: any, i: number) => {
                  const delay = parseDelay(stop.delay);
                  return (
                    <tr key={i} className="border-b border-border/20 hover:bg-primary/5">
                      <td className="px-3 py-2 font-mono text-xs">{stop.code}</td>
                      <td className="px-3 py-2 font-medium">{stop.station}</td>
                      <td className="px-3 py-2 font-mono text-xs">{stop.scheduledArrival}</td>
                      <td className="px-3 py-2 font-mono text-xs">{stop.actualArrival}</td>
                      <td className="px-3 py-2">
                        {delay > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />{stop.delay}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />RT
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{stop.scheduledDeparture}</td>
                      <td className="px-3 py-2 font-mono text-xs">{stop.actualDeparture}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popular stations */}
      {!trainDetail && !hasLiveData && (
        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3">Quick Access — Major Stations</h3>
          <div className="flex flex-wrap gap-2">
            {popularStations.map((s) => (
              <button key={s.code} onClick={() => { setSearchQuery(s.code); setSearchMode("station"); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all">
                <span className="font-mono font-bold">{s.code}</span>
                <span className="text-muted-foreground ml-1">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live station data */}
      {hasLiveData && !trainDetail && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center gap-2">
            <Radio className="w-4 h-4 text-chart-3 animate-pulse" />
            <h3 className="font-semibold">Live Station — {searchQuery.toUpperCase()}</h3>
            <span className="text-xs text-muted-foreground ml-auto">{(liveData as any[]).length} trains</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Train</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Expected Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Expected Dep</th>
                </tr>
              </thead>
              <tbody>
                {(liveData as any[]).map((train: any, i: number) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-primary/5 cursor-pointer"
                    onClick={() => { setSearchQuery(train.number); setSearchMode("train"); handleSearch(); }}>
                    <td className="px-5 py-3">
                      <div className="font-mono font-semibold">{train.number}</div>
                      <div className="text-xs text-muted-foreground">{train.name}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{train.source} → {train.destination}</td>
                    <td className="px-5 py-3 font-mono text-xs">{train.expectedArrival}</td>
                    <td className="px-5 py-3">
                      {parseDelay(train.delay) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />{train.delay}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" />RT
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{train.expectedDeparture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo trains */}
      {!hasLiveData && !trainDetail && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Trains Across India</h3>
            </div>
            <span className="text-xs text-muted-foreground">{demoTrains.length} trains showing</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Train</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Current Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Speed</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoTrains.map((train, i) => {
                  const delay = parseDelay(train.delay);
                  return (
                    <tr key={i} className="border-b border-border/20 hover:bg-primary/5 cursor-pointer"
                      onClick={() => { setSearchQuery(train.number); setSearchMode("train"); handleSearch(); }}>
                      <td className="px-5 py-3">
                        <div className="font-mono font-semibold">{train.number}</div>
                        <div className="text-xs text-muted-foreground">{train.name}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{train.source} → {train.destination}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /><span className="text-sm">{train.currentStation}</span></div>
                      </td>
                      <td className="px-5 py-3 text-xs font-medium">{train.speed}</td>
                      <td className="px-5 py-3">
                        {delay > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />{train.delay}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />RT
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${train.status === "running" ? "bg-chart-3/15 text-chart-3" : "bg-chart-4/15 text-chart-4"}`}>
                          {train.status === "running" ? "Running" : "Delayed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
