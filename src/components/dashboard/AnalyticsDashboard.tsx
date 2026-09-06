import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

/* ===== DATA ===== */
const utilizationByDept = [
  { dept: "P-Way", current: 87, target: 90, blocks: 45 },
  { dept: "S&T", current: 78, target: 90, blocks: 28 },
  { dept: "OHE", current: 82, target: 90, blocks: 32 },
  { dept: "Safety", current: 91, target: 90, blocks: 12 },
  { dept: "Bridge", current: 74, target: 90, blocks: 8 },
];

const monthlyTrend = [
  { month: "Jan", blocks: 42, utilization: 62, delays: 340 },
  { month: "Feb", blocks: 48, utilization: 68, delays: 310 },
  { month: "Mar", blocks: 52, utilization: 74, delays: 280 },
  { month: "Apr", blocks: 55, utilization: 71, delays: 260 },
  { month: "May", blocks: 60, utilization: 78, delays: 220 },
  { month: "Jun", blocks: 58, utilization: 82, delays: 190 },
  { month: "Jul", blocks: 63, utilization: 85, delays: 165 },
  { month: "Aug", blocks: 67, utilization: 87, delays: 145 },
];

const assetHealthHeatmap = [
  { zone: "Delhi", health: 88 },
  { zone: "Agra", health: 72 },
  { zone: "Lucknow", health: 81 },
  { zone: "Jaipur", health: 68 },
  { zone: "Jhansi", health: 75 },
  { zone: "Ambala", health: 85 },
  { zone: "Firozpur", health: 79 },
];

const departmentPerformance = [
  { metric: "Block Utilization", PWay: 87, ST: 78, OHE: 82 },
  { metric: "On-Time Start", PWay: 92, ST: 85, OHE: 88 },
  { metric: "Work Completion", PWay: 95, ST: 88, OHE: 91 },
  { metric: "Safety Score", PWay: 98, ST: 97, OHE: 96 },
  { metric: "SLA Adherence", PWay: 85, ST: 79, OHE: 83 },
];

const predictiveDemand = [
  { month: "Sep", predicted: 72, lower: 65, upper: 80 },
  { month: "Oct", predicted: 68, lower: 60, upper: 76 },
  { month: "Nov", predicted: 55, lower: 48, upper: 62 },
  { month: "Dec", predicted: 50, lower: 42, upper: 58 },
  { month: "Jan", predicted: 62, lower: 54, upper: 70 },
  { month: "Feb", predicted: 58, lower: 50, upper: 66 },
];

const delayByType = [
  { type: "P-Way", delay: 45, color: "oklch(0.75 0.15 55)" },
  { type: "S&T", delay: 35, color: "oklch(0.65 0.18 250)" },
  { type: "OHE", delay: 28, color: "oklch(0.70 0.14 160)" },
  { type: "Weather", delay: 22, color: "oklch(0.65 0.22 25)" },
  { type: "Other", delay: 15, color: "oklch(0.50 0.10 280)" },
];

