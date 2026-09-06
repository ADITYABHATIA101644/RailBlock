import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Train,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
} from "lucide-react";

/* Railway sections with coordinates (Delhi-Mathura-Agra corridor) */
const railwaySections = [
  {
    id: "SEC-001",
    name: "Delhi Junction → New Delhi",
    coords: [[28.6507, 77.2334] as [number, number], [28.6420, 77.2260] as [number, number]],
    status: "clear",
    assets: 14,
    healthScore: 92,
  },
  {
    id: "SEC-002",
    name: "New Delhi → Hazrat Nizamuddin",
    coords: [[28.6420, 77.2260] as [number, number], [28.5890, 77.2490] as [number, number]],
    status: "block",
    assets: 18,
    healthScore: 88,
    block: { id: "BLK-0847", dept: "P-Way", time: "02:00–05:00", urgency: "high" },
  },
  {
    id: "SEC-003",
    name: "Nizamuddin → Faridabad",
    coords: [[28.5890, 77.2490] as [number, number], [28.4100, 77.3100] as [number, number]],
    status: "clear",
    assets: 22,
    healthScore: 78,
  },
  {
    id: "SEC-004",
    name: "Faridabad → Mathura Junction",
    coords: [[28.4100, 77.3100] as [number, number], [27.4924, 77.6737] as [number, number]],
    status: "block",
    assets: 45,
    healthScore: 65,
    block: { id: "BLK-0849", dept: "OHE/Electrical", time: "23:00–02:00", urgency: "high" },
  },
  {
    id: "SEC-005",
    name: "Mathura Jn → Agra Cantt",
    coords: [[27.4924, 77.6737] as [number, number], [27.1833, 78.0228] as [number, number]],
    status: "warning",
    assets: 30,
    healthScore: 58,
    block: { id: "BLK-0848", dept: "S&T", time: "01:30–04:30", urgency: "medium" },
  },
  {
    id: "SEC-006",
    name: "Agra Cantt → Agra Fort",
    coords: [[27.1833, 78.0228] as [number, number], [27.1800, 78.0180] as [number, number]],
    status: "clear",
    assets: 8,
    healthScore: 95,
  },
];

/* Simulated train positions */
const trainPositions = [
  { id: "12951 Mumbai Rajdhani", lat: 28.5000, lng: 77.2800, heading: "south", speed: 130 },
  { id: "12002 Bhopal Shatabdi", lat: 28.3000, lng: 77.3500, heading: "south", speed: 145 },
  { id: "12260 Swarna Jayanti", lat: 27.6500, lng: 77.9000, heading: "south", speed: 110 },
  { id: "12050 Gatimaan Express", lat: 27.9000, lng: 77.7500, heading: "north", speed: 160 },
];

const sectionColors: Record<string, string> = {
  clear: "oklch(0.70 0.16 160)",
  block: "oklch(0.65 0.22 25)",
  warning: "oklch(0.75 0.15 55)",
};

