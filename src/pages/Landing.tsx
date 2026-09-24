import { motion } from "framer-motion";
import { Suspense, lazy, useRef } from "react";
import {
  Train,
  Shield,
  Brain,
  BarChart3,
  Map,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Activity,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import { useNavigate } from "react-router";
import TiltCard from "@/components/ui/tilt-card";

// 3D scenes are lazy-loaded so the page paints instantly
const RailwayScene = lazy(() => import("@/components/three/RailwayScene"));
const GlobeScene = lazy(() => import("@/components/three/GlobeScene"));
const ProblemHUD = lazy(() => import("@/components/hero/ProblemHUD"));
const RunningTrain = lazy(() => import("@/components/hero/RunningTrain"));
const ImmersiveNetworkLab = lazy(() => import("@/components/three/ImmersiveNetworkLab"));

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-pulse" />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI Block Optimization",
    desc: "Constraint-based MILP solver generates optimal block plans in under 30 seconds, maximizing maintenance value while minimizing train disruption.",
  },
  {
    icon: GitBranch,
    title: "Conflict Detection",
    desc: "Automated clash detection across departments before approval — flags overlapping blocks and suggests resolution strategies.",
  },
  {
    icon: Map,
    title: "GIS Map Visualization",
    desc: "Interactive section map with color-coded blocks, live train positions, and asset health overlays across zones and divisions.",
  },
  {
    icon: Activity,
    title: "What-If Simulation",
    desc: "Run Monte Carlo simulations to preview delay cascading effects before committing to a block window.",
  },
  {
    icon: Shield,
    title: "Multi-Level Approvals",
    desc: "Configurable approval chains with SLA timers, digital signatures, and audit trails for safety-critical decisions.",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    desc: "ML-powered forecasting for traffic density, asset degradation, and maintenance backlog clearance rates.",
  },
];

const stats = [
  { value: "90%+", label: "Block Utilization", sub: "vs 60% manual" },
  { value: "30s", label: "Plan Generation", sub: "per division (500km)" },
  { value: "< 4hr", label: "Approval Time", sub: "vs 2-5 days" },
  { value: "40%", label: "Fewer Detentions", sub: "train delay reduction" },
];

const workflowSteps = [
  { icon: Zap, label: "AI Suggests", desc: "Predictive models auto-detect maintenance needs" },
  { icon: CheckCircle2, label: "Optimize", desc: "Solver generates ranked block options" },
  { icon: AlertTriangle, label: "Simulate", desc: "Preview impact on live traffic schedule" },
  { icon: Shield, label: "Approve", desc: "Digital workflow with SLA tracking" },
];

