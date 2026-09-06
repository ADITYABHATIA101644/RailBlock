import { useState, useRef, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Bot,
  Send,
  X,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Shield,
  Sparkles,
  Copy,
  Wifi,
  WifiOff,
} from "lucide-react";

/* ===== Types ===== */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isReal?: boolean;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
}

/* ===== Local fallback responses when API key is missing ===== */
function generateLocalResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  if (/^(hi|hello|hey|help|namaste)/i.test(lower)) {
    return `Hello! I'm **RailBlock AI**. I can help with block planning, conflict detection, asset health, and railway operations. The real AI engine is being configured — I'm running in local mode right now. Ask me anything about the system!`;
  }

  if (/block.*(status|show|list|pending)/i.test(lower) || /show.*(block)/i.test(lower)) {
    return `**Current Blocks (Delhi Division):**

✅ **BLK-0847** — P-Way, Delhi–Nizamuddin, 02:00–05:00 (Approved)
✅ **BLK-0848** — S&T, Mathura–Agra, 01:30–04:30 (Approved)
⏳ **BLK-0849** — OHE, Agra Cantt, 23:00–02:00 (Pending)
⏳ **BLK-0850** — P-Way, Delhi–Ghaziabad, 00:00–03:00 (Pending)
🔴 **BLK-0851** — S&T, Ghaziabad–Meerut, 03:00–06:00 (Conflict)

**Total: 5 blocks** in the next 24 hours. 2 pending, 1 conflict.`;
  }

  if (/conflict|clash|overlap/i.test(lower)) {
    return `**Active Conflict — CF-001:**
• BLK-0847 (P-Way, Delhi–Nizamuddin) overlaps corridor with BLK-0849 (OHE, Agra Cantt)
• **AI Resolution:** Combine into joint block 01:30–05:00, saves 1hr setup, reduces traffic impact by 35%.
• Risk: Low — both work types compatible at this section.`;
  }

  if (/asset.*(health|status)/i.test(lower) || /maintenance/i.test(lower)) {
    return `**Asset Health — Critical:**
🔴 Track KM 120-145: Health **62/100** — rail wear threshold, TRC detected lateral displacement 4.2mm
🔴 Bridge B-12 Chambal: Health **55/100** — pier deterioration, crack 0.3mm > limit
🟡 Signal LM-245: Health **78/100** — ageing relay

**Recommendation:** Schedule immediate block for KM 120-145 within 7 days.`;
  }

  if (/simulat|what.?if|impact|delay/i.test(lower)) {
    return `**Simulation — BLK-0849:**
• Window: 23:00–02:00 → 2 trains affected, ~8 min total delay
• Block utilization: 91% (2h40m estimated)
• Monte Carlo (1000 runs): 87% complete within window, ±12 min variance
• **AI Confidence: 94%** — this window is optimal.`;
  }

  if (/approv|pending|sla/i.test(lower)) {
    return `**Approval Queue (4 pending):**
1. BLK-0849 — SLA 2h15m ⚠️ URGENT
2. BLK-0850 — SLA 5h30m
3. BLK-0851 — SLA 8h (has conflict)
4. BLK-0852 — SLA 1h45m ⚠️ URGENT, AI confidence 96%

Today: 8 approved, avg time 3.2h.`;
  }

  if (/analytic|metric|kpi|utilization/i.test(lower)) {
    return `**Analytics — Aug 2026:**
• Utilization: 87% (↑2%, target 90%)
• Blocks planned: 67 (↑8%)
• Delays: 145 min (↓12%)
• Conflicts: 2 (↓60%)
• P-Way: 87%, S&T: 78%, OHE: 82% utilization
• Prediction: Hit 90% target by Oct 2026.`;
  }

  if (/train|running|traffic|schedule/i.test(lower)) {
    return `**Live Trains:**
🚂 12951 Mumbai Rajdhani — near Nizamuddin, 130 km/h
🚂 12002 Bhopal Shatabdi — near Faridabad, 145 km/h
🚂 12260 Swarna Jayanti — near Mathura, 110 km/h
🚂 12050 Gatimaan Express — near Agra, 160 km/h

**Traffic Density:**
23:00–02:00: Low (0.3 trains/hr) — Best block window
05:00–08:00: Rising (3.5 trains/hr) — Avoid blocks`;
  }

  if (/thank|thanks|good|great/i.test(lower)) {
    return `You're welcome! I'm here to help with block planning, conflicts, assets, analytics, and more. Just ask!`;
  }

  return `I understand you're asking about "${input}". I can help with blocks, conflicts, assets, approvals, simulations, analytics, and train status. Try asking something specific like "show pending blocks" or "check conflicts".`;
}

/* ===== Component ===== */
export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState<"unknown" | "connected" | "local">("unknown");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatAction = useAction(api.aiAgent.chat);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome to **RailBlock AI**! 🚂

I'm your intelligent assistant powered by real AI. I can help you with:

