import { useState } from "react";
import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Clock,
  Wrench,
  Search,
  Filter,
  ChevronRight,
  Activity,
} from "lucide-react";

const assets = [
  {
    id: "AST-001",
    name: "Track Segment KM 0-8",
    section: "Delhi Jn → New Delhi",
    type: "Track",
    healthScore: 92,
    lastInspection: "2026-08-20",
    inspectionSource: "TRC",
    criticality: "medium",
    nextMaintenance: "2026-09-15",
    defects: [],
    trend: "stable",
    maintenanceHistory: [
      { date: "2026-07-10", type: "Tamping", status: "completed" },
      { date: "2026-06-15", type: "Rail Replacement", status: "completed" },
    ],
  },
  {
    id: "AST-002",
    name: "Track Segment KM 120-145",
    section: "Faridabad → Mathura Jn",
    type: "Track",
    healthScore: 62,
    lastInspection: "2026-08-18",
    inspectionSource: "TRC",
    criticality: "high",
    nextMaintenance: "2026-09-01",
    defects: ["Rail wear approaching threshold", "Lateral displacement 4.2mm"],
    trend: "declining",
    maintenanceHistory: [
      { date: "2026-06-01", type: "Ballast Cleaning", status: "completed" },
      { date: "2026-05-15", type: "USFD Inspection", status: "defects found" },
    ],
  },
  {
    id: "AST-003",
    name: "Signal LM-245",
    section: "Nizamuddin → Faridabad",
    type: "Signal",
    healthScore: 78,
    lastInspection: "2026-08-22",
    inspectionSource: "Manual",
    criticality: "medium",
    nextMaintenance: "2026-09-20",
    defects: ["Ageing relay — replacement recommended"],
    trend: "declining",
    maintenanceHistory: [
      { date: "2026-08-01", type: "Routine Check", status: "completed" },
    ],
  },
  {
    id: "AST-004",
    name: "OHE Span KM 145-160",
    section: "Mathura → Agra",
    type: "OHE",
    healthScore: 85,
    lastInspection: "2026-08-25",
    inspectionSource: "OMS",
    criticality: "low",
    nextMaintenance: "2026-10-10",
    defects: [],
    trend: "stable",
    maintenanceHistory: [],
  },
  {
    id: "AST-005",
    name: "Bridge B-12 (Chambal Bridge)",
    section: "Mathura → Agra",
    type: "Bridge",
    healthScore: 55,
    lastInspection: "2026-08-10",
    inspectionSource: "Manual",
    criticality: "critical",
    nextMaintenance: "2026-09-05",
    defects: ["Pier deterioration detected", "Bearing alignment issue", "Crack width 0.3mm > 0.25mm limit"],
    trend: "declining",
    maintenanceHistory: [
      { date: "2026-07-20", type: "Bridge Inspection", status: "defects found" },
      { date: "2026-06-01", type: "Load Assessment", status: "completed" },
    ],
  },
  {
    id: "AST-006",
    name: "Level Crossing LC-89",
    section: "Agra → Agra Fort",
    type: "Signal",
    healthScore: 91,
    lastInspection: "2026-08-24",
    inspectionSource: "Manual",
    criticality: "low",
    nextMaintenance: "2026-11-01",
    defects: [],
    trend: "stable",
    maintenanceHistory: [],
  },
];

const healthColor = (score: number) => {
  if (score > 80) return { bg: "bg-chart-3/15", text: "text-chart-3", border: "border-chart-3/30" };
  if (score > 60) return { bg: "bg-chart-4/15", text: "text-chart-4", border: "border-chart-4/30" };
  return { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" };
};

const criticalityColors: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

export default function AssetHealthView() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = assets.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.section.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const criticalCount = assets.filter((a) => a.criticality === "critical" || a.healthScore < 60).length;
  const warningCount = assets.filter((a) => a.healthScore >= 60 && a.healthScore < 80).length;
  const healthyCount = assets.filter((a) => a.healthScore >= 80).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: assets.length.toString(), icon: Heart, color: "bg-primary/10 text-primary" },
          { label: "Critical / Below 60", value: criticalCount.toString(), icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
          { label: "Warning (60-80)", value: warningCount.toString(), icon: TrendingDown, color: "bg-chart-4/10 text-chart-4" },
          { label: "Healthy (>80)", value: healthyCount.toString(), icon: CheckCircle2, color: "bg-chart-3/10 text-chart-3" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 border border-border/50 bg-card">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        {["all", "Track", "Signal", "OHE", "Bridge"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filterType === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
            }`}
          >
            {t === "all" ? "All Types" : t}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Asset</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Health Score</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Criticality</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Last Inspection</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Trend</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => {
                const hc = healthColor(asset.healthScore);
                return (
                  <tr
                    key={asset.id}
                    className={`border-b border-border/20 hover:bg-primary/5 transition-colors cursor-pointer ${
                      selectedAsset === asset.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="text-sm font-semibold">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.section}</div>
                    </td>
                    <td className="px-6 py-3 text-sm">{asset.type}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-primary/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              asset.healthScore > 80 ? "bg-chart-3" : asset.healthScore > 60 ? "bg-chart-4" : "bg-destructive"
                            }`}
                            style={{ width: `${asset.healthScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${hc.text}`}>{asset.healthScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${criticalityColors[asset.criticality]}`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{asset.lastInspection}</td>
                    <td className="px-6 py-3">
                      {asset.trend === "declining" ? (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-chart-3" />
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{asset.nextMaintenance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selectedAsset && (() => {
        const asset = assets.find((a) => a.id === selectedAsset);
        if (!asset) return null;
        const hc = healthColor(asset.healthScore);
        return (
          <div className="rounded-2xl p-6 border border-border/50 bg-card animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 rounded-2xl ${hc.bg} flex items-center justify-center`}>
                <Heart className={`w-7 h-7 ${hc.text}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{asset.name}</h3>
                <p className="text-sm text-muted-foreground">{asset.section} | ID: {asset.id}</p>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-3xl font-bold ${hc.text}`}>{asset.healthScore}/100</div>
                <div className="text-xs text-muted-foreground">Health Score</div>
              </div>
            </div>

            {/* Defects */}
            {asset.defects.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Active Defects
                </h4>
                <ul className="space-y-1">
                  {asset.defects.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Maintenance history */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Maintenance History</h4>
              {asset.maintenanceHistory.length > 0 ? (
                <div className="space-y-2">
                  {asset.maintenanceHistory.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                      <Wrench className="w-4 h-4 text-primary shrink-0" />
                      <div className="text-sm">{m.type}</div>
                      <div className="text-xs text-muted-foreground ml-auto">{m.date}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        m.status === "completed" ? "bg-chart-3/15 text-chart-3" : "bg-chart-4/15 text-chart-4"
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance records</p>
              )}
            </div>

            {/* Predictive alert */}
            {asset.healthScore < 70 && (
              <div className="mt-4 p-4 rounded-xl bg-chart-4/5 border border-chart-4/20">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-chart-4" />
                  <span className="text-sm font-semibold text-chart-4">Predictive Maintenance Alert</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI model predicts this asset will reach critical threshold in approximately{' '}
                  <strong>{asset.criticality === "critical" ? "7 days" : "30 days"}</strong>.
                  Block planning recommended to schedule maintenance before failure.
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
