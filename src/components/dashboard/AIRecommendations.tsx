import { useState } from "react";
import { toast } from "sonner";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  GitBranch,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Recommendation {
  id: number;
  rank: number;
  section: string;
  workType: string;
  window: string;
  duration: string;
  confidence: number;
  score: number;
  trafficDensity: number;
  conflictRisk: string;
  rationale: string;
  pros: string[];
  cons: string[];
  status: "active" | "approved" | "rejected";
}

interface Conflict {
  id: string;
  block1: string;
  block2: string;
  type: string;
  severity: string;
  resolution: string;
  status: "active" | "resolved";
}

const initialRecommendations: Recommendation[] = [
  {
    id: 1, rank: 1,
    section: "Faridabad → Mathura Jn (KM 42-120)",
    workType: "Track Renewal (Rails)",
    window: "02:00 – 04:45", duration: "2h 45m",
    confidence: 94, score: 87, trafficDensity: 0.3, conflictRisk: "none",
    rationale: "Asset health score dropped to 62/100 (rail wear threshold), lowest traffic density window (avg 0.3 trains/hr vs 6/hr daytime), no conflicting S&T block scheduled, estimated completion 2h45m based on 12 similar past jobs. Crew availability confirmed for night shift.",
    pros: ["Lowest traffic density", "High confidence estimate", "No conflicts"],
    cons: ["Limited crew backup at this hour"],
    status: "active",
  },
  {
    id: 2, rank: 2,
    section: "Faridabad → Mathura Jn (KM 42-120)",
    workType: "Track Renewal (Rails)",
    window: "23:00 – 02:00", duration: "3h 00m",
    confidence: 82, score: 74, trafficDensity: 0.6, conflictRisk: "low",
    rationale: "Earlier window provides more buffer but higher traffic density (0.6 trains/hr). Estimated completion 3h based on reduced crew availability at this time. May conflict with OHE maintenance schedule in adjacent section.",
    pros: ["More time buffer", "Earlier completion"],
    cons: ["Higher traffic density", "OHE schedule nearby"],
    status: "active",
  },
  {
    id: 3, rank: 3,
    section: "Faridabad → Mathura Jn (KM 42-120)",
    workType: "Track Renewal (Rails)",
    window: "05:00 – 08:00", duration: "3h 00m",
    confidence: 71, score: 58, trafficDensity: 3.2, conflictRisk: "medium",
    rationale: "Morning window has rising traffic (3.2 trains/hr). Would cause 3 train detentions estimated at 15min each. Not recommended unless urgent. Use only as fallback.",
    pros: ["Daylight working conditions", "Full crew available"],
    cons: ["High traffic density", "3 train detentions expected"],
    status: "active",
  },
];