const problems = [
  {
    icon: AlertTriangle,
    title: "Manual Scheduling",
    text: "Blocks are planned in spreadsheets with no visibility into real traffic patterns, leading to underutilization and cascading delays.",
    iconBg: "bg-chart-4/15",
    iconColor: "text-chart-4",
  },
  {
    icon: Clock,
    title: "2–5 Day Approvals",
    text: "Cross-department phone coordination causes approval delays of days. Emergency blocks compete with routine ones.",
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
  },
  {
    icon: BarChart3,
    title: "No Learning Loop",
    text: "Past block performance is never fed back. Same mistakes repeat. No predictive maintenance triggers.",
    iconBg: "bg-chart-2/15",
    iconColor: "text-chart-2",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen overflow-x-hidden dark">      {/* ===== HERO — unova-style split with live 3D scene ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: "#0b0c0e" }}
      >
        {/* Aurora glows — purple top, pink bottom-right (unova signature) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(79% 96% at 39% -53%, rgba(98,95,255,0.38) 0px, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(28% 22% at 72% 103%, rgba(255,125,218,0.33) 0px, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Top nav bar — floating glass pill */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Train className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              RailBlock<span className="text-primary"> AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-[#050606] hover:bg-white/90 transition-all"
            >
              Get Started
            </button>
          </div>
        </motion.nav>

        {/* Split hero: text left, 3D right */}
        <div className="relative z-10 flex-1 grid lg:grid-cols-2 gap-8 items-center max-w-7xl w-full mx-auto px-6 md:px-12 pb-16">
          {/* Left column — headline + CTAs */}
          <div className="text-center lg:text-left pt-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: "rgba(18,36,79,0.6)", border: "1px solid #24375a" }}
            >
              <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "#85a6e9" }}>
                MINISTRY OF RAILWAYS — SIH 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
              style={{ color: "#ffffff" }}
            >
              Illuminate Your
              <br />
              Railway Network With
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #85a6e9, #625fff, #ff7dda)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                RailBlock AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-lg max-w-lg mx-auto lg:mx-0 mb-4 leading-relaxed"
              style={{ color: "#abaebb" }}
            >
              AI-Powered Automatic Block Planning to{" "}
              <span className="font-semibold text-white">Maximize Asset Availability</span> —
              optimizing maintenance windows while minimizing train disruption.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xs mb-9 flex items-center gap-2 justify-center lg:justify-start"
              style={{ color: "#3c3f44" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              Watch the live scene: a train held at a red signal before a maintenance block —
              daily reality across 70+ divisions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <button
                onClick={() => navigate("/login")}
                className="group relative px-8 py-4 bg-white text-[#050606] rounded-full font-semibold text-base transition-all duration-300 hover:scale-[1.03] flex items-center gap-2 justify-center"
              >
                Launch Command Center
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-full font-semibold text-base border transition-all duration-300 hover:bg-white/5"
                style={{ borderColor: "#3c3f44", color: "#ffffff" }}
              >
                View Live Demo
              </button>
            </motion.div>
          </div>

          {/* Right column — live 3D railway scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[420px] lg:h-[560px]"
          >
            {/* Glow behind the scene */}
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ background: "rgba(11,12,14,0.35)" }}>
              <Suspense fallback={<SceneFallback />}>
                <RailwayScene />
              </Suspense>
            </div>
            {/* Floating stat chip over the 3D scene */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-6 px-4 py-2.5 rounded-xl backdrop-blur-xl"
              style={{ background: "rgba(13,23,43,0.8)", border: "1px solid #24375a" }}
            >
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "#85a6e9" }}>
                Live Optimization
              </div>
              <div className="text-lg font-bold text-white font-mono">MILP SOLVER</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-6 left-6 px-4 py-2.5 rounded-xl backdrop-blur-xl"
              style={{ background: "rgba(13,23,43,0.8)", border: "1px solid #24375a" }}
            >
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "#85a6e9" }}>
                Network Coverage
              </div>
              <div className="text-lg font-bold text-white">17 Zones · 70+ Divisions</div>
            </motion.div>
            {/* Live problem monitor — real IRCTC delay, detention & loss over the 3D story */}
            <Suspense fallback={null}>
              <ProblemHUD />
            </Suspense>
          </motion.div>
        </div>

        {/* Stats strip — glass cards over the scene bottom */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-6 md:px-12 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl px-5 py-5 backdrop-blur-xl animate-float"
                style={{
                  animationDelay: `${i * 0.6}s`,
                  background: "rgba(14,17,27,0.72)",
                  border: "1px solid #172540",
                  boxShadow: "rgba(0,0,0,0.5) 0px 4px 30px 0px",
                }}
              >
                <div className="text-2xl md:text-3xl font-bold" style={{ color: "#85a6e9" }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white/90 mt-1">{stat.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "#3c3f44" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== RUNNING TRAIN — 2D express crossing the page on the live signal cycle ===== */}
      <Suspense fallback={null}>
        <RunningTrain />
      </Suspense>

      {/* ===== PROBLEM ===== */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest">
              The Problem
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3 mb-5 text-foreground">
              Indian Railways Block Planning is{" "}
              <span className="bg-gradient-to-r from-chart-4 to-destructive bg-clip-text text-transparent">
                Broken
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="max-w-2xl mx-auto text-lg" style={{ color: "oklch(0.65 0 0)" }}>
              One of the world&apos;s densest rail networks is still managed with spreadsheets, phone calls, and tribal knowledge.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <TiltCard
                  className="glow-card shimmer-card rounded-2xl p-7 h-full"
                  style={{
                    background: "rgba(14,17,27,0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #172540",
                    boxShadow: "rgba(0,0,0,0.5) 0px 4px 30px 0px",
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconBg}`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.70 0 0)" }}>
                    {item.text}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.10 0.025 250) 0%, oklch(0.12 0.03 255) 100%)" }}>
        <div className="absolute inset-0 track-pattern opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
              From Request to Execution in{" "}
              <span className="text-primary">Minutes</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50" />

            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-5 relative z-10 animate-pulse-glow">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-1">Step {i + 1}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{step.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0 0)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest">
              Core Capabilities
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
              AI-Driven{" "}
              <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">Railway Intelligence</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="max-w-xl mx-auto mt-4 text-lg" style={{ color: "oklch(0.65 0 0)" }}>
              Every module is designed for the safety-critical, multi-department reality of Indian Railways.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <TiltCard
                  className="glow-card shimmer-card group rounded-2xl p-6 h-full"
                  style={{
                    background: "rgba(14,17,27,0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #172540",
                    boxShadow: "rgba(0,0,0,0.5) 0px 4px 30px 0px",
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                    <feat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feat.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0 0)" }}>{feat.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW IMMERSIVE DIGITAL TWIN — additional scroll depth, existing content preserved ===== */}
      <Suspense fallback={null}>
        <ImmersiveNetworkLab />
      </Suspense>

      {/* ===== CTA — 3D globe finale ===== */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#0b0c0e" }}>
        {/* Aurora bleed */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 110%, rgba(98,95,255,0.25) 0px, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-3xl md:text-5xl font-bold mb-6" style={{ color: "#ffffff" }}>
            Ready to{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #85a6e9, #ff7dda)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Transform
            </span>{" "}
            Indian Railways?
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#abaebb" }}>
            Join us in building the future of railway maintenance planning — where AI maximizes both asset availability and line capacity.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <button
              onClick={() => navigate("/login")}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[#050606] rounded-full font-bold text-lg transition-all duration-300 hover:scale-[1.04]"
              style={{ boxShadow: "rgba(255,255,255,0.35) 0px 2px 14px 0px" }}
            >
              Enter the Command Center
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
        {/* 3D network globe behind the CTA */}
        <div className="absolute inset-x-0 bottom-0 h-[380px] opacity-70 pointer-events-none">
          <Suspense fallback={null}>
            <GlobeScene />
          </Suspense>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0c0e] to-transparent pointer-events-none" />
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">RailBlock AI</span>
          </div>
          <div className="text-sm" style={{ color: "oklch(0.55 0 0)" }}>
            SIH26027 — Ministry of Railways | Smart India Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
