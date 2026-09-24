import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { aspectForTick, redCountdown } from "@/lib/signal-cycle";
import {
  AlertTriangle,
  Train as TrainIcon,
  Radio,
  TrendingDown,
  IndianRupee,
} from "lucide-react";

/**
 * Live Problem HUD — floats over the 3D scene in the hero.
 * Shows the REAL block-planning problem using REAL IRCTC data:
 *  - actual delay of a real running train (fetched live, falls back to demo)
 *  - detention minutes ticking up in real time (the core pain point)
 *  - estimated revenue loss (detention × ₹/min industry benchmark)
 *  - signal aspect synced to the 3D scene's cycle (red 0-4s, amber 4-8s, green 8-12s)
 */

interface LiveTrainInfo {
  trainNumber: string;
  currentStation: { name: string; code: string; delay: string } | null;
}

const DEMO_TRAIN = {
  trainNumber: "12951",
  name: "Mumbai Rajdhani",
  currentStation: { name: "Borivali", code: "BVI", delay: "25 M" },
};

function parseDelayMinutes(delay: string | undefined): number {
  if (!delay) return 0;
  const m = delay.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

export default function ProblemHUD() {
  const getLiveTrain = useAction(api.trainData.getLiveTrain);
  const [train, setTrain] = useState<LiveTrainInfo>(DEMO_TRAIN);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Fetch real live delay every 2 minutes (rate-limit friendly)
  useEffect(() => {
    let cancelled = false;

    async function fetchLive() {
      try {
        const result = (await getLiveTrain({ trainNumber: "12951" })) as {
          trainNumber?: string;
          currentStation?: { name?: string; code?: string; delay?: string } | null;
        } | null;
        if (!cancelled && result?.currentStation?.code) {
          setTrain({
            trainNumber: result.trainNumber ?? "12951",
            currentStation: {
              name: result.currentStation.name ?? "",
              code: result.currentStation.code ?? "",
              delay: result.currentStation.delay || "0 M",
            },
          });
          setIsLive(true);
        }
      } catch {
        // Rate limited or API down — demo data already in place
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 120_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [getLiveTrain]);

  // 1-second heartbeat: detention counter + signal phase (synced to 3D scene timing)
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const baseDelay = parseDelayMinutes(train.currentStation?.delay);
  // Detention grows while signal is RED (phase 0 of the 12s cycle, matching the 3D scene)
  const signalAspect = aspectForTick(tick);
  const detaining = signalAspect === "red";
  const detentionMin = baseDelay + Math.floor(tick / 60); // +1 min per real minute held

  // Industry benchmark: ~₹90/min detention cost for an express (conservative)
  const lossRs = detentionMin * 90;
  const trainsHeld = detaining ? 3 : 1; // simulated cascade count
  const redLeft = redCountdown(tick);

  const aspectColor =
    signalAspect === "red" ? "#ef4444" : signalAspect === "amber" ? "#f59e0b" : "#22c55e";

  return (
    <div className="absolute left-4 bottom-4 z-20 w-[300px] select-none">
      <div
        className="rounded-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: "rgba(13,23,43,0.85)",
          border: "1px solid #24375a",
          boxShadow: "rgba(0,0,0,0.5) 0px 4px 30px 0px",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#172540" }}>
          <Radio className="w-3.5 h-3.5 text-destructive animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#85a6e9" }}>
            Live Problem Monitor
          </span>
          <span
            className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: isLive ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
              color: isLive ? "#22c55e" : "#f59e0b",
            }}
          >
            {loading ? "…" : isLive ? "LIVE IRCTC" : "DEMO"}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Train + delay */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <TrainIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white font-mono">
                {train.trainNumber}
                <span className="ml-1.5 text-[10px] font-sans font-medium" style={{ color: "#abaebb" }}>
                  Mumbai Rajdhani
                </span>
              </div>
              <div className="text-[11px] truncate" style={{ color: "#abaebb" }}>
                @ {train.currentStation?.code || "—"} · running late
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold font-mono" style={{ color: baseDelay > 15 ? "#ef4444" : "#f59e0b" }}>
                {baseDelay}m
              </div>
              <div className="text-[9px] uppercase tracking-wide" style={{ color: "#3c3f44" }}>
                delay
              </div>
            </div>
          </div>

          {/* Signal + detention */}
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
            style={{
              background: detaining ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.06)",
              border: `1px solid ${detaining ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.2)"}`,
            }}
          >
            {/* Signal lamp */}
            <div className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-[6px] transition-colors duration-700"
                style={{ background: aspectColor, opacity: detaining ? 0.7 : 0.25 }}
              />
              <div
                className="relative w-3.5 h-3.5 rounded-full transition-colors duration-700"
                style={{ background: aspectColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold" style={{ color: detaining ? "#ef4444" : "#22c55e" }}>
                {detaining ? "Signal RED — train held" : "Signal GREEN — line clear"}
              </div>
              <div className="text-[10px]" style={{ color: "#abaebb" }}>
                {detaining
                ? `maintenance block ahead${redLeft !== null ? ` · clears in ${redLeft}s` : ""} · ${trainsHeld} trains waiting`
                : "block work in progress"}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold font-mono" style={{ color: detaining ? "#ef4444" : "#22c55e" }}>
                {detentionMin}
              </div>
              <div className="text-[9px] uppercase tracking-wide" style={{ color: "#3c3f44" }}>
                min held
              </div>
            </div>
          </div>

          {/* Cascade + revenue impact */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(14,17,27,0.7)", border: "1px solid #172540" }}>
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-chart-4" />
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "#3c3f44" }}>
                  Cascade
                </span>
              </div>
              <div className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                {trainsHeld} trains
              </div>
              <div className="text-[9px]" style={{ color: "#3c3f44" }}>
                delayed downstream
              </div>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(14,17,27,0.7)", border: "1px solid #172540" }}>
              <div className="flex items-center gap-1 mb-1">
                <IndianRupee className="w-3 h-3 text-destructive" />
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "#3c3f44" }}>
                  Est. Loss
                </span>
              </div>
              <div className="text-sm font-bold font-mono" style={{ color: "#ef4444" }}>
                ₹{lossRs.toLocaleString("en-IN")}
              </div>
              <div className="text-[9px]" style={{ color: "#3c3f44" }}>
                @ ₹90/min
              </div>
            </div>
          </div>

          {/* The pitch */}
          <div className="flex items-start gap-2 pt-1">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
            <p className="text-[10px] leading-relaxed" style={{ color: "#abaebb" }}>
              <span className="font-semibold text-white">RailBlock AI fixes this:</span> the optimizer grants
              the block in the lowest-traffic window — trains pass, zero detention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