const pieColors = ["oklch(0.75 0.15 55)", "oklch(0.65 0.18 250)", "oklch(0.70 0.14 160)", "oklch(0.65 0.22 25)", "oklch(0.50 0.10 280)"];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Delhi Division — Analytics</h2>
          <p className="text-sm text-muted-foreground">August 2026 performance overview</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all">
            <Calendar className="w-4 h-4" /> Aug 2026
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Blocks Planned", value: "67", change: "+8%", up: true },
          { label: "Utilization", value: "87%", change: "+2%", up: true },
          { label: "Delays", value: "145min", change: "-12%", up: false },
          { label: "Conflicts", value: "2", change: "-60%", up: false },
          { label: "Planner Productivity", value: "8.2", change: "+15%", up: true },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl p-4 border border-border/50 bg-card text-center">
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
            <div className={`text-xs font-semibold mt-1 ${kpi.up ? "text-chart-3" : "text-chart-3"}`}>
              {kpi.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Department */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold mb-1">Block Utilization by Department</h3>
          <p className="text-xs text-muted-foreground mb-4">Current vs target utilization rate</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={utilizationByDept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 12, fill: "oklch(0.6 0 0)" }} width={60} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="current" fill="oklch(0.75 0.15 55)" radius={[0, 6, 6, 0]} name="Current %" />
              <Bar dataKey="target" fill="oklch(0.30 0.03 250)" radius={[0, 6, 6, 0]} opacity={0.3} name="Target %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold mb-1">Monthly Performance Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Blocks planned, utilization, and delay reduction</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="utilization" stroke="oklch(0.75 0.15 55)" strokeWidth={2} dot={{ r: 3 }} name="Utilization %" />
              <Line yAxisId="right" type="monotone" dataKey="delays" stroke="oklch(0.65 0.22 25)" strokeWidth={2} dot={{ r: 3 }} name="Delay (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delay Attribution Pie */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold mb-1">Delay Attribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Root causes of remaining delays</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={delayByType} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="delay" paddingAngle={3}>
                {delayByType.map((_, i) => (
                  <Cell key={i} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {delayByType.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.type}</span>
                <span className="font-semibold ml-auto">{d.delay} min</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Radar */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold mb-1">Department Radar</h3>
          <p className="text-xs text-muted-foreground mb-4">Multi-metric performance comparison</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={departmentPerformance}>
              <PolarGrid stroke="oklch(0.25 0.03 250)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
              <Radar name="P-Way" dataKey="PWay" stroke="oklch(0.75 0.15 55)" fill="oklch(0.75 0.15 55)" fillOpacity={0.15} />
              <Radar name="S&T" dataKey="ST" stroke="oklch(0.65 0.18 250)" fill="oklch(0.65 0.18 250)" fillOpacity={0.15} />
              <Radar name="OHE" dataKey="OHE" stroke="oklch(0.70 0.14 160)" fill="oklch(0.70 0.14 160)" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {[{ label: "P-Way", color: "oklch(0.75 0.15 55)" }, { label: "S&T", color: "oklch(0.65 0.18 250)" }, { label: "OHE", color: "oklch(0.70 0.14 160)" }].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Demand */}
        <div className="rounded-2xl p-6 border border-border/50 bg-card">
          <h3 className="font-semibold mb-1">Predictive Block Demand</h3>
          <p className="text-xs text-muted-foreground mb-4">ML-forecasted maintenance demand next 6 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={predictiveDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 250)",
                  border: "1px solid oklch(0.30 0.03 250)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0 0)",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="upper" stroke="none" fill="oklch(0.65 0.18 250)" fillOpacity={0.1} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="oklch(0.65 0.18 250)" fillOpacity={0.1} />
              <Line type="monotone" dataKey="predicted" stroke="oklch(0.65 0.18 250)" strokeWidth={2} dot={{ r: 3 }} name="Predicted Blocks" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-xs text-center text-muted-foreground mt-2">
            Confidence interval shown (±1σ)
          </div>
        </div>
      </div>

      {/* Asset Health Heatmap */}
      <div className="rounded-2xl p-6 border border-border/50 bg-card">
        <h3 className="font-semibold mb-1">Asset Health by Zone</h3>
        <p className="text-xs text-muted-foreground mb-4">Health score distribution across zones</p>
        <div className="grid grid-cols-7 gap-3">
          {assetHealthHeatmap.map((zone, i) => (
            <div key={i} className="text-center">
              <div
                className="w-full aspect-square rounded-2xl flex items-center justify-center text-lg font-bold mb-2 transition-all hover:scale-105"
                style={{
                  background:
                    zone.health > 80
                      ? "oklch(0.70 0.16 160 / 0.2)"
                      : zone.health > 70
                      ? "oklch(0.75 0.15 55 / 0.2)"
                      : "oklch(0.65 0.22 25 / 0.2)",
                  color:
                    zone.health > 80
                      ? "oklch(0.70 0.16 160)"
                      : zone.health > 70
                      ? "oklch(0.75 0.15 55)"
                      : "oklch(0.65 0.22 25)",
                }}
              >
                {zone.health}
              </div>
              <div className="text-xs font-medium">{zone.zone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
