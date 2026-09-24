import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  aspectForTick,
  redCountdown,
  trainPhaseForSecond,
  type SignalAspect,
} from "@/lib/signal-cycle";

/**
 * RunningTrain — a 2D train crossing the landing page UI itself.
 *
 * A WAP-7 electric loco + 3 coaches runs along a full-width track strip and
 * obeys the section signal on the same 12s cycle as the 3D hero scene:
 *   0–4s  red   — held at the signal over the maintenance block
 *   4–8s  amber — block clears, proceeds with caution
 *   8–12s green — line clear; re-enters and approaches for the next cycle
 *
 * Pure CSS keyframes (see .rb-* utilities in index.css) drive the journey,
 * wheel spin and speed streaks; React state only drives signal colors and
 * the HUD chips, so there is no per-frame React work.
 */

const SIGNAL_POS = "62%";

const ASPECT_COLOR: Record<SignalAspect, string> = {
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
};

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={121} r={11} fill="#0b0c0e" stroke="#3c3f44" strokeWidth={2.5} />
      <g className="rb-wheel">
        <line x1={cx - 7} y1={121} x2={cx + 7} y2={121} stroke="#4a5568" strokeWidth={2} />
        <line x1={cx} y1={114} x2={cx} y2={128} stroke="#4a5568" strokeWidth={2} />
        <circle cx={cx} cy={121} r={2.5} fill="#85a6e9" />
      </g>
    </g>
  );
}

function Coach({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y={48} width={170} height={64} rx={9} fill="url(#rbCoachGrad)" stroke="#24375a" strokeWidth={1.5} />
      <rect x={x + 5} y={45} width={160} height={9} rx={4} fill="#1c2b4a" />
      {[14, 46, 78, 110].map((dx) => (
        <rect key={dx} x={x + dx} y={62} width={22} height={15} rx={2.5} fill="#85a6e9" opacity={0.42} />
      ))}
      <rect x={x + 4} y={58} width={6} height={48} rx={2} fill="#0b1424" />
      <rect x={x + 160} y={58} width={6} height={48} rx={2} fill="#0b1424" />
      <Wheel cx={x + 38} />
      <Wheel cx={x + 132} />
    </g>
  );
}

function Signal({ aspect, countdown }: { aspect: SignalAspect; countdown: number | null }) {
  return (
    <div className="absolute z-30" style={{ left: SIGNAL_POS, bottom: 36 }}>
      {/* Mast */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: 3, height: 118, background: "linear-gradient(180deg, #24375a, #172540)" }}
      />
      {/* Base plate */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: 14, height: 5, background: "#24375a" }} />
      {/* Lamp head */}
      <div
        className="absolute bottom-[112px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[7px] rounded-lg"
        style={{
          width: 24,
          padding: "6px 0",
          background: "#0e111b",
          border: "1px solid #24375a",
          boxShadow: "rgba(0,0,0,0.5) 0px 4px 14px 0px",
        }}
      >
        {(["red", "amber", "green"] as SignalAspect[]).map((name) => {
          const on = aspect === name;
          const c = ASPECT_COLOR[name];
          return (
            <div
              key={name}
              className="relative rounded-full transition-all duration-500"
              style={{
                width: 9,
                height: 9,
                background: on ? c : "#1a2438",
                boxShadow: on ? `0 0 10px 2px ${c}` : "none",
              }}
            />
          );
        })}
      </div>
      {/* Countdown while held */}
      {countdown !== null && (
        <div
          className="absolute whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-mono-code font-bold tracking-widest"
          style={{
            left: "calc(100% + 10px)",
            bottom: 116,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#f87171",
          }}
        >
          T-{countdown}s
        </div>
      )}
    </div>
  );
}