export default function RailwayMapView() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showBlocks, setShowBlocks] = useState(true);
  const [showAssets, setShowAssets] = useState(true);

  const center: [number, number] = [28.0, 77.6];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Filters:</span>
        </div>
        <button
          onClick={() => setShowTrains(!showTrains)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
            showTrains ? "bg-primary/15 text-primary border-primary/30" : "bg-card text-muted-foreground border-border/50"
          }`}
        >
          <Train className="w-4 h-4" /> Trains
        </button>
        <button
          onClick={() => setShowBlocks(!showBlocks)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
            showBlocks ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-card text-muted-foreground border-border/50"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Blocks
        </button>
        <button
          onClick={() => setShowAssets(!showAssets)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
            showAssets ? "bg-chart-3/15 text-chart-3 border-chart-3/30" : "bg-card text-muted-foreground border-border/50"
          }`}
        >
          <Layers className="w-4 h-4" /> Assets
        </button>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-card" style={{ height: "550px" }}>
        <MapContainer center={center} zoom={8} className="w-full h-full" zoomControl={true}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Railway sections */}
          {railwaySections.map((section) => (
            <Polyline
              key={section.id}
              positions={section.coords}
              pathOptions={{
                color: sectionColors[section.status],
                weight: selectedSection === section.id ? 8 : 5,
                opacity: selectedSection === section.id ? 1 : 0.7,
                dashArray: section.status === "block" ? "10 8" : undefined,
              }}
              eventHandlers={{
                click: () => setSelectedSection(selectedSection === section.id ? null : section.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} className="!bg-card !border-border/50 !text-foreground !rounded-xl !shadow-lg">
                <div className="text-sm font-semibold">{section.name}</div>
                <div className="text-xs text-muted-foreground">Assets: {section.assets} | Health: {section.healthScore}%</div>
                {section.block && (
                  <div className="text-xs text-destructive mt-1 font-medium">
                    {section.block.id} — {section.block.dept}
                  </div>
                )}
              </Tooltip>
            </Polyline>
          ))}

          {/* Section health dots */}
          {showAssets &&
            railwaySections.map((section) => {
              const midIdx = Math.floor(section.coords.length / 2);
              const mid = section.coords[midIdx] || section.coords[0];
              return (
                <CircleMarker
                  key={`asset-${section.id}`}
                  center={mid}
                  radius={6}
                  fillColor={section.healthScore > 80 ? "oklch(0.70 0.16 160)" : section.healthScore > 60 ? "oklch(0.75 0.15 55)" : "oklch(0.65 0.22 25)"}
                  fillOpacity={0.8}
                  color="oklch(0.10 0.025 250)"
                  weight={2}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Asset Health</strong><br />
                      Score: {section.healthScore}/100<br />
                      {section.healthScore < 60 && "⚠️ Below threshold"}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Block markers */}
          {showBlocks &&
            railwaySections
              .filter((s) => s.block)
              .map((section) => {
                const midIdx = Math.floor(section.coords.length / 2);
                const mid = section.coords[midIdx] || section.coords[0];
                return (
                  <CircleMarker
                    key={`block-${section.id}`}
                    center={mid}
                    radius={12}
                    fillColor="oklch(0.65 0.22 25)"
                    fillOpacity={0.25}
                    color="oklch(0.65 0.22 25)"
                    weight={2}
                  />
                );
              })}

          {/* Train positions */}
          {showTrains &&
            trainPositions.map((train, i) => (
              <CircleMarker
                key={`train-${i}`}
                center={[train.lat, train.lng]}
                radius={5}
                fillColor="oklch(0.65 0.18 250)"
                fillOpacity={1}
                color="oklch(0.65 0.18 250)"
                weight={2}
              >
                <Tooltip direction="top" offset={[0, -8]} className="!bg-card !border-border/50 !text-foreground !rounded-xl !shadow-lg">
                  <div className="text-sm font-semibold">{train.id}</div>
                  <div className="text-xs text-muted-foreground">{train.speed} km/h</div>
                </Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>

      {/* Section details panel */}
      {selectedSection && (() => {
        const section = railwaySections.find((s) => s.id === selectedSection);
        if (!section) return null;
        return (
          <div className="rounded-2xl p-5 border border-border/50 bg-card animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{section.name}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  section.status === "clear"
                    ? "bg-chart-3/15 text-chart-3"
                    : section.status === "block"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-chart-4/15 text-chart-4"
                }`}
              >
                {section.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Section ID</div>
                <div className="font-mono font-medium">{section.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Assets</div>
                <div className="font-medium">{section.assets}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Health Score</div>
                <div className={`font-bold ${section.healthScore > 80 ? "text-chart-3" : section.healthScore > 60 ? "text-chart-4" : "text-destructive"}`}>
                  {section.healthScore}/100
                </div>
              </div>
            </div>
            {section.block && (
              <div className="mt-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="text-sm font-semibold text-destructive">
                  {section.block.id} — {section.block.dept}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Window: {section.block.time} | Urgency: {section.block.urgency}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
