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
  AlertCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
}

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatAction = useAction(api.aiAgent.chat);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hey there! 👋 I'm **RailBlock AI**, your intelligent assistant powered by real OpenAI GPT-4o.

I can help you with literally anything — not just railway stuff. Ask me about:

🚂 **Indian Railways** — block planning, safety rules, zones, stations, live trains
📊 **The app** — dashboard, map, approvals, analytics, asset health
🧠 **Anything else** — general knowledge, coding help, math, explanations

Try asking me something like:
• "What is a railway block and why is it important?"
• "How do I create a new block request?"
• "Tell me about the Delhi-Mumbai corridor"
• "What's 2+2?" (yes, I can do that too!)

What would you like to know?`,
        timestamp: new Date(),
        actions: [
          { label: "What is a railway block?", icon: Clock, onClick: () => {} },
          { label: "How does the AI optimizer work?", icon: Sparkles, onClick: () => {} },
          { label: "Show me the app features", icon: BarChart3, onClick: () => {} },
        ],
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const conversationHistory = [...messages, userMsg]
        .filter((m) => !m.isError) // don't send error messages to AI
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await chatAction({ messages: conversationHistory });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        actions: getDefaultActions(query),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      let userFriendlyMsg = "";

      if (errorMsg.includes("OPENAI_API_KEY")) {
        userFriendlyMsg = `🔑 **API Key Not Configured**

To use the real AI agent, you need to add your OpenAI API key:

1. Go to **Convex Dashboard** → Your Project → **Settings**
2. Navigate to **Environment Variables**
3. Add: \`OPENAI_API_KEY\` = your OpenAI key (starts with sk-)
4. Save and try again

Your OpenAI key gives you access to GPT-4o-mini which powers this assistant.`;
      } else if (errorMsg.includes("401")) {
        userFriendlyMsg = `🔑 **Invalid API Key**

Your OpenAI API key appears to be invalid or expired. Please:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Check your API keys
3. Generate a new key if needed
4. Update it in Convex dashboard → Settings → Environment Variables`;
      } else if (errorMsg.includes("429")) {
        userFriendlyMsg = `⏱️ **Rate Limit Hit**

OpenAI API rate limit reached. Please wait a moment and try again. If this persists, check your OpenAI usage at platform.openai.com.`;
      } else {
        userFriendlyMsg = `⚠️ **AI Engine Error**

${errorMsg}

This might be a temporary issue. Please try again in a moment.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: userFriendlyMsg,
        timestamp: new Date(),
        isError: true,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  const getDefaultActions = (query: string): ChatAction[] => {
    const lower = query.toLowerCase();
    if (/block|request|create/i.test(lower)) return [
      { label: "How to create a block?", icon: Clock, onClick: () => {} },
      { label: "What are block types?", icon: Shield, onClick: () => {} },
    ];
    if (/conflict/i.test(lower)) return [
      { label: "How to resolve conflicts?", icon: CheckCircle2, onClick: () => {} },
      { label: "Explain conflict detection", icon: AlertTriangle, onClick: () => {} },
    ];
    if (/train|live|status/i.test(lower)) return [
      { label: "How does live tracking work?", icon: BarChart3, onClick: () => {} },
    ];
    return [
      { label: "Tell me about this app", icon: BarChart3, onClick: () => {} },
      { label: "What can you do?", icon: Sparkles, onClick: () => {} },
      { label: "Indian Railways facts", icon: Shield, onClick: () => {} },
    ];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
      return <span key={i}>{processed}{i < lines.length - 1 && <br />}</span>;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-background border border-border" : "bg-primary hover:bg-primary/90 hover:scale-110 hover:shadow-[0_0_30px_oklch(0.75_0.15_55_/_0.4)]"
        }`}
      >
        {isOpen ? <X className="w-5 h-5 text-foreground" /> : (
          <div className="relative">
            <Bot className="w-6 h-6 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-chart-3 border-2 border-primary animate-pulse" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ background: "linear-gradient(180deg, oklch(0.14 0.03 250) 0%, oklch(0.10 0.025 250) 100%)", border: "1px solid oklch(1 0 0 / 0.12)", boxShadow: "0 25px 80px oklch(0 0 0 / 0.5)", height: "560px" }}>
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.1)" }}>
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">RailBlock AI</div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-chart-3" />
                <span className="text-[10px] text-chart-3">Real AI — OpenAI GPT-4o</span>
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
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "rounded-bl-md"}`}
                  style={msg.role === "assistant" ? {
                    background: msg.isError ? "oklch(0.18 0.03 250 / 0.8)" : "oklch(0.18 0.03 250 / 0.8)",
                    border: msg.isError ? "1px solid oklch(0.65 0.22 25 / 0.3)" : "1px solid oklch(1 0 0 / 0.08)",
                  } : {}}>
                  <div className={`text-sm leading-relaxed ${msg.role === "user" ? "text-primary-foreground" : ""}`}
                    style={msg.role === "assistant" ? { color: "oklch(0.85 0 0)" } : {}}>
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/50" : ""}`}
                    style={msg.role === "assistant" ? { color: "oklch(0.45 0 0)" } : {}}>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.isError ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-destructive/15 text-destructive flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Error
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-chart-3/15 text-chart-3">GPT-4o</span>
                    )}
                  </div>
                  {msg.role === "assistant" && !msg.isError && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.actions.map((action, ai) => (
                        <button key={ai} onClick={() => handleSend(action.label)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                          style={{ background: "oklch(0.75 0.15 55 / 0.12)", color: "oklch(0.75 0.15 55)", border: "1px solid oklch(0.75 0.15 55 / 0.2)" }}>
                          <action.icon className="w-3 h-3" />{action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.role === "assistant" && !msg.isError && (
                    <button onClick={() => copyMessage(msg.content)} className="mt-2 flex items-center gap-1 text-[10px] opacity-0 hover:opacity-100 transition-opacity" style={{ color: "oklch(0.50 0 0)" }}>
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
                    <span className="text-[10px] ml-1" style={{ color: "oklch(0.50 0 0)" }}>Thinking with GPT-4o...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length > 0 && !isTyping && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
              {["What is a railway block?", "How does the AI work?", "Tell me about Indian Railways", "What can this app do?"].map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                  style={{ background: "oklch(0.75 0.15 55 / 0.08)", color: "oklch(0.75 0.15 55)", border: "1px solid oklch(0.75 0.15 55 / 0.15)" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid oklch(1 0 0 / 0.1)" }}>
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.1)" }}>
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask me anything — railway, app, or general..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" disabled={isTyping} />
              <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: input.trim() ? "oklch(0.75 0.15 55)" : "transparent", color: input.trim() ? "oklch(0.15 0 0)" : "oklch(0.50 0 0)" }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[9px]" style={{ color: "oklch(0.40 0 0)" }}>
                Real AI by OpenAI GPT-4o • Ask anything
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
