import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Shield,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User,
  Timer,
  Eye,
  Loader2,
  Ban,
  Clock,
} from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

const urgencyColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  low: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

export default function ApprovalInbox() {
  const allBlocks = useQuery(api.blocks.listBlockRequests, { limit: 100 });
  const approveBlock = useMutation(api.blocks.approveBlock);
  const rejectBlock = useMutation(api.blocks.rejectBlock);
  const escalateBlock = useMutation(api.blocks.escalateBlock);
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "urgent" | "ai-recommended">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const decidedBy =
    (typeof sessionStorage !== "undefined" &&
      (sessionStorage.getItem("railblock_user_name") ||
        (sessionStorage.getItem("railblock_role") === "admin" ? "DRM (Admin)" : "Sr. DOM (Approver)"))) ||
    "Sr. DOM (Approver)";

  // 8-hour SLA from request creation
  const slaInfo = (block: Doc<"blockRequests">) => {
    const slaMs = 8 * 60 * 60 * 1000;
    const elapsed = Math.max(0, Date.now() - block.createdAt);
    const remaining = Math.max(0, slaMs - elapsed);
    const progress = Math.min(100, Math.round((elapsed / slaMs) * 100));
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return { label: `${h}h ${String(m).padStart(2, "0")}m`, progress };
  };

  const pending = (allBlocks ?? []).filter((b) => b.status === "pending" || b.status === "escalated");
  const approvedHistory = (allBlocks ?? []).filter((b) => b.status === "approved" && b.decidedAt);
  const rejectedHistory = (allBlocks ?? []).filter((b) => b.status === "rejected");

  const pendingCount = pending.length;
  const urgentCount = pending.filter((a) => a.urgency === "high").length;
  const approvedTodayCount = approvedHistory.filter(
    (b) => (b.decidedAt ?? 0) > Date.now() - 24 * 60 * 60 * 1000,
  ).length;

  const filtered = pending.filter((a) => {
    if (filter === "urgent") return a.urgency === "high";
    if (filter === "ai-recommended") return a.aiRecommended === true;
    return true;
  });

  const runAction = async (
    block: Doc<"blockRequests">,
    action: "approve" | "reject" | "escalate",
    reason?: string,
  ) => {
    setBusyId(block.blockId);
    try {
      if (action === "approve") {
        await approveBlock({ blockId: block.blockId, decidedBy });
        toast.success(`Block ${block.blockId} approved`, {
          description: `${block.section} — ${block.dept}. Now visible to Field Crew.`,
        });
      } else if (action === "reject") {
        await rejectBlock({ blockId: block.blockId, decidedBy, reason });
        toast.error(`Block ${block.blockId} rejected`, {
          description: `${block.section} — ${block.requestedBy} will be notified.`,
        });
      } else {
        await escalateBlock({ blockId: block.blockId, decidedBy });
        toast.info(`Block ${block.blockId} escalated`, {
          description: `Escalated to DRM for ${block.section}.`,
        });
      }
      setExpandedApproval(null);
      setRejectId(null);
      setRejectReason("");
    } catch (err) {
      toast.error(`Could not ${action} block`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pendingCount.toString(), color: "text-chart-4" },
          { label: "Urgent", value: urgentCount.toString(), color: "text-destructive" },
          { label: "Approved (24h)", value: approvedTodayCount.toString(), color: "text-chart-3" },
          { label: "SLA Window", value: "8h", color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 border border-border/50 bg-card">
            <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2`}>
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
        {allBlocks === undefined ? (
          <div className="rounded-2xl p-8 border border-border/50 bg-card text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-8 border border-border/50 bg-card text-center">
            <CheckCircle2 className="w-10 h-10 text-chart-3 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No pending approvals. New requests from the Block Request form appear here instantly.
            </p>
          </div>
        ) : null}

        {filtered.map((approval) => {
          const sla = slaInfo(approval);
          const isBusy = busyId === approval.blockId;
          const isRejecting = rejectId === approval.blockId;
          return (
            <div
              key={approval.blockId}
              className={`rounded-2xl border transition-all duration-300 ${
                sla.progress > 70
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border/50 bg-card hover:border-primary/20"
              }`}
            >
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() =>
                  setExpandedApproval(expandedApproval === approval.blockId ? null : approval.blockId)
                }
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    sla.progress > 70 ? "bg-destructive/15" : "bg-primary/10"
                  }`}
                >
                  <Timer className={`w-5 h-5 ${sla.progress > 70 ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-sm">{approval.blockId}</span>
                    {approval.status === "escalated" && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-chart-4/15 text-chart-4 border border-chart-4/30">
                        ESCALATED
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${urgencyColors[approval.urgency] ?? ""}`}
                    >
                      {approval.urgency}
                    </span>
                    {approval.aiRecommended && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                        AI ✓
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-0.5">
                    {approval.section} — {approval.dept}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {approval.workType} | Window: {approval.window}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${sla.progress > 70 ? "text-destructive" : ""}`}>
                    {sla.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">SLA Remaining</div>
                  <div className="w-20 h-1.5 rounded-full bg-primary/10 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sla.progress > 70 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${sla.progress}%` }}
                    />
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                    expandedApproval === approval.blockId ? "rotate-90" : ""
                  }`}
                />
              </div>

              {expandedApproval === approval.blockId && (
                <div className="px-5 pb-5 border-t border-border/30 pt-4 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Requested By</div>
                      <div className="font-medium mt-0.5">{approval.requestedBy}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Submitted</div>
                      <div className="font-medium mt-0.5">{formatTime(approval.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">AI Confidence</div>
                      <div className="font-bold text-primary mt-0.5">
                        {approval.aiScore != null ? `${approval.aiScore}%` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Block Type</div>
                      <div className="font-medium mt-0.5 capitalize">{approval.blockType ?? "full"}</div>
                    </div>
                  </div>

                  {approval.aiRationale && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="text-[11px] font-semibold text-primary mb-1">AI RATIONALE</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{approval.aiRationale}</p>
                    </div>
                  )}

                  {approval.notes && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Requester notes:</span> {approval.notes}
                    </div>
                  )}

                  {/* Reject reason input */}
                  {isRejecting && (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isBusy) {
                            runAction(approval, "reject", rejectReason || "Traffic priority");
                          }
                          if (e.key === "Escape") setRejectId(null);
                        }}
                        placeholder="Reason for rejection (logged in audit trail)..."
                        className="flex-1 px-3 py-2 rounded-xl text-sm bg-background/60 border border-border/50 focus:outline-none focus:border-primary/40"
                      />
                      <button
                        onClick={() => runAction(approval, "reject", rejectReason || "Traffic priority")}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-xl bg-destructive text-white text-sm font-semibold disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(approval, "approve");
                      }}
                      disabled={isBusy}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRejectId(isRejecting ? null : approval.blockId);
                      }}
                      disabled={isBusy}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(
                          `${approval.blockId} — ${approval.workType}\nSection: ${approval.section}\nWindow: ${approval.window} (${approval.duration})\nRequested by: ${approval.requestedBy}${approval.aiRationale ? `\n\nAI: ${approval.aiRationale}` : ""}`,
                          { duration: 8000 },
                        );
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(approval, "escalate");
                      }}
                      disabled={isBusy}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <User className="w-4 h-4" /> Escalate to DRM
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision history */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-chart-3" /> Recently Approved
          </h3>
          <div className="space-y-2">
            {approvedHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No approvals yet.</p>
            ) : (
              approvedHistory.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-chart-3 shrink-0" />
                  <div className="text-sm min-w-0">
                    <span className="font-mono font-semibold">{item.blockId}</span>
                    <span className="text-muted-foreground"> — {item.section.split(" (")[0]}</span>
                  </div>
                  <div className="ml-auto text-[11px] text-muted-foreground shrink-0">
                    {item.decidedBy} · {item.decidedAt ? formatTime(item.decidedAt) : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <Ban className="w-4 h-4 text-destructive" /> Recently Rejected
          </h3>
          <div className="space-y-2">
            {rejectedHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No rejections yet.</p>
            ) : (
              rejectedHistory.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20"
                >
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <div className="text-sm min-w-0">
                    <span className="font-mono font-semibold">{item.blockId}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {item.rejectionReason || "No reason given"}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.decidedAt ? formatTime(item.decidedAt) : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
