import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Train,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Map,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  Copy,
} from "lucide-react";

/* ===== Types ===== */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
}

/* ===== Mock railway data for context-aware responses ===== */
const mockBlocks = [
  { id: "BLK-0847", section: "Delhi–Nizamuddin", dept: "P-Way", status: "approved", window: "02:00–05:00" },
  { id: "BLK-0848", section: "Mathura–Agra", dept: "S&T", status: "approved", window: "01:30–04:30" },
  { id: "BLK-0849", section: "Agra Cantt", dept: "OHE", status: "pending", window: "23:00–02:00" },
  { id: "BLK-0850", section: "Delhi–Ghaziabad", dept: "P-Way", status: "pending", window: "00:00–03:00" },
  { id: "BLK-0851", section: "Ghaziabad–Meerut", dept: "S&T", status: "conflict", window: "03:00–06:00" },
];

const mockAssets = [
  { id: "AST-001", name: "Track KM 0-8", health: 92, trend: "stable" },
  { id: "AST-002", name: "Track KM 120-145", health: 62, trend: "declining" },
  { id: "AST-003", name: "Signal LM-245", health: 78, trend: "declining" },
  { id: "AST-004", name: "OHE KM 145-160", health: 85, trend: "stable" },
  { id: "AST-005", name: "Bridge B-12", health: 55, trend: "declining" },
];

