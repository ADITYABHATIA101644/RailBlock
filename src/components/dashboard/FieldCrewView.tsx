import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Smartphone,
  MapPin,
  CheckCircle2,
  Play,
  Square,
  Loader2,
  ClipboardCheck,
  Radio,
  AlertTriangle,
  Signal,
} from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  done: boolean;
}

const baseChecklist: ChecklistItem[] = [
  { id: "pwt", label: "Pre-work safety briefing given to all gang members", required: true, done: false },
  { id: "tpt", label: "Track possession confirmed with Section Controller", required: true, done: false },
  { id: "sp", label: "Safety precaution / protection laid (flags, detonators)", required: true, done: false },
  { id: "mat", label: "Materials & tools at site", required: false, done: false },
  { id: "qc", label: "Post-work quality check completed", required: false, done: false },
];

export default function FieldCrewView() {
  const approved = useQuery(api.blocks.listBlockRequests, { status: "approved", limit: 20 });
  const inProgress = useQuery(api.blocks.listBlockRequests, { status: "in_progress", limit: 5 });
  const startBlock = useMutation(api.blocks.startBlock);
  const completeBlock = useMutation(api.blocks.completeBlock);

  const [activeBlock, setActiveBlock] = useState<Doc<"blockRequests"> | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(baseChecklist);
  const [workPct, setWorkPct] = useState(100);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [geoStatus, setGeoStatus] = useState<"outside" | "inside" | "unknown">("unknown");
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  // Pick the first in-progress block as the active one
  useEffect(() => {
    if (!activeBlock && inProgress && inProgress.length > 0) {
      setActiveBlock(inProgress[0]);
    }
  }, [inProgress, activeBlock]);

  // Elapsed timer while a block is active
  useEffect(() => {
    if (!activeBlock?.startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - activeBlock.startedAt!) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeBlock]);

  // Connectivity indicator (offline-first field app FR-8.1)
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  // Simulated GPS geofence: ~50/50 chance inside the block section (FR-8.2)
  const simulateGeofence = () => {
    setGeoStatus(Math.random() > 0.5 ? "inside" : "outside");
    toast.info(
      geoStatus === "inside"
        ? "GPS: Inside block section — verified ✓"
        : "GPS: Outside geofence — move to the section or tap Verify again",
    );
  };

  const toggleCheck = (id: string) =>
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));

  const requiredDone = checklist.filter((c) => c.required && c.done).length;
  const requiredTotal = checklist.filter((c) => c.required).length;
  const safetySigned = requiredDone === requiredTotal;

  const handleStart = async (block: Doc<"blockRequests">) => {
    setBusy(true);
    try {
      await startBlock({ blockId: block.blockId, crewName: "Field Crew (Demo)" });
      setActiveBlock(block);
      setElapsed(0);
      setChecklist(baseChecklist.map((c) => ({ ...c })));
      toast.success(`Block ${block.blockId} started`, {
        description: `${block.section} — timer running. Stay safe!`,
      });
    } catch (err) {
      toast.error("Could not start block", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    if (!activeBlock) return;
    if (!safetySigned) {
      toast.error("Safety sign-off incomplete", {
        description: "All mandatory safety checks must be ticked before completing (G&SR requirement).",
      });
      return;
    }
    setBusy(true);
    try {
      await completeBlock({
        blockId: activeBlock.blockId,
        crewName: "Field Crew (Demo)",
        workCompletedPct: workPct,
        safetySignoff: true,
        remarks: remarks || undefined,
      });
      toast.success(`Block ${activeBlock.blockId} completed`, {
        description: `${workPct}% work done. Feedback recorded for the AI model.`,
      });
      setActiveBlock(null);
      setChecklist(baseChecklist.map((c) => ({ ...c })));
      setRemarks("");
      setWorkPct(100);
    } catch (err) {
      toast.error("Could not complete block", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  };

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Phone frame header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">Field Crew App</h2>
            <p className="text-xs text-muted-foreground">Mobile view — works like the field app</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            online
              ? "bg-chart-3/10 text-chart-3 border-chart-3/30"
              : "bg-destructive/10 text-destructive border-destructive/30"
          }`}
        >
          {online ? <Signal className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {online ? "Online" : "Offline — will sync"}
        </div>
      </div>

      {/* ACTIVE BLOCK — execution mode */}
      {activeBlock ? (
        <div className="rounded-2xl border border-primary/30 bg-card overflow-hidden">
          {/* Live status strip */}
          <div className="bg-primary/10 px-5 py-4 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-primary font-semibold">
                  Block In Progress
                </div>
                <div className="font-mono font-bold text-lg">{activeBlock.blockId}</div>
                <div className="text-sm text-muted-foreground">{activeBlock.section}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-bold text-primary tabular-nums">
                  {formatElapsed(elapsed)}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* GPS geofence */}
            <button
              onClick={simulateGeofence}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                geoStatus === "inside"
                  ? "border-chart-3/40 bg-chart-3/10"
                  : geoStatus === "outside"
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-border/50 bg-primary/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin
                  className={`w-4 h-4 ${
                    geoStatus === "inside" ? "text-chart-3" : geoStatus === "outside" ? "text-destructive" : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {geoStatus === "inside" ? "Inside block section" : geoStatus === "outside" ? "Outside geofence" : "GPS not verified"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Tap to verify position (geofence)</div>
                </div>
              </div>
              <Radio className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  Safety & Work Checklist
                </div>
                <span className={`text-xs font-semibold ${safetySigned ? "text-chart-3" : "text-chart-4"}`}>
                  {requiredDone}/{requiredTotal} required
                </span>
              </div>
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    item.done ? "border-chart-3/40 bg-chart-3/10" : "border-border/50 hover:bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      item.done ? "bg-chart-3 border-chart-3" : "border-muted-foreground/40"
                    }`}
                  >
                    {item.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                  {item.required && !item.done && (
                    <span className="ml-auto text-[10px] font-bold text-destructive shrink-0">REQ</span>
                  )}
                </button>
              ))}
            </div>

            {/* Work completion slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Work completed</span>
                <span className="font-bold text-primary">{workPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={workPct}
                onChange={(e) => setWorkPct(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            {/* Remarks */}
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks (optional) — site conditions, pending work..."
              rows={2}
              className="w-full p-3 rounded-xl text-sm bg-background/60 border border-border/50 resize-none focus:outline-none focus:border-primary/40"
            />

            {/* Complete button — blocked until safety sign-off */}
            <button
              onClick={handleComplete}
              disabled={busy || !safetySigned}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                safetySigned
                  ? "bg-chart-3 text-white hover:bg-chart-3/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              {safetySigned ? "Complete Block & Sign Off" : "Complete all required safety checks"}
            </button>
          </div>
        </div>
      ) : (
        /* IDLE — list of approved blocks to execute */
        <>
          {approved === undefined ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : approved.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <ClipboardCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No approved blocks waiting</p>
              <p className="text-xs text-muted-foreground mt-1">
                Approved blocks from the Approvals queue will appear here for execution.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Ready to Execute ({approved.length})
              </p>
              {approved.map((block) => (
                <div key={block._id} className="rounded-2xl border border-border/50 bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm">{block.blockId}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-chart-3/15 text-chart-3 border border-chart-3/30">
                          APPROVED
                        </span>
                      </div>
                      <div className="text-sm mt-1 truncate">{block.section}</div>
                      <div className="text-xs text-muted-foreground">
                        {block.workType} | {block.window}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStart(block)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-all active:scale-95 shrink-0"
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Demo hint */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
            <Radio className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Try the full loop:</span> create a block in
              New Block Request → approve it in Approvals → it appears here. Start it, tick the safety
              checklist, then complete with sign-off.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
