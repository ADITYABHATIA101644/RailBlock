import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Train,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Loader2,
  MapPin,
} from "lucide-react";
import { MAJOR_STATIONS, ZONES, ZONE_COLORS } from "@/data/railwayNetwork";

/* Key corridors for railway lines */
const KEY_CORRIDORS: { name: string; stations: string[]; color: string }[] = [
  { name: "Delhi–Chennai Grand Trunk", stations: ["NDLS", "AGC", "JHS", "BPL", "NGP", "SC", "MAS"], color: "oklch(0.75 0.15 55)" },
  { name: "Delhi–Howrah", stations: ["NDLS", "CNB", "PRYJ", "MFP", "PNBE", "HWH"], color: "oklch(0.65 0.18 250)" },
  { name: "Mumbai–Delhi", stations: ["BCT", "ST", "RTM", "BPL", "JHS", "AGC", "NDLS"], color: "oklch(0.70 0.14 160)" },
  { name: "Mumbai–Chennai", stations: ["CSTM", "PUNE", "SC", "VJW", "MAS"], color: "oklch(0.65 0.22 25)" },
  { name: "Delhi–Jammu", stations: ["NDLS", "UMB", "JAT"], color: "oklch(0.55 0.18 250)" },
  { name: "Kolkata–Chennai", stations: ["HWH", "BHP", "VSKP", "VJW", "MAS"], color: "oklch(0.60 0.15 280)" },
  { name: "Delhi–Ahmedabad", stations: ["NDLS", "JP", "ADI"], color: "oklch(0.70 0.12 160)" },
  { name: "Guwahati–Delhi", stations: ["GHY", "NJP", "PNBE", "NDLS"], color: "oklch(0.50 0.10 280)" },
  { name: "Mumbai–Howrah", stations: ["CSTM", "NGP", "BSP", "TATA", "HWH"], color: "oklch(0.65 0.20 30)" },
  { name: "Chennai–Bangalore", stations: ["MAS", "SBC"], color: "oklch(0.75 0.15 55 / 0.7)" },
  { name: "Delhi–Lucknow", stations: ["NDLS", "LKO"], color: "oklch(0.70 0.14 160 / 0.7)" },
  { name: "Kolkata–Guwahati", stations: ["HWH", "MLDT", "GHY"], color: "oklch(0.60 0.15 280 / 0.7)" },
];

/* Demo live trains */
const demoTrains = [
  { number: "12951", name: "Mumbai Rajdhani", lat: 23.50, lng: 76.80, speed: 130 },
  { number: "12301", name: "Howrah Rajdhani", lat: 25.80, lng: 84.50, speed: 120 },
  { number: "12002", name: "Bhopal Shatabdi", lat: 27.20, lng: 78.00, speed: 145 },
  { number: "12260", name: "Swarna Jayanti", lat: 25.30, lng: 83.00, speed: 110 },
  { number: "12050", name: "Gatimaan Express", lat: 27.40, lng: 77.80, speed: 160 },
  { number: "12625", name: "Kerala Express", lat: 21.00, lng: 79.10, speed: 115 },
  { number: "12952", name: "Mumbai Rajdhani", lat: 23.10, lng: 73.00, speed: 125 },
  { number: "12802", name: "Puri Rajdhani", lat: 21.50, lng: 84.00, speed: 105 },
  { number: "12434", name: "Chennai Rajdhani", lat: 19.50, lng: 79.50, speed: 128 },
  { number: "12313", name: "Sealdah Rajdhani", lat: 24.80, lng: 85.50, speed: 135 },
];

