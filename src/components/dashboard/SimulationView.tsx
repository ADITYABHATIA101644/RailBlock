import { useState } from "react";
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Train,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingDown,
} from "lucide-react";

const timelineData = [
  { time: "23:00", blocks: [{ name: "BLK-0849 (OHE)", start: 0, end: 3, color: "oklch(0.65 0.18 250)", dept: "OHE" }], trains: [] },
  { time: "00:00", blocks: [{ name: "BLK-0849 (OHE)", start: 0, end: 3, color: "oklch(0.65 0.18 250)", dept: "OHE" }], trains: ["12951 Mumbai Rajdhani"] },
  { time: "01:00", blocks: [
    { name: "BLK-0849 (OHE)", start: 0, end: 3, color: "oklch(0.65 0.18 250)", dept: "OHE" },
  ], trains: ["12002 Bhopal Shatabdi"] },
  { time: "02:00", blocks: [
    { name: "BLK-0847 (P-Way)", start: 0, end: 3, color: "oklch(0.75 0.15 55)", dept: "P-Way" },
    { name: "BLK-0849 (OHE)", start: 0, end: 3, color: "oklch(0.65 0.18 250)", dept: "OHE" },
  ], trains: [] },
  { time: "03:00", blocks: [
    { name: "BLK-0847 (P-Way)", start: 0, end: 3, color: "oklch(0.75 0.15 55)", dept: "P-Way" },
    { name: "BLK-0848 (S&T)", start: 0, end: 3, color: "oklch(0.65 0.22 25)", dept: "S&T" },
  ], trains: [] },
  { time: "04:00", blocks: [
    { name: "BLK-0847 (P-Way)", start: 0, end: 3, color: "oklch(0.75 0.15 55)", dept: "P-Way" },
    { name: "BLK-0848 (S&T)", start: 0, end: 3, color: "oklch(0.65 0.22 25)", dept: "S&T" },
  ], trains: ["12050 Gatimaan Express"] },
  { time: "05:00", blocks: [], trains: ["12260 Swarna Jayanti"] },
  { time: "06:00", blocks: [], trains: ["12050 Gatimaan Express"] },
];

const scenarioMetrics = [
  { label: "Total Train Delays", before: "45 min", after: "12 min", improvement: "-73%", icon: Clock },
  { label: "Trains Affected", before: "6", after: "2", improvement: "-67%", icon: Train },
  { label: "Block Utilization", before: "65%", after: "91%", improvement: "+40%", icon: Activity },
  { label: "Safety Buffer", before: "8 min", after: "15 min", improvement: "+88%", icon: CheckCircle2 },
];

export default function SimulationView() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState("ai-optimized");

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimProgress(0);
    const interval = setInterval(() => {
      setSimProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  };

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Scenario:</span>
        {[
          { id: "ai-optimized", label: "AI Optimized" },
          { id: "manual", label: "Manual Plan" },
          { id: "emergency", label: "Emergency Override" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedScenario(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedScenario === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Simulation controls */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Block Timeline — 24hr View</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </button>
            <button
              onClick={() => { setSimProgress(0); setIsSimulating(false); }}
              className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center hover:bg-primary/5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {isSimulating && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Processing...</span>
              <span className="text-xs font-semibold text-primary">{simProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-100"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Gantt-style timeline */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Hour labels */}
            <div className="flex border-b border-border/30 pb-2 mb-3">
              <div className="w-36 shrink-0 text-xs font-semibold text-muted-foreground">Section</div>
              <div className="flex-1 grid grid-cols-8 gap-1">
                {["23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"].map((h) => (
                  <div key={h} className="text-center text-[10px] text-muted-foreground font-mono">{h}</div>
                ))}
              </div>
            </div>

            {/* Track rows */}
            {[
              { section: "Delhi → Nizamuddin", blocks: [1, 4], color: "oklch(0.75 0.15 55)" },
              { section: "Nizamuddin → Faridabad", blocks: [0, 1], color: "oklch(0.65 0.18 250)" },
              { section: "Faridabad → Mathura", blocks: [0, 1, 2, 3, 4], color: "oklch(0.65 0.22 25)" },
              { section: "Mathura → Agra Cantt", blocks: [2, 3], color: "oklch(0.65 0.22 25)" },
            ].map((row, ri) => (
              <div key={ri} className="flex items-center py-2 border-b border-border/20">
                <div className="w-36 shrink-0 text-xs font-medium px-2">{row.section}</div>
                <div className="flex-1 relative h-8">
                  {/* Background grid */}
                  <div className="absolute inset-0 grid grid-cols-8 gap-1">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="border-l border-border/20" />
                      ))}
                  </div>
                  {/* Blocks */}
                  {row.blocks.map((bi) => {
                    const block = timelineData[bi];
                    if (!block) return null;
                    const left = (bi / 8) * 100;
                    const width = (3 / 8) * 100;
                    return (
                      <div
                        key={`${ri}-${bi}`}
                        className="absolute top-1 bottom-1 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white/90 transition-all duration-500"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: row.color,
                          opacity: simProgress > 0 ? 0.3 + (simProgress / 100) * 0.7 : 0.6,
                        }}
                      >
                        {block.blocks[0]?.dept}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Train movements */}
            <div className="flex items-center py-2 mt-2 border-t border-border/30">
              <div className="w-36 shrink-0 text-xs font-medium px-2 text-muted-foreground">Train Movements</div>
              <div className="flex-1 relative h-6">
                {[
                  { pos: 1, label: "Rajdhani", color: "oklch(0.65 0.18 250)" },
                  { pos: 2, label: "Shatabdi", color: "oklch(0.65 0.18 250)" },
                  { pos: 4, label: "Gatimaan", color: "oklch(0.65 0.18 250)" },
                  { pos: 5, label: "Swarna J", color: "oklch(0.65 0.18 250)" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="absolute top-0.5 bottom-0.5 w-5 rounded-full flex items-center justify-center"
                    style={{
                      left: `${(t.pos / 8) * 100 + 2}%`,
                      background: t.color,
                    }}
                  >
                    <Train className="w-3 h-3 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario comparison */}
      <div className="rounded-2xl p-6 border border-border/50 bg-card">
        <h3 className="font-semibold text-lg mb-1">Impact Comparison</h3>
        <p className="text-sm text-muted-foreground mb-5">AI-optimized vs manual scheduling</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scenarioMetrics.map((metric, i) => (
            <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <metric.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground line-through">{metric.before}</span>
                <TrendingDown className="w-3 h-3 text-chart-3" />
                <span className="text-lg font-bold text-chart-3">{metric.after}</span>
              </div>
              <div className="text-xs text-chart-3 font-semibold mt-1">{metric.improvement}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monte Carlo uncertainty */}
      <div className="rounded-2xl p-6 border border-border/50 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-chart-4/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-chart-4" />
          </div>
          <div>
            <h3 className="font-semibold">Monte Carlo Risk Analysis</h3>
            <p className="text-xs text-muted-foreground">1000 simulated scenarios for this block window</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-chart-3/5 border border-chart-3/20">
            <div className="text-2xl font-bold text-chart-3">87%</div>
            <div className="text-xs text-muted-foreground">Probability of completion within window</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-chart-4/5 border border-chart-4/20">
            <div className="text-2xl font-bold text-chart-4">±15min</div>
            <div className="text-xs text-muted-foreground">Completion time variance (weather risk)</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">3%</div>
            <div className="text-xs text-muted-foreground">Probability of cascading delay risk</div>
          </div>
        </div>
      </div>
    </div>
  );
}