/* ===== AI Response Engine ===== */
function generateResponse(input: string): { content: string; actions?: ChatAction[] } {
  const lower = input.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|namaste|help)/i.test(lower)) {
    return {
      content: `Hello! I'm **RailBlock AI Assistant**, your intelligent command center companion. I can help you with:

• **Block Planning** — analyze, create, or optimize maintenance blocks
• **Conflict Detection** — find and resolve scheduling conflicts
• **Asset Health** — check status and predict maintenance needs
• **Simulations** — run what-if scenarios on block proposals
• **Approvals** — review pending requests and SLA status
• **Analytics** — query performance metrics and trends

What would you like to do?`,
      actions: [
        { label: "Show pending blocks", icon: Clock, onClick: () => {} },
        { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
        { label: "Asset health report", icon: BarChart3, onClick: () => {} },
      ],
    };
  }

  // Block status queries
  if (/block.*(status|show|list|pending|upcoming|active|current)/i.test(lower) || /show.*(block|blocks)/i.test(lower) || /what.*block/i.test(lower)) {
    const approved = mockBlocks.filter((b) => b.status === "approved");
    const pending = mockBlocks.filter((b) => b.status === "pending");
    const conflict = mockBlocks.filter((b) => b.status === "conflict");

    return {
      content: `Here's the current block status for **Delhi Division**:

**✅ Approved (${approved.length})**
${approved.map((b) => `• **${b.id}** — ${b.section} (${b.dept}) — ${b.window}`).join("\n")}

**⏳ Pending (${pending.length})**
${pending.map((b) => `• **${b.id}** — ${b.section} (${b.dept}) — ${b.window}`).join("\n")}

**🔴 Conflict (${conflict.length})**
${conflict.map((b) => `• **${b.id}** — ${b.section} (${b.dept}) — ${b.window}`).join("\n")}

**Total: ${mockBlocks.length} blocks** in the next 24 hours. 2 pending approval, 1 conflict detected.`,
      actions: [
        { label: "Resolve conflicts", icon: AlertTriangle, onClick: () => {} },
        { label: "Approve pending", icon: CheckCircle2, onClick: () => {} },
      ],
    };
  }

  // Conflict queries
  if (/conflict|clash|overlap|resolution|resolve/i.test(lower)) {
    return {
      content: `I detected **1 active conflict** in the current schedule:

**⚠️ CF-001: Corridor Overlap**
• **Block A:** BLK-0847 (P-Way, Delhi–Nizamuddin, 02:00–05:00)
• **Block B:** BLK-0849 (OHE, Nizamuddin–Faridabad, 23:00–02:00)
• **Type:** Corridor overlap at Nizamuddin junction
• **Severity:** High

**🤖 AI Resolution:**
Combine into a **joint block** (P-Way + OHE) from 01:30–05:00. This saves 1 hour of separate setup time and reduces total traffic impact by **35%**. Both departments can work simultaneously with proper safety coordination.

**Risk Assessment:** Low — both work types are compatible at this section. Historical data shows 3 similar joint blocks completed successfully this quarter.`,
      actions: [
        { label: "Accept resolution", icon: CheckCircle2, onClick: () => {} },
        { label: "Run simulation", icon: Brain, onClick: () => {} },
      ],
    };
  }

  // Asset health queries
  if (/asset.*(health|status|score|report|check)/i.test(lower) || /health.*(asset|track|signal|bridge|ohe)/i.test(lower) || /maintenance.*(need|required|upcoming|predict)/i.test(lower)) {
    const critical = mockAssets.filter((a) => a.health < 65);
    const warning = mockAssets.filter((a) => a.health >= 65 && a.health < 80);

    return {
      content: `**Asset Health Report — Delhi Division**

**🔴 Critical (< 65)**
${critical.map((a) => `• **${a.name}** (${a.id}) — Health: **${a.health}/100** — Trend: ${a.trend}`).join("\n")}

**🟡 Warning (65–80)**
${warning.map((a) => `• **${a.name}** (${a.id}) — Health: **${a.health}/100** — Trend: ${a.trend}`).join("\n")}

**🟢 Healthy (> 80)**
${mockAssets.filter((a) => a.health >= 80).map((a) => `• **${a.name}** (${a.id}) — Health: **${a.health}/100** — Trend: ${a.trend}`).join("\n")}

**🚨 Priority Alert:** Track segment KM 120-145 (health: 62) is approaching critical threshold. TRC data shows rail wear and lateral displacement (4.2mm). **Recommend immediate block scheduling** within 7 days to prevent potential safety incident.`,
      actions: [
        { label: "Schedule block for KM 120-145", icon: Train, onClick: () => {} },
        { label: "View full asset map", icon: Map, onClick: () => {} },
      ],
    };
  }

  // Simulation queries
  if (/simulat|what.?if|scenario|impact|delay|predict|forecast/i.test(lower)) {
    return {
      content: `**What-If Simulation Results**

I analyzed the proposed block BLK-0849 (OHE, Agra Cantt, KM 178-182) in the 23:00–02:00 window:

**📊 Projected Impact:**
• **Train delays:** 2 trains affected, ~8 min total detention
• **Block utilization:** 91% (estimated work completion in 2h40m)
• **Conflict risk:** Low (no overlapping blocks in this corridor)
• **Safety buffer:** 15 min before next scheduled train

**📈 Monte Carlo Analysis (1000 runs):**
• 87% probability of completing within window
• ±12 min variance due to weather risk
• 3% chance of cascading delay to connecting services

**✅ Recommendation:** This window is optimal. Traffic density is at its lowest (0.3 trains/hr). AI confidence: **94%**.`,
      actions: [
        { label: "Approve this block", icon: Shield, onClick: () => {} },
        { label: "Compare other windows", icon: BarChart3, onClick: () => {} },
      ],
    };
  }

  // Approval queries
  if (/approv|pending|sla|review|queue|inbox/i.test(lower)) {
    return {
      content: `**Approval Queue — Current Status**

There are **4 block requests** awaiting approval:

1. **BLK-0849** — OHE, Agra Cantt — ⏰ SLA: 2h 15m remaining — **URGENT**
   Requested by: Er. Rajesh Kumar (SSE/OHE)

2. **BLK-0850** — P-Way, Delhi–Ghaziabad — ⏰ SLA: 5h 30m remaining
   Requested by: Er. Amit Singh (JE/P-Way)

3. **BLK-0851** — S&T, Ghaziabad–Meerut — ⏰ SLA: 8h 00m remaining
   Requested by: Er. Priya Verma (SSE/S&T) — ⚠️ Has conflict

4. **BLK-0852** — P-Way, Mathura–Bharatpur — ⏰ SLA: 1h 45m remaining — **URGENT**
   Requested by: Er. Vikram Joshi (AE/P-Way) — AI Confidence: 96%

**Today's stats:** 8 approved, 0 rejected, avg approval time: 3.2 hours`,
      actions: [
        { label: "Go to approvals", icon: Shield, onClick: () => {} },
        { label: "Auto-approve low risk", icon: CheckCircle2, onClick: () => {} },
      ],
    };
  }

  // Analytics queries
  if (/analytic|metric|kpi|performance|utilization|report|trend|chart|data/i.test(lower)) {
    return {
      content: `**Analytics Summary — August 2026**

**📈 Key Metrics:**
• **Block Utilization:** 87% (↑ 2% from last month, target: 90%)
• **Total Blocks Planned:** 67 (↑ 8% MoM)
• **Train Detention Minutes:** 145 (↓ 12% from July)
• **Conflicts Detected:** 2 (↓ 60% from 5 last month)
• **Planner Productivity:** 8.2 blocks/planner/day (↑ 15%)

**🏆 Department Performance:**
• P-Way: 87% utilization, 92% on-time start
• S&T: 78% utilization, 85% on-time start
• OHE: 82% utilization, 88% on-time start

**📊 Trend:** Utilization has improved from 62% in January to 87% in August. At current trajectory, we'll hit the 90% target by October 2026.

**🔮 Prediction:** Next quarter demand: ~72 blocks/month (±8). ML model accuracy: 91%.`,
      actions: [
        { label: "View detailed analytics", icon: BarChart3, onClick: () => {} },
        { label: "Export report", icon: Copy, onClick: () => {} },
      ],
    };
  }

  // Help with creating a block
  if (/creat|new|request|submit|plan|schedule|raise/i.test(lower)) {
    return {
      content: `I can help you create a new block request. Here's what I need:

**Step 1 — Section & Type**
Which railway section needs maintenance? (e.g., "Delhi–Nizamuddin KM 8-16")

**Step 2 — Work Type**
What kind of work? Options:
• Track Renewal • Ballast Cleaning • OHE Replacement
• Signal Upgradation • USFD Rectification • Emergency Breakdown

**Step 3 — AI Optimization**
Once you provide these details, I'll run the optimization engine to find the best block window considering:
✅ Traffic density forecasts
✅ Asset health scores
✅ Crew availability
✅ Conflict detection with existing blocks

Would you like me to suggest the optimal window for a specific section?`,
      actions: [
        { label: "Open block request form", icon: Train, onClick: () => {} },
        { label: "AI suggest window", icon: Brain, onClick: () => {} },
      ],
    };
  }

  // Optimization/suggestion queries
  if (/optim|suggest|recommend|best|optimal|improve/i.test(lower)) {
    return {
      content: `**AI Optimization Analysis**

Based on current conditions in Delhi Division:

**🎯 Top Recommendation:**
Schedule **Track Renewal (KM 120-145)** in the **02:00–04:45** window.

**Why this is optimal:**
1. **Asset urgency:** Health score 62/100 — below safe threshold
2. **Lowest traffic:** 0.3 trains/hr vs 6/hr daytime
3. **No conflicts:** No other blocks scheduled in this corridor
4. **Crew available:** Night shift crew confirmed (8 members)
5. **Duration estimate:** 2h45m based on 12 similar past jobs
6. **Confidence:** 94%

**Impact if delayed:** Risk of rail failure increases 15% per week. Current lateral displacement (4.2mm) is within limits but trending toward the 5mm threshold.

**Estimated savings vs daytime block:** 4 train detentions avoided, ~60 min total delay saved.`,
      actions: [
        { label: "Create this block", icon: Train, onClick: () => {} },
        { label: "Compare alternatives", icon: BarChart3, onClick: () => {} },
      ],
    };
  }

  // Safety queries
  if (/safe|safety|risk|hazard|compliance|rule|regulation|csr/i.test(lower)) {
    return {
      content: `**Safety Status — Delhi Division**

**✅ Compliance Overview:**
• All blocks maintain minimum safety buffer (15 min before next train)
• Emergency override available for breakdown blocks
• CRS (Commissioner of Railway Safety) audit trail active
• G&SR (General & Subsidiary Rules) enforced at system level

**⚠️ Active Safety Concerns:**
• **Bridge B-12 (Chambal):** Health 55/100 — pier deterioration, bearing issue, crack width 0.3mm (limit: 0.25mm). **Recommend speed restriction and urgent maintenance.**
• **Track KM 120-145:** Approaching rail wear threshold

**🔒 System Safety Features:**
• Human-in-the-loop mandatory for all block approvals
• Hard safety constraints in code (not just learned)
• Immutable audit logs for every safety decision
• Emergency blocks bypass normal SLA — immediate notification to all stakeholders`,
      actions: [
        { label: "View safety audit trail", icon: Shield, onClick: () => {} },
        { label: "Schedule emergency block", icon: AlertTriangle, onClick: () => {} },
      ],
    };
  }

  // Train status queries
  if (/train|running|traffic|schedule|timetable|railway|rail/i.test(lower)) {
    return {
      content: `**Live Train Status — Delhi Division**

**🚂 Currently Running:**
• **12951 Mumbai Rajdhani** — Near Nizamuddin, 130 km/h
• **12002 Bhopal Shatabdi** — Near Faridabad, 145 km/h
• **12260 Swarna Jayanti** — Near Mathura, 110 km/h
• **12050 Gatimaan Express** — Near Agra, 160 km/h

**📊 Traffic Density (next 6 hours):**
• 23:00–02:00: Low (0.3–0.8 trains/hr) — **Best block window**
• 02:00–05:00: Very Low (0.2 trains/hr) — **Ideal for extended blocks**
• 05:00–08:00: Rising (1.5–3.5 trains/hr) — **Avoid new blocks**

**⏰ Next Scheduled Passes through block corridors:**
• Delhi–Nizamuddin: 12951 at 00:15, 12002 at 01:30
• Agra Cantt: 12050 at 04:45`,
      actions: [
        { label: "View on map", icon: Map, onClick: () => {} },
        { label: "Check block impact", icon: AlertTriangle, onClick: () => {} },
      ],
    };
  }

  // Thank you / acknowledgment
  if (/thank|thanks|thx|good|great|perfect|nice|awesome/i.test(lower)) {
    return {
      content: `You're welcome! I'm here to help optimize your block planning. Feel free to ask me anything about:

• Current blocks and their status
• Conflict detection and resolution
• Asset health and maintenance needs
• Simulation and what-if analysis
• Performance analytics and trends
• Safety compliance

Just type your question or click one of the quick actions below.`,
      actions: [
        { label: "Show dashboard summary", icon: BarChart3, onClick: () => {} },
        { label: "Check pending approvals", icon: Shield, onClick: () => {} },
      ],
    };
  }

  // Default / fallback
  return {
    content: `I understand you're asking about "${input}". Let me help with that.

As your RailBlock AI assistant, I can assist with:

🔍 **Block Management** — "Show me pending blocks" or "What's the status of BLK-0849?"
⚠️ **Conflicts** — "Check for scheduling conflicts" or "Resolve CF-001"
🏗️ **Assets** — "Check asset health" or "Which assets need maintenance?"
📊 **Analytics** — "Show utilization metrics" or "Performance trends"
🛡️ **Approvals** — "What's in the approval queue?" or "Approve BLK-0850"
🎯 **Optimization** — "Suggest best block window for KM 120-145"
🚂 **Trains** — "Show live train status" or "Traffic density forecast"
🔒 **Safety** — "Safety compliance report" or "Check G&SR status"

Try asking me something specific!`,
    actions: [
      { label: "Show pending blocks", icon: Clock, onClick: () => {} },
      { label: "Run AI optimization", icon: Brain, onClick: () => {} },
      { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
    ],
  };
}

/* ===== Chat Agent Component ===== */
export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome to **RailBlock AI**! 🚂

I'm your intelligent assistant for the Block Planning Command Center. I can help you with:

• Analyzing and optimizing block schedules
• Detecting and resolving conflicts
• Checking asset health status
• Running what-if simulations
• Managing approvals and SLAs

What would you like to do today?`,
          timestamp: new Date(),
          actions: [
            { label: "Show pending blocks", icon: Clock, onClick: () => {} },
            { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
            { label: "Asset health report", icon: BarChart3, onClick: () => {} },
          ],
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    // Generate response
    const { content, actions } = generateResponse(query);
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date(),
      actions,
    };
    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content.replace(/\*\*/g, "").replace(/\n/g, "\n"));
  };

  /* Simple markdown-ish renderer */
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold
      let processed: React.ReactNode[] = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          processed.push(line.slice(lastIndex, match.index));
        }
        processed.push(<strong key={`b-${i}-${match.index}`} className="font-semibold text-foreground">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        processed.push(line.slice(lastIndex));
      }
      if (processed.length === 0) processed.push(line);

      return (
        <span key={i}>
          {processed}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-background border border-border rotate-0"
            : "bg-primary hover:bg-primary/90 hover:scale-110 hover:shadow-[0_0_30px_oklch(0.75_0.15_55_/_0.4)]"
        }`}
        style={isOpen ? {} : {}}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-chart-3 border-2 border-primary animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{
            background: "linear-gradient(180deg, oklch(0.14 0.03 250) 0%, oklch(0.10 0.025 250) 100%)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            boxShadow: "0 25px 80px oklch(0 0 0 / 0.5), 0 0 40px oklch(0.75 0.15 55 / 0.08)",
            height: "560px",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3 shrink-0"
            style={{ borderBottom: "1px solid oklch(1 0 0 / 0.1)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">RailBlock AI</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
                <span className="text-[10px]" style={{ color: "oklch(0.65 0 0)" }}>Always online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "rounded-bl-md"
                  }`}
                  style={
                    msg.role === "assistant"
                      ? {
                          background: "oklch(0.18 0.03 250 / 0.8)",
                          border: "1px solid oklch(1 0 0 / 0.08)",
                        }
                      : {}
                  }
                >
                  <div
                    className={`text-sm leading-relaxed ${
                      msg.role === "user" ? "text-primary-foreground" : ""
                    }`}
                    style={msg.role === "assistant" ? { color: "oklch(0.85 0 0)" } : {}}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] mt-1.5 ${
                      msg.role === "user" ? "text-primary-foreground/50" : ""
                    }`}
                    style={msg.role === "assistant" ? { color: "oklch(0.45 0 0)" } : {}}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Action buttons for AI messages */}
                  {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.actions.map((action, ai) => (
                        <button
                          key={ai}
                          onClick={() => handleSend(action.label)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                          style={{
                            background: "oklch(0.75 0.15 55 / 0.12)",
                            color: "oklch(0.75 0.15 55)",
                            border: "1px solid oklch(0.75 0.15 55 / 0.2)",
                          }}
                        >
                          <action.icon className="w-3 h-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Copy button for AI messages */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="mt-2 flex items-center gap-1 text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                      style={{ color: "oklch(0.50 0 0)" }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3"
                  style={{
                    background: "oklch(0.18 0.03 250 / 0.8)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (when no input) */}
          {messages.length > 0 && !isTyping && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
              {["Show pending blocks", "Check conflicts", "Asset health", "Run simulation"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                  style={{
                    background: "oklch(0.75 0.15 55 / 0.08)",
                    color: "oklch(0.75 0.15 55)",
                    border: "1px solid oklch(0.75 0.15 55 / 0.15)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="px-4 py-3 shrink-0"
            style={{ borderTop: "1px solid oklch(1 0 0 / 0.1)" }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{
                background: "oklch(1 0 0 / 0.05)",
                border: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about blocks, assets, conflicts..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? "oklch(0.75 0.15 55)" : "transparent",
                  color: input.trim() ? "oklch(0.15 0 0)" : "oklch(0.50 0 0)",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[9px]" style={{ color: "oklch(0.40 0 0)" }}>
                Powered by RailBlock AI • Railway domain intelligence
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
