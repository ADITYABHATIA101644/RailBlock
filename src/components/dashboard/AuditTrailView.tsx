import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Fingerprint,
  Play,
} from "lucide-react";

const actionConfig: Record<string, { icon: typeof Shield; label: string; color: string }> = {
  "auth.login": { icon: LogIn, label: "Login", color: "text-chart-3" },
  "auth.logout": { icon: LogOut, label: "Logout", color: "text-muted-foreground" },
  "auth.signup": { icon: UserPlus, label: "Sign Up", color: "text-primary" },
  "auth.login_failed": { icon: ShieldAlert, label: "Failed Login", color: "text-destructive" },
  "blocks.create": { icon: ScrollText, label: "Block Created", color: "text-primary" },
  "blocks.approve": { icon: CheckCircle2, label: "Block Approved", color: "text-chart-3" },
  "blocks.reject": { icon: XCircle, label: "Block Rejected", color: "text-destructive" },
  "blocks.escalate": { icon: Shield, label: "Block Escalated", color: "text-chart-4" },
  "blocks.start": { icon: Play, label: "Block Started", color: "text-chart-4" },
  "blocks.complete": { icon: CheckCircle2, label: "Block Completed", color: "text-chart-3" },
  "blocks.cancel": { icon: XCircle, label: "Block Cancelled", color: "text-destructive" },
};

const filters = [
  { id: "all", label: "All Events" },
  { id: "auth.", label: "Authentication" },
  { id: "blocks.", label: "Block Workflow" },
  { id: "failed", label: "Failures" },
] as const;

export default function AuditTrailView() {
  const logs = useQuery(api.security.getAuditLogs, { limit: 200 });
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      if (filter === "auth.") return log.action.startsWith("auth.");
      if (filter === "blocks.") return log.action.startsWith("blocks.");
      if (filter === "failed") return !log.success;
      return true;
    }).filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        (log.resource ?? "").toLowerCase().includes(q) ||
        (log.details ?? "").toLowerCase().includes(q)
      );
    });
  }, [logs, filter, search]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Events",
            value: logs?.length ?? 0,
            icon: ScrollText,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Auth Events",
            value: logs?.filter((l) => l.action.startsWith("auth.")).length ?? 0,
            icon: Fingerprint,
            color: "text-chart-4",
            bg: "bg-chart-4/10",
          },
          {
            label: "Block Actions",
            value: logs?.filter((l) => l.action.startsWith("blocks.")).length ?? 0,
            icon: Shield,
            color: "text-chart-3",
            bg: "bg-chart-3/10",
          },
          {
            label: "Failures",
            value: logs?.filter((l) => !l.success).length ?? 0,
            icon: ShieldAlert,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-4 border border-border/50 bg-card">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search action, resource, details..."
          className="ml-auto px-4 py-2 rounded-xl text-sm bg-card border border-border/50 w-64 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-chart-3" />
          <h3 className="font-semibold text-sm">Immutable Audit Trail</h3>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} — stored in Convex
          </span>
        </div>

        {logs === undefined ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ScrollText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No events match this filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              Log in, submit a block, or approve one — every action lands here instantly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/20 max-h-[560px] overflow-y-auto">
            {filtered.map((log) => {
              const cfg = actionConfig[log.action] ?? {
                icon: ScrollText,
                label: log.action,
                color: "text-muted-foreground",
              };
              const Icon = cfg.icon;
              const isExpanded = expanded === log._id;
              return (
                <div key={log._id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : log._id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{cfg.label}</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {log.action}
                        </span>
                        {log.resource && (
                          <span className="font-mono text-[11px] text-muted-foreground">{log.resource}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {log.userId} · {formatTime(log.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {log.success ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-chart-3">
                          <ShieldCheck className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <ShieldAlert className="w-3.5 h-3.5" /> FAIL
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4">
                      <pre className="text-[11px] leading-relaxed bg-background/60 border border-border/40 rounded-xl p-3 overflow-x-auto font-mono text-muted-foreground">
                        {log.details ?? "No additional details"}
                        {log.ip ? `\nip: ${log.ip}` : ""}
                        {log.userAgent ? `\nuser-agent: ${log.userAgent}` : ""}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