export default function RailwayMapView() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [liveTrains, setLiveTrains] = useState(demoTrains);
  const [isLoadingTrains, setIsLoadingTrains] = useState(false);

  const fetchLiveStation = useAction(api.trainData.getLiveStation);

  const handleLoadLiveTrains = async () => {
    setIsLoadingTrains(true);
    try {
      const data = await fetchLiveStation({ stationCode: "NDLS" }) as { number: string; name: string; delay: string }[];
      const trains = data.slice(0, 10).map((t, i) => ({
        number: t.number,
        name: t.name,
        lat: 28.64 + (i * 0.5 - 2.5),
        lng: 77.22 + (i * 0.3 - 1.5),
        speed: Math.floor(Math.random() * 60 + 80),
        delay: t.delay,
      }));
      if (trains.length > 0) setLiveTrains(trains);
    } catch {
      // Keep demo trains
    }
    setIsLoadingTrains(false);
  };

  const center: [number, number] = [22.5, 80.0];

  const getStationByCode = (code: string) => MAJOR_STATIONS.find((s) => s.code === code);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 text-sm">
          <Radio className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Layers:</span>
        </div>
        <button onClick={() => setShowTrains(!showTrains)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${showTrains ? "bg-primary/15 text-primary border-primary/30" : "bg-card text-muted-foreground border-border/50"}`}>
          <Train className="w-4 h-4" /> Trains
        </button>
        <button onClick={() => setShowStations(!showStations)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${showStations ? "bg-chart-3/15 text-chart-3 border-chart-3/30" : "bg-card text-muted-foreground border-border/50"}`}>
          <MapPin className="w-4 h-4" /> Stations
        </button>
        <button onClick={() => setShowCorridors(!showCorridors)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${showCorridors ? "bg-chart-4/15 text-chart-4 border-chart-4/30" : "bg-card text-muted-foreground border-border/50"}`}>
          Lines
        </button>
        <button onClick={handleLoadLiveTrains} disabled={isLoadingTrains}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 transition-all disabled:opacity-50">
          {isLoadingTrains ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          {isLoadingTrains ? "Loading..." : "Load Live Trains"}
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Radio className="w-3 h-3 text-chart-3 animate-pulse" />
          {MAJOR_STATIONS.length} stations • {ZONES.length} zones • {KEY_CORRIDORS.length} corridors
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-card" style={{ height: "600px" }}>
        <MapContainer center={center} zoom={5} className="w-full h-full" zoomControl={true}>
          <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* Railway corridors */}
          {showCorridors && KEY_CORRIDORS.map((corridor, ci) => {
            const points = corridor.stations.map((code) => getStationByCode(code)).filter(Boolean).map((s) => [s!.lat, s!.lng] as [number, number]);
            if (points.length < 2) return null;
            return (
              <Polyline key={ci} positions={points} pathOptions={{ color: corridor.color, weight: 3, opacity: 0.7 }} />
            );
          })}

          {/* Stations */}
          {showStations && MAJOR_STATIONS.map((station) => {
            const zoneColor = ZONE_COLORS[station.zone] || "#ffffff";
            return (
              <CircleMarker key={station.code} center={[station.lat, station.lng]}
                radius={selectedZone === station.zone ? 6 : 4}
                fillColor={zoneColor} fillOpacity={selectedZone ? (station.zone === selectedZone ? 1 : 0.3) : 0.8}
                color={zoneColor} weight={selectedZone === station.zone ? 3 : 1}>
                <Tooltip direction="top" offset={[0, -8]} className="!bg-card !border-border/50 !text-foreground !rounded-xl !shadow-lg">
                  <div className="text-sm font-semibold">{station.name}</div>
                  <div className="text-xs text-muted-foreground">{station.code} • {station.zone}</div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Live trains */}
          {showTrains && liveTrains.map((train, i) => (
            <CircleMarker key={`train-${i}`} center={[train.lat, train.lng]} radius={7}
              fillColor="oklch(0.65 0.18 250)" fillOpacity={1} color="oklch(0.65 0.18 250)" weight={2}>
              <Tooltip direction="top" offset={[0, -10]} className="!bg-card !border-border/50 !text-foreground !rounded-xl !shadow-lg">
                <div className="text-sm font-semibold">{train.number} — {train.name}</div>
                <div className="text-xs text-muted-foreground">{train.speed} km/h{('delay' in train) ? ` • ${(train as {delay: string}).delay}` : ""}</div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Zone legend */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <h3 className="font-semibold mb-3">Railway Zones — Click to filter</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedZone(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!selectedZone ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"}`}>
            All Zones
          </button>
          {ZONES.map((zone) => (
            <button key={zone.code} onClick={() => setSelectedZone(selectedZone === zone.code ? null : zone.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedZone === zone.code ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              style={{
                background: selectedZone === zone.code ? ZONE_COLORS[zone.code] : "transparent",
                borderColor: ZONE_COLORS[zone.code] + "40",
              }}>
              <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: ZONE_COLORS[zone.code] }} />
              {zone.code} — {zone.name.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