function RunningStatusChip({
  phase,
  countdown,
}: {
  phase: ReturnType<typeof trainPhaseForSecond>;
  countdown: number | null;
}) {
  if (countdown !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 backdrop-blur-md"
        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#ef4444" }} />
        <span className="text-[10px] font-semibold tracking-wider font-mono-code" style={{ color: "#f87171" }}>
          HELD — BLOCK AHEAD · CLEARS IN {countdown}s
        </span>
      </motion.div>
    );
  }
  const copy =
    phase === "departing"
      ? "PROCEED WITH CAUTION · 60 KM/H"
      : "APPROACHING SIGNAL · 90 KM/H";
  const color = phase === "departing" ? "#4ade80" : "#fbbf24";
  const dot = phase === "departing" ? "#22c55e" : "#f59e0b";
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 backdrop-blur-md"
      style={{
        background: phase === "departing" ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.1)",
        border: `1px solid ${phase === "departing" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.3)"}`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      <span className="text-[10px] font-semibold tracking-wider font-mono-code" style={{ color }}>
        {copy}
      </span>
    </div>
  );
}

export default function RunningTrain() {
  const [tick, setTick] = useState(0);
  const stripRef = useRef<HTMLElement | null>(null);

  // 1s heartbeat — synced to the 3D scene's 12s signal cycle
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Viewport-adaptive journey: the loco nose (SVG x≈891 of 900) stops just
  // before the signal mast at SIGNAL_POS (62% of strip width), exits right,
  // and re-enters fully off the left edge — regardless of viewport width.
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      el.style.setProperty("--rb-stop", `${Math.max(0.62 * w - 899, 120)}px`);
      el.style.setProperty("--rb-exit", `${w + 80}px`);
      el.style.setProperty("--rb-entry", "-980px");
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const aspect = aspectForTick(tick);
  const phase = trainPhaseForSecond(tick);
  const countdown = redCountdown(tick); // non-null exactly while held at the signal
  const aspectColor = ASPECT_COLOR[aspect];

  return (
    <section
      ref={stripRef}
      className="rb-strip relative h-[230px] w-full overflow-hidden"
      style={{ background: "#0b0c0e", borderTop: "1px solid #172540", borderBottom: "1px solid #172540" }}
    >
      {/* Aurora bleed — matches the hero glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(40% 90% at 15% 0%, rgba(98,95,255,0.14) 0px, transparent 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(35% 80% at 85% 100%, rgba(255,125,218,0.12) 0px, transparent 100%)" }}
      />

      {/* Section header chips */}
      <div className="relative z-30 flex items-center justify-between px-6 pt-5 md:px-12">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "rgba(14,17,27,0.8)", border: "1px solid #172540" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#ef4444" }} />
          <span className="text-[10px] tracking-[0.18em] font-mono-code" style={{ color: "#85a6e9" }}>
            LIVE SECTION — NDLS → BCT · KM 142/6
          </span>
        </div>
        <div
          className="hidden items-center gap-2 rounded-full px-3 py-1.5 md:flex"
          style={{ background: "rgba(14,17,27,0.8)", border: "1px solid #172540" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full transition-all duration-500"
            style={{ background: aspectColor, boxShadow: `0 0 8px ${aspectColor}` }}
          />
          <span className="text-[10px] tracking-[0.18em] font-mono-code" style={{ color: "#abaebb" }}>
            SIGNAL SYNC 12s — ASPECT {aspect.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Track: rail, sleepers, ballast */}
      <div className="absolute left-0 right-0" style={{ bottom: 36 }}>
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, #24375a 4%, #3c4a6b 50%, #24375a 96%, transparent)" }}
        />
      </div>
      <div
        className="absolute left-0 right-0 h-[7px] opacity-70"
        style={{
          bottom: 27,
          background: "repeating-linear-gradient(90deg, #172540 0px, #172540 12px, transparent 12px, transparent 30px)",
        }}
      />
      <div
        className="absolute left-0 right-0 h-[18px]"
        style={{ bottom: 10, background: "linear-gradient(180deg, rgba(23,37,64,0.35), transparent)" }}
      />

      {/* Section signal standing over the maintenance block */}
      <Signal aspect={aspect} countdown={countdown} />

      {/* The train — CSS keyframes drive the journey; this element just anchors it */}
      <div className="rb-train-anchor pointer-events-none">
        <div className="rb-train-scale relative h-full w-full">
          {/* Speed streaks trailing behind (fade out while held) */}
          <div className="rb-streaks absolute top-[64px] left-[-160px] w-[170px]">
            <div className="mb-3 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(133,166,233,0.55))" }} />
            <div className="mb-3 ml-6 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(133,166,233,0.35))" }} />
            <div className="ml-2 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(133,166,233,0.45))" }} />
          </div>

          {/* Headlight beam */}
          <div
            className="rb-beam absolute"
            style={{
              right: -104,
              top: 75,
              width: 110,
              height: 44,
              background: "linear-gradient(90deg, rgba(255,244,200,0.35) 0%, rgba(255,244,200,0.08) 55%, transparent 100%)",
              clipPath: "polygon(0 38%, 100% 0, 100% 100%, 0 62%)",
            }}
          />

          {/* Status HUD floating above the loco */}
          <div className="absolute -top-10 right-0 whitespace-nowrap">
            <RunningStatusChip phase={phase} countdown={countdown} />
          </div>

          {/* Train SVG — WAP-7 loco + 3 coaches */}
          <svg width={900} height={150} viewBox="0 0 900 150" fill="none">
            <defs>
              <linearGradient id="rbEngineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="55%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#12244f" />
              </linearGradient>
              <linearGradient id="rbCoachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#182747" />
                <stop offset="100%" stopColor="#0e1524" />
              </linearGradient>
            </defs>

            {/* Ground shadow */}
            <ellipse cx={455} cy={139} rx={440} ry={6} fill="#000000" opacity={0.5} />

            {/* Couplers */}
            <rect x={195} y={94} width={15} height={8} fill="#0b0c0e" stroke="#24375a" strokeWidth={1} />
            <rect x={380} y={94} width={15} height={8} fill="#0b0c0e" stroke="#24375a" strokeWidth={1} />
            <rect x={565} y={94} width={20} height={8} fill="#0b0c0e" stroke="#24375a" strokeWidth={1} />

            {/* Coaches (rear → front) */}
            <Coach x={25} />
            <Coach x={210} />
            <Coach x={395} />

            {/* WAP-7 loco — sloped nose facing right */}
            <path
              d="M590,114 L590,54 Q590,40 604,38 L838,38 Q860,38 872,52 L886,82 Q891,91 891,100 L891,106 Q891,114 881,114 Z"
              fill="url(#rbEngineGrad)"
              stroke="#24375a"
              strokeWidth={1.5}
            />
            {/* Pantograph */}
            <polyline points="640,38 658,20 676,28 694,38" stroke="#85a6e9" strokeWidth={2} opacity={0.8} />
            <line x1={648} y1={22} x2={690} y2={22} stroke="#85a6e9" strokeWidth={1.5} opacity={0.5} />
            {/* Detention beacon */}
            <circle
              cx={700}
              cy={33}
              r={4.5}
              fill="#ef4444"
              opacity={countdown !== null ? 1 : 0.25}
              className={countdown !== null ? "animate-pulse" : undefined}
            />
            {/* Windshield + stripe + number plate */}
            <polygon points="842,46 858,46 872,60 878,76 846,76" fill="#85a6e9" opacity={0.75} />
            <rect x={596} y={90} width={248} height={6} rx={3} fill="#ffffff" opacity={0.45} />
            <text
              x={612}
              y={74}
              fontSize={11}
              fill="#c7c9d1"
              opacity={0.9}
              style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", letterSpacing: "0.08em" }}
            >
              WAP-7 · 12951
            </text>
            {/* Headlight */}
            <circle cx={884} cy={97} r={8} fill="#fff8d6" opacity={0.25} />
            <circle cx={884} cy={97} r={5} fill="#fff8d6" />

            {/* Brake glow while detained */}
            <ellipse
              cx={735}
              cy={134}
              rx={150}
              ry={8}
              fill="#ef4444"
              opacity={countdown !== null ? 0.35 : 0}
              style={{ transition: "opacity 0.8s ease" }}
            />

            {/* Wheels */}
            <Wheel cx={63} />
            <Wheel cx={157} />
            <Wheel cx={248} />
            <Wheel cx={342} />
            <Wheel cx={433} />
            <Wheel cx={527} />
            <Wheel cx={630} />
            <Wheel cx={700} />
            <Wheel cx={770} />
            <Wheel cx={840} />
          </svg>
        </div>
      </div>
    </section>
  );
}