• **Block Planning** — analyze, create, or optimize maintenance blocks
• **Conflict Detection** — find and resolve scheduling conflicts
• **Asset Health** — check status and predict maintenance needs
• **Simulations** — run what-if scenarios on block proposals
• **Approvals** — review pending requests and SLA status
• **Analytics** — query performance metrics and trends
• **Live Train Data** — check running status across Indian Railways

What would you like to do?`,
          timestamp: new Date(),
          isReal: apiStatus === "connected",
          actions: [
            { label: "Show pending blocks", icon: Clock, onClick: () => {} },
            { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
            { label: "Asset health report", icon: BarChart3, onClick: () => {} },
          ],
        },
      ]);
    }
  }, [isOpen, messages.length, apiStatus]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Try real AI via Convex action
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await chatAction({ messages: conversationHistory });

      if (apiStatus === "unknown") setApiStatus("connected");

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        isReal: true,
        actions: getDefaultActions(query),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Fallback to local responses
      console.warn("AI API unavailable, using local fallback:", error);
      if (apiStatus === "unknown") setApiStatus("local");

      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

      const localResponse = generateLocalResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: localResponse,
        timestamp: new Date(),
        isReal: false,
        actions: getDefaultActions(query),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  const getDefaultActions = (query: string): ChatAction[] => {
    const lower = query.toLowerCase();
    if (/block|status|list/i.test(lower)) {
      return [
        { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
        { label: "Run AI optimization", icon: Sparkles, onClick: () => {} },
      ];
    }
    if (/conflict/i.test(lower)) {
      return [
        { label: "Accept resolution", icon: CheckCircle2, onClick: () => {} },
        { label: "Run simulation", icon: BarChart3, onClick: () => {} },
      ];
    }
    return [
      { label: "Show pending blocks", icon: Clock, onClick: () => {} },
      { label: "Check conflicts", icon: AlertTriangle, onClick: () => {} },
      { label: "Asset health", icon: BarChart3, onClick: () => {} },
    ];
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

  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      let processed: React.ReactNode[] = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) processed.push(line.slice(lastIndex, match.index));
        processed.push(<strong key={`b-${i}-${match.index}`} className="font-semibold text-foreground">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) processed.push(line.slice(lastIndex));
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
          <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.1)" }}>
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">RailBlock AI</div>
              <div className="flex items-center gap-1.5">
                {apiStatus === "connected" ? (
                  <>
                    <Wifi className="w-3 h-3 text-chart-3" />
                    <span className="text-[10px] text-chart-3">AI Online — OpenAI GPT-4o</span>
                  </>
                ) : apiStatus === "local" ? (
                  <>
                    <WifiOff className="w-3 h-3 text-chart-4" />
                    <span className="text-[10px] text-chart-4">Local Mode — API key not found</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px]" style={{ color: "oklch(0.65 0 0)" }}>Connecting...</span>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "rounded-bl-md"
                  }`}
                  style={msg.role === "assistant" ? { background: "oklch(0.18 0.03 250 / 0.8)", border: "1px solid oklch(1 0 0 / 0.08)" } : {}}
                >
                  <div
                    className={`text-sm leading-relaxed ${msg.role === "user" ? "text-primary-foreground" : ""}`}
                    style={msg.role === "assistant" ? { color: "oklch(0.85 0 0)" } : {}}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/50" : ""}`}
                    style={msg.role === "assistant" ? { color: "oklch(0.45 0 0)" } : {}}
                  >
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.isReal !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${msg.isReal ? "bg-chart-3/15 text-chart-3" : "bg-chart-4/15 text-chart-4"}`}>
                        {msg.isReal ? "GPT-4o" : "Local"}
                      </span>
                    )}
                  </div>

                  {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.actions.map((action, ai) => (
                        <button
                          key={ai}
                          onClick={() => handleSend(action.label)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                          style={{ background: "oklch(0.75 0.15 55 / 0.12)", color: "oklch(0.75 0.15 55)", border: "1px solid oklch(0.75 0.15 55 / 0.2)" }}
                        >
                          <action.icon className="w-3 h-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

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

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "oklch(0.18 0.03 250 / 0.8)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] ml-1" style={{ color: "oklch(0.50 0 0)" }}>
                      {apiStatus === "connected" ? "Thinking..." : "Processing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length > 0 && !isTyping && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
              {["Show pending blocks", "Check conflicts", "Asset health", "Live trains", "Run simulation"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                  style={{ background: "oklch(0.75 0.15 55 / 0.08)", color: "oklch(0.75 0.15 55)", border: "1px solid oklch(0.75 0.15 55 / 0.15)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid oklch(1 0 0 / 0.1)" }}>
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.1)" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={apiStatus === "connected" ? "Ask about blocks, assets, trains..." : "Ask anything (local mode)..."}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: input.trim() ? "oklch(0.75 0.15 55)" : "transparent", color: input.trim() ? "oklch(0.15 0 0)" : "oklch(0.50 0 0)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[9px]" style={{ color: "oklch(0.40 0 0)" }}>
                {apiStatus === "connected" ? "Powered by OpenAI GPT-4o • Railway domain intelligence" : "Local mode • Add OPENAI_API_KEY to enable full AI"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
