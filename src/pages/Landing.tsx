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
  { icon: CheckCircle2, label: "Optimize", desc: "MILP solver generates ranked block options" },
  { icon: AlertTriangle, label: "Simulate", desc: "Preview impact on live traffic schedule" },
  { icon: Shield, label: "Approve", desc: "Digital workflow with SLA tracking" },
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glow-border mb-8 text-sm text-primary-foreground/90 font-medium"
          >
            <Train className="w-4 h-4" />
            <span>Ministry of Railways — Smart India Hackathon 2026</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              RailBlock
            </span>{" "}
            <span className="bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-Powered Automatic Block Planning to{" "}
            <span className="text-primary font-semibold">Maximize Asset Availability</span> —
            optimizing maintenance windows while minimizing train disruption across India's densest rail network.
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
              className="px-8 py-4 rounded-xl font-semibold text-lg border border-primary/30 text-primary-foreground/80 hover:bg-primary/10 transition-all duration-300"
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
              <div key={i} className="glass-card rounded-xl px-4 py-5 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium text-foreground/80 mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
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
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3 mb-5">
              Indian Railways Block Planning is{" "}
              <span className="bg-gradient-to-r from-chart-4 to-destructive bg-clip-text text-transparent">
                Broken
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              One of the world's densest rail networks is still managed with spreadsheets, phone calls, and tribal knowledge.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: "Manual Scheduling",
                text: "Blocks are planned in Excel with no visibility into real traffic patterns, leading to underutilization and cascading delays.",
                color: "chart-4",
              },
              {
                icon: Clock,
                title: "2-5 Day Approvals",
                text: "Cross-department phone coordination causes approval delays of days. Emergency blocks compete with routine ones.",
                color: "destructive",
              },
              {
                icon: BarChart3,
                title: "No Learning Loop",
                text: "Past block performance is never fed back. Same mistakes repeat. No predictive maintenance triggers.",
                color: "chart-2",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass-card rounded-2xl p-7 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-${item.color}/15`}>
                  <item.icon className={`w-6 h-6 text-${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
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
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3">
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
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
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
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3">
              AI-Driven{" "}
              <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">Railway Intelligence</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
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
                className="group glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ARCHITECTURE PREVIEW ===== */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.10 0.025 250) 0%, oklch(0.08 0.02 250) 100%)" }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest">
              System Architecture
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold mt-3">
              Full-Stack{" "}
              <span className="text-primary">Command Center</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-3xl p-8 md:p-12"
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              {/* Client Layer */}
              <div className="col-span-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  CLIENT LAYER
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["React Web App", "GIS Map UI", "Mobile Field App"].map((item, i) => (
                    <div key={i} className="bg-primary/10 rounded-xl p-3 border border-primary/20 text-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="col-span-3 text-primary/40 text-2xl">↓</div>

              {/* Services */}
              <div className="col-span-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-2/15 text-chart-2 text-sm font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                  AI + CORE SERVICES
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["Block Management", "AI/ML Optimizer", "Integration Adapters"].map((item, i) => (
                    <div key={i} className="bg-chart-2/10 rounded-xl p-3 border border-chart-2/20 text-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-3 text-primary/40 text-2xl">↓</div>

              {/* Data Layer */}
              <div className="col-span-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-4/15 text-chart-4 text-sm font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
                  DATA LAYER
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {["PostgreSQL", "TimescaleDB", "Redis", "Kafka"].map((item, i) => (
                    <div key={i} className="bg-chart-4/10 rounded-xl p-3 border border-chart-4/20 text-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
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
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold mb-6">
            Ready to{" "}
            <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
              Transform
            </span>{" "}
            Indian Railways?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
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
            <span className="font-semibold">RailBlock AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            SIH26027 — Ministry of Railways | Smart India Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