const initialConflicts: Conflict[] = [
  {
    id: "CF-001",
    block1: "BLK-0847 (P-Way, Delhi-Nizamuddin)",
    block2: "BLK-0849 (OHE, Nizamuddin-Faridabad)",
    type: "Corridor Overlap",
    severity: "high",
    resolution: "AI suggests combining into joint block 02:00–05:00, saving 1hr of separate setup time and reducing total traffic impact by 35%.",
    status: "active",
  },
  {
    id: "CF-002",
    block1: "BLK-0851 (S&T, Ghaziabad-Meerut)",
    block2: "BLK-0849 (OHE, Nizamuddin-Faridabad)",
    type: "Resource Conflict",
    severity: "medium",
    resolution: "Stagger start times by 30 min. S&T block starts at 03:00, OHE block at 02:30. Both complete before 06:00.",
    status: "active",
  },
];

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [expandedRec, setExpandedRec] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<"recommendations" | "conflicts">("recommendations");

  const handleApprove = (rec: Recommendation) => {
    setRecommendations((prev) => prev.map((r) => r.id === rec.id ? { ...r, status: "approved" as const } : r));
    setExpandedRec(null);
    toast.success(`Block option approved!`, {
      description: `${rec.section} — ${rec.window}. Field crew notified.`,
    });
  };

  const handleReject = (rec: Recommendation) => {
    setRecommendations((prev) => prev.map((r) => r.id === rec.id ? { ...r, status: "rejected" as const } : r));
    setExpandedRec(null);
    toast.error(`Block option rejected`, {
      description: `${rec.section} — ${rec.window} will not be scheduled.`,
    });
  };

  const handleResolveConflict = (conflict: Conflict) => {
    setConflicts((prev) => prev.map((c) => c.id === conflict.id ? { ...c, status: "resolved" as const } : c));
    toast.success(`Conflict ${conflict.id} resolved`, {
      description: conflict.resolution.slice(0, 80) + "...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("recommendations")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "recommendations" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/15"}`}>
          <Brain className="w-4 h-4" /> AI Recommendations
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{recommendations.filter((r) => r.status === "active").length}</span>
        </button>
        <button onClick={() => setActiveTab("conflicts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "conflicts" ? "bg-destructive text-white" : "bg-destructive/10 text-destructive hover:bg-destructive/15"}`}>
          <GitBranch className="w-4 h-4" /> Conflicts
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{conflicts.filter((c) => c.status === "active").length}</span>
        </button>
      </div>

      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {/* Request context */}
          <div className="rounded-2xl p-5 border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Brain className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">AI Analysis for BLK-0849</h3>
                <p className="text-xs text-muted-foreground">Track Renewal — Faridabad → Mathura (KM 42-120) — Urgency: High</p>
              </div>
              <div className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                <Sparkles className="w-3 h-3" /> AI Generated
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Options", value: "3", icon: TrendingUp },
                { label: "Conflicts", value: "1", icon: AlertTriangle },
                { label: "Savings", value: "35%", icon: Zap },
                { label: "Processing", value: "4.2s", icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <div><div className="text-xs text-muted-foreground">{item.label}</div><div className="text-sm font-bold">{item.value}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked recommendations */}
          {recommendations.map((rec) => (
            <div key={rec.id}
              className={`rounded-2xl border transition-all duration-300 ${
                rec.status === "approved" ? "border-chart-3/40 bg-chart-3/5" :
                rec.status === "rejected" ? "border-destructive/30 bg-destructive/5 opacity-60" :
                rec.rank === 1 ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card hover:border-primary/20"
              }`}>
              <div className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  rec.status === "approved" ? "bg-chart-3 text-white" :
                  rec.status === "rejected" ? "bg-destructive/20 text-destructive" :
                  rec.rank === 1 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {rec.status === "approved" ? <CheckCircle2 className="w-5 h-5" /> :
                   rec.status === "rejected" ? <XCircle className="w-5 h-5" /> : rec.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{rec.window}</span>
                    <span className="text-sm text-muted-foreground">| {rec.duration}</span>
                    {rec.status === "approved" && <span className="px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">✓ Approved</span>}
                    {rec.status === "rejected" && <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">✗ Rejected</span>}
                    {rec.rank === 1 && rec.status === "active" && <span className="px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">Recommended</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{rec.section}</div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{rec.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{rec.score}</div>
                    <div className="text-[10px] text-muted-foreground">Score</div>
                  </div>
                  {expandedRec === rec.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              {expandedRec === rec.id && (
                <div className="px-5 pb-5 border-t border-border/30 pt-4 space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-primary">Explainability Rationale</span></div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-chart-3/5 border border-chart-3/20">
                      <h4 className="text-sm font-semibold text-chart-3 mb-2">Advantages</h4>
                      <ul className="space-y-1">{rec.pros.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-chart-3 shrink-0" />{p}</li>
                      ))}</ul>
                    </div>
                    <div className="p-4 rounded-xl bg-chart-4/5 border border-chart-4/20">
                      <h4 className="text-sm font-semibold text-chart-4 mb-2">Considerations</h4>
                      <ul className="space-y-1">{rec.cons.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="w-3 h-3 text-chart-4 shrink-0" />{c}</li>
                      ))}</ul>
                    </div>
                  </div>
                  {rec.status === "active" && (
                    <div className="flex gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(rec); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-all active:scale-95">
                        <CheckCircle2 className="w-4 h-4" /> Approve This Option
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleReject(rec); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-all active:scale-95">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.info("Modification request submitted — AI will regenerate options."); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all active:scale-95">
                        Request Modification
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "conflicts" && (
        <div className="space-y-4">
          {conflicts.length === 0 && (
            <div className="rounded-2xl p-8 border border-border/50 bg-card text-center">
              <CheckCircle2 className="w-10 h-10 text-chart-3 mx-auto mb-3" />
              <p className="text-sm font-medium">No active conflicts</p>
              <p className="text-xs text-muted-foreground mt-1">All block requests are clear.</p>
            </div>
          )}
          {conflicts.map((conflict) => (
            <div key={conflict.id}
              className={`rounded-2xl p-5 border transition-all ${conflict.status === "resolved" ? "border-chart-3/30 bg-chart-3/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conflict.status === "resolved" ? "bg-chart-3/15" : "bg-destructive/15"}`}>
                  {conflict.status === "resolved" ? <CheckCircle2 className="w-5 h-5 text-chart-3" /> : <GitBranch className="w-5 h-5 text-destructive" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{conflict.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${conflict.status === "resolved" ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive"}`}>
                      {conflict.status === "resolved" ? "Resolved" : "Active"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${conflict.severity === "high" ? "bg-destructive/15 text-destructive" : "bg-chart-4/15 text-chart-4"}`}>
                      {conflict.severity}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{conflict.type}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-background/30 text-sm"><span className="text-muted-foreground">Block A:</span> <span className="font-medium">{conflict.block1}</span></div>
                <div className="p-3 rounded-xl bg-background/30 text-sm"><span className="text-muted-foreground">Block B:</span> <span className="font-medium">{conflict.block2}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-background/20">
                <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-primary">AI Resolution</span></div>
                <p className="text-sm text-muted-foreground leading-relaxed">{conflict.resolution}</p>
              </div>
              {conflict.status === "active" && (
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleResolveConflict(conflict)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-all active:scale-95">
                    <CheckCircle2 className="w-4 h-4" /> Accept Resolution
                  </button>
                  <button onClick={() => { toast.info("Manual override requested — escalated to Sr. DOM."); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all active:scale-95">
                    Manual Override
                  </button>
                </div>
              )}
              {conflict.status === "resolved" && (
                <div className="mt-3 flex items-center gap-2 text-sm text-chart-3 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Resolution applied successfully
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
