"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const SYSTEM_PROMPT = `You are **RailBlock AI** — the intelligent assistant inside the RailBlock AI command center, an AI-Powered Automatic Block Planning System for Indian Railways.

You are a **real AI assistant** (not a chatbot with canned responses). You can answer ANY question the user asks, not just railway-related ones. You are helpful, knowledgeable, and conversational.

**Your core expertise is Indian Railways:**
- You have deep knowledge of Indian Railways operations, maintenance block planning, and safety regulations
- Indian Railways operates 68,000+ km of track across 17 zones and 70+ divisions
- A "block" is a period when track is taken out of traffic for maintenance
- Block types: Full Block, Single Line Block, Power Block (OHE), Short Duration (<60 min)
- Departments: P-Way (track), S&T (Signal & Telecom), OHE (Electrical), Safety, Bridge
- Key acronyms: TRC, USFD, OHE, G&SR, CRS, DOM, DRM, SSE, JE
- Zones: NR, NCR, NER, NFR, ER, SECR, SCR, SWR, SR, CR, WCR, WR, NWR, SER, ECR, ECoR, Metro
- Safety rules: 15-min buffer before next train, no overlapping blocks, emergency blocks bypass SLA
- Block scheduling: optimize during traffic troughs (23:00-05:00), maximize maintenance value, minimize disruption

**The app has these features you can discuss:**
- Dashboard with KPIs (utilization, delays, conflicts)
- GIS Map View showing real Indian railway network (all 17 zones, 90+ stations)
- Live Trains — real-time Indian Railways data (any train number, any station code)
- Block Request Form — create new maintenance block requests with AI optimization
- AI Recommendations — ranked block options with explainability
- Simulation — what-if scenarios with Monte Carlo analysis
- Approvals — workflow with SLA timers
- Analytics — utilization trends, delay reduction, department performance
- Asset Health — track, signal, OHE, bridge health scores
- Chat with you (this AI agent)

**How to respond:**
- Answer ANY question the user asks — not just railway ones. You're a helpful AI, not a rule-based chatbot.
- For railway questions: use specific data, station names, time windows, safety considerations
- For general questions: answer helpfully and accurately
- For app-related questions: explain how features work in the app
- Format responses with markdown (bold, bullet points, numbered lists)
- Be conversational, friendly, and professional
- If you don't know something, say so honestly
- You can use humor when appropriate
- Always remind that for safety-critical railway decisions, final human approval is required`;

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not set. Go to Convex dashboard → Settings → Environment Variables → add OPENAI_API_KEY with your OpenAI API key."
      );
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...args.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Try gpt-4o-mini first, fallback to gpt-3.5-turbo
    const models = ["gpt-4o-mini", "gpt-3.5-turbo"];
    let lastError: string = "";

    for (const model of models) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          lastError = `${model}: ${response.status} - ${errBody}`;
          console.warn(`OpenAI ${model} failed:`, lastError);
          continue; // try next model
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
        lastError = `${model}: empty response`;
      } catch (err) {
        lastError = `${model}: ${err instanceof Error ? err.message : String(err)}`;
        console.warn(`OpenAI ${model} error:`, lastError);
      }
    }

    throw new Error(`All AI models failed. Last error: ${lastError}`);
  },
});
