import { motion, useScroll, useTransform } from "framer-motion";
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
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen overflow-x-hidden dark">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center rail-gradient overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-grid-scroll"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.75 0.15 55 / 0.08) 39px, oklch(0.75 0.15 55 / 0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.75 0.15 55 / 0.08) 39px, oklch(0.75 0.15 55 / 0.08) 40px)",
            }}
          />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-chart-4/10 blur-[150px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[200px]" />

        {/* Animated train track line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent">
          <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-train-move" />
        </div>

        {/* Signal dots */}
        <div className="absolute top-24 right-24 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-3 animate-signal-blink" />
          <div className="w-3 h-3 rounded-full bg-chart-4/40" />
          <div className="w-3 h-3 rounded-full bg-destructive/40" />
        </div>

        <motion.div style={{ y: bgY }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/30 mb-8"
          >
            <Train className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Ministry of Railways — Smart India Hackathon 2026</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">RailBlock </span>
            <span className="bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "oklch(0.80 0 0)" }}
          >
            AI-Powered Automatic Block Planning to{" "}
            <span className="text-primary font-semibold">Maximize Asset Availability</span> —
            optimizing maintenance windows while minimizing train disruption across India&apos;s densest rail network.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_oklch(0.75_0.15_55_/_0.3)] flex items-center gap-2 justify-center"
            >
              Launch Command Center
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              View Live Demo
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-5 animate-float"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  background: "oklch(1 0 0 / 0.08)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid oklch(1 0 0 / 0.15)",
                }}
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium text-white/90 mt-1">{stat.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.70 0 0)" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

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
                className="rounded-2xl p-7 hover:scale-[1.02] transition-transform duration-300"
                style={{
                  background: "oklch(0.18 0.03 250 / 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconBg}`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.70 0 0)" }}>
                  {item.text}
                </p>
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
                className="group rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "oklch(0.18 0.03 250 / 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0 0)" }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 px-6 bg-background">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to{" "}
            <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
              Transform
            </span>{" "}
            Indian Railways?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "oklch(0.65 0 0)" }}>
            Join us in building the future of railway maintenance planning — where AI maximizes both asset availability and line capacity.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_oklch(0.75_0.15_55_/_0.3)]"
            >
              Enter the Command Center
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
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
