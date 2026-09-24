import { motion } from "framer-motion";
import { Activity, Radio, Signal, TrainFront } from "lucide-react";

export default function HeroRailTrack() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[360px] overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 105%, rgba(40,98,215,0.22) 0%, rgba(11,12,14,0) 58%), linear-gradient(180deg, transparent 0%, rgba(11,12,14,0.2) 45%, #0b0c0e 100%)",
        }}
      />

      {/* Perspective sleepers */}
      <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 1200 360" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hero-rail" x1="0" x2="1">
            <stop offset="0" stopColor="#172540" />
            <stop offset="0.5" stopColor="#85a6e9" />
            <stop offset="1" stopColor="#172540" />
          </linearGradient>
          <linearGradient id="hero-sleeper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24375a" />
            <stop offset="1" stopColor="#0b0c0e" />
          </linearGradient>
          <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g opacity="0.72">
          {Array.from({ length: 18 }, (_, i) => {
            const y = 360 - i * 18;
            const inset = 50 + i * 4.5;
            return <line key={i} x1={inset} y1={y} x2={1200 - inset} y2={y} stroke="url(#hero-sleeper)" strokeWidth={Math.max(1, 3 - i * 0.1)} />;
          })}
        </g>
        <path d="M130 360 L535 164 M1070 360 L665 164" stroke="#24375a" strokeWidth="6" opacity="0.72" />
        <path d="M145 360 L540 164 M1055 360 L660 164" stroke="url(#hero-rail)" strokeWidth="2" filter="url(#hero-glow)" />
        <path d="M215 360 L555 164 M985 360 L645 164" stroke="#85a6e9" strokeWidth="1" strokeDasharray="7 12" opacity="0.5" />

        {/* signal at the vanishing point */}
        <g transform="translate(602 92)">
          <rect x="-2" y="0" width="4" height="78" rx="2" fill="#24375a" />
          <rect x="-12" y="-12" width="24" height="42" rx="5" fill="#0e111b" stroke="#3c3f44" />
          <circle cx="0" cy="1" r="5" fill="#ef4444" filter="url(#hero-glow)" />
          <circle cx="0" cy="14" r="5" fill="#1a2438" />
          <circle cx="0" cy="27" r="5" fill="#1a2438" />
        </g>

        <motion.g
          animate={{ x: ["-260px", "1280px"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        >
          <g transform="translate(0 226)">
            <path d="M0 0 L28 -8 H150 L172 4 V26 H0 Z" fill="#162f67" stroke="#85a6e9" strokeWidth="2" />
            <rect x="18" y="-23" width="105" height="15" rx="5" fill="#85a6e9" opacity="0.65" />
            <circle cx="28" cy="29" r="8" fill="#0b0c0e" stroke="#3c3f44" />
            <circle cx="145" cy="29" r="8" fill="#0b0c0e" stroke="#3c3f44" />
            <path d="M172 7 L214 -1 V23 H172 Z" fill="#0e172b" stroke="#24375a" />
            <path d="M214 1 L266 0 V25 H214 Z" fill="#101a31" stroke="#24375a" />
            <path d="M266 0 L318 0 V25 H266 Z" fill="#0e172b" stroke="#24375a" />
            <circle cx="324" cy="10" r="5" fill="#fff7cc" filter="url(#hero-glow)" />
            <path d="M329 14 L465 30 L329 33 Z" fill="#fff4c8" opacity="0.16" />
          </g>
        </motion.g>
      </svg>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#24375a] bg-[#0b0c0e]/80 px-3 py-2 backdrop-blur-xl">
        <Signal className="h-3.5 w-3.5 text-[#ef4444]" />
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#abaebb]">AUTO BLOCK // LIVE PREVIEW</span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
      </div>

      <motion.div
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-28 right-[12%] hidden items-center gap-2 rounded-xl border border-[#24375a] bg-[#0e111b]/75 px-3 py-2 backdrop-blur-xl md:flex"
      >
        <Radio className="h-3.5 w-3.5 text-[#85a6e9]" />
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#3c3f44]">section telemetry</div>
          <div className="font-mono text-xs font-bold text-white">NDLS → BCT · 142/6</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 left-[12%] hidden items-center gap-2 rounded-xl border border-[#172540] bg-[#0e111b]/70 px-3 py-2 backdrop-blur-xl md:flex"
      >
        <Activity className="h-3.5 w-3.5 text-[#ff7dda]" />
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#3c3f44]">asset pulse</div>
          <div className="font-mono text-xs font-bold text-white">AVAILABILITY 91.8%</div>
        </div>
        <TrainFront className="h-4 w-4 text-[#85a6e9]" />
      </motion.div>
    </div>
  );
}
