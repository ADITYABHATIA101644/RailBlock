import { useState } from "react";
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User,
  FileText,
  Timer,
  Eye,
} from "lucide-react";

const pendingApprovals = [
  {
    id: "BLK-2024-0849",
    section: "Agra Cantt (KM 178-182)",
    dept: "OHE/Electrical",
    workType: "Power Block — OHE Replacement",
    requestedBy: "Er. Rajesh Kumar (SSE/OHE)",
    urgency: "high",
    slaDeadline: "2h 15m",
    slaProgress: 65,
    aiRecommended: true,
    aiScore: 91,
    submittedAt: "Today, 18:45",
    duration: "3 hours",
    window: "23:00 – 02:00",
  },
  {
    id: "BLK-2024-0850",
    section: "Delhi → Ghaziabad (KM 0-25)",
    dept: "P-Way Engineering",
    workType: "Ballast Cleaning & Tamping",
    requestedBy: "Er. Amit Singh (JE/P-Way)",
    urgency: "medium",
    slaDeadline: "5h 30m",
    slaProgress: 35,
    aiRecommended: true,
    aiScore: 84,
    submittedAt: "Today, 15:20",
    duration: "4 hours",
    window: "00:00 – 04:00",
  },
  {
    id: "BLK-2024-0851",
    section: "Ghaziabad → Meerut (KM 25-55)",
    dept: "Signal & Telecom",
    workType: "Signal Upgradation",
    requestedBy: "Er. Priya Verma (SSE/S&T)",
    urgency: "medium",
    slaDeadline: "8h 00m",
    slaProgress: 20,
    aiRecommended: false,
    aiScore: 72,
    submittedAt: "Today, 14:00",
    duration: "3 hours",
    window: "03:00 – 06:00",
  },
  {
    id: "BLK-2024-0852",
    section: "Mathura Jn → Bharatpur (KM 165-190)",
    dept: "P-Way Engineering",
    workType: "USFD Defect Rectification",
    requestedBy: "Er. Vikram Joshi (AE/P-Way)",
    urgency: "high",
    slaDeadline: "1h 45m",
    slaProgress: 82,
    aiRecommended: true,
    aiScore: 96,
    submittedAt: "Today, 19:15",
    duration: "2 hours",
    window: "22:00 – 00:00",
  },
];

const approvedHistory = [
  { id: "BLK-0847", section: "Delhi → Nizamuddin", approvedBy: "Sr. DOM", time: "Today, 16:30" },
  { id: "BLK-0843", section: "Agra → Mathura", approvedBy: "DOM", time: "Today, 10:00" },
];

const urgencyColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  low: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

export default function ApprovalInbox() {
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "urgent" | "ai-recommended">("all");

  const filtered = pendingApprovals.filter((a) => {
    if (filter === "urgent") return a.urgency === "high";
    if (filter === "ai-recommended") return a.aiRecommended;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending", value: "4", color: "text-chart-4", bg: "bg-chart-4/10" },
          { label: "Urgent", value: "2", color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Approved Today", value: "8", color: "text-chart-3", bg: "bg-chart-3/10" },
          { label: "Avg SLA", value: "3.2h", color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl p-4 border border-border/50 bg-card`}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <Shield className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {[
          { id: "all" as const, label: "All Pending" },
          { id: "urgent" as const, label: "Urgent" },
          { id: "ai-recommended" as const, label: "AI Recommended" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/15"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Approval list */}
      <div className="space-y-3">
        {filtered.map((approval) => (
          <div
            key={approval.id}
            className={`rounded-2xl border transition-all duration-300 ${
              approval.slaProgress > 70
                ? "border-destructive/40 bg-destructive/5"
                : "border-border/50 bg-card hover:border-primary/20"
            }`}
          >
            <div
              className="flex items-center gap-4 p-5 cursor-pointer"
              onClick={() =>
                setExpandedApproval(expandedApproval === approval.id ? null : approval.id)
              }
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  approval.slaProgress > 70 ? "bg-destructive/15" : "bg-primary/10"
                }`}
              >
                <Timer className={`w-5 h-5 ${approval.slaProgress > 70 ? "text-destructive" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-sm">{approval.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${urgencyColors[approval.urgency]}`}>
                    {approval.urgency}
                  </span>
                  {approval.aiRecommended && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">AI ✓</span>
                  )}
                </div>
                <div className="text-sm mt-0.5">{approval.section} — {approval.dept}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {approval.workType} | Window: {approval.window}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-lg font-bold ${approval.slaProgress > 70 ? "text-destructive" : ""}`}>
                  {approval.slaDeadline}
                </div>
                <div className="text-[10px] text-muted-foreground">SLA Remaining</div>
                <div className="w-20 h-1.5 rounded-full bg-primary/10 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      approval.slaProgress > 70 ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${approval.slaProgress}%` }}
                  />
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                  expandedApproval === approval.id ? "rotate-90" : ""
                }`}
              />
            </div>

            {expandedApproval === approval.id && (
              <div className="px-5 pb-5 border-t border-border/30 pt-4 space-y-4">
                {/* Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Requested By</div>
                    <div className="font-medium mt-0.5">{approval.requestedBy}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Submitted</div>
                    <div className="font-medium mt-0.5">{approval.submittedAt}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">AI Confidence</div>
                    <div className="font-bold text-primary mt-0.5">{approval.aiScore}%</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-all">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-all">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all">
                    <Eye className="w-4 h-4" /> View Full Details
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all">
                    <User className="w-4 h-4" /> Escalate
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recently approved */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <h3 className="font-semibold mb-3">Recently Approved</h3>
        <div className="space-y-2">
          {approvedHistory.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20">
              <CheckCircle2 className="w-5 h-5 text-chart-3 shrink-0" />
              <div className="text-sm">
                <span className="font-mono font-semibold">{item.id}</span>
                <span className="text-muted-foreground"> — {item.section}</span>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {item.approvedBy} | {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
