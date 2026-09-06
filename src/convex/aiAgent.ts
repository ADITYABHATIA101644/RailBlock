"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const SYSTEM_PROMPT = `You are **RailBlock AI** — the intelligent assistant inside the RailBlock AI command center for Indian Railways.

You are a real AI assistant powered by OpenAI. You can answer ANY question — not just railway ones. You are helpful, knowledgeable, and conversational.

**Indian Railways expertise:**
- 68,000+ km of track, 17 zones, 70+ divisions
- Block types: Full, Single Line, Power (OHE), Short Duration
- Departments: P-Way, S&T, OHE, Safety, Bridge
- Acronyms: TRC, USFD, OHE, G&SR, CRS, DOM, DRM, SSE, JE
- Zones: NR, NCR, NER, NFR, ER, SECR, SCR, SWR, SR, CR, WCR, WR, NWR, SER, ECR, ECoR, Metro
- Safety: 15-min buffer, no overlapping blocks, emergency blocks bypass SLA

**App features you know about:**
Dashboard, GIS Map (all 17 zones, 90+ stations), Live Trains, Block Requests, AI Recommendations, Simulation, Approvals, Analytics, Asset Health, Chat with you.

**Response style:**
- Answer ANY question helpfully
- Use markdown formatting (bold, bullets)
- Be conversational and professional
- If you don't know, say so honestly
- For safety-critical railway decisions, remind that human approval is required`;

/** Local fallback — generates decent responses when OpenAI is unavailable */
function localFallback(messages: { role: string; content: string }[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = lastUser?.content?.toLowerCase() || "";

  if (/^(hi|hello|hey|help|namaste)/i.test(q)) {
    return `Hello! I'm **RailBlock AI**. I'm currently running in local mode because the AI service hit a rate limit. I can still help with basic questions about the app and Indian Railways. Try asking me about blocks, trains, or the dashboard!`;
  }
  if (/block.*(status|show|list|pending)/i.test(q) || /show.*(block)/i.test(q)) {
    return `**Current Blocks (Delhi Division):**\n\n✅ BLK-0847 — P-Way, Delhi–Nizamuddin, 02:00–05:00 (Approved)\n✅ BLK-0848 — S&T, Mathura–Agra, 01:30–04:30 (Approved)\n⏳ BLK-0849 — OHE, Agra Cantt, 23:00–02:00 (Pending)\n⏳ BLK-0850 — P-Way, Delhi–Ghaziabad, 00:00–03:00 (Pending)\n🔴 BLK-0851 — S&T, Ghaziabad–Meerut (Conflict detected)\n\n**5 blocks total** — 2 pending, 1 conflict. Open the **Approvals** tab to manage them.`;
  }
  if (/conflict/i.test(q)) {
    return `**Active Conflict:**\n• BLK-0851 (S&T, Ghaziabad–Meerut) overlaps with BLK-0849 corridor\n• **AI Resolution:** Combine into joint block 01:30–05:00 — saves 1hr, reduces impact 35%\n\nGo to **AI Recommendations** tab to accept or modify this resolution.`;
  }
  if (/asset.*(health|status)/i.test(q) || /maintenance/i.test(q)) {
    return `**Critical Assets:**\n🔴 Track KM 120-145: Health **62/100** — rail wear, lateral displacement 4.2mm\n🔴 Bridge B-12 Chambal: Health **55/100** — pier deterioration\n🟡 Signal LM-245: Health **78/100** — ageing relay\n\nVisit **Asset Health** tab for full breakdown.`;
  }
  if (/simulat|what.?if/i.test(q)) {
    return `**Simulation:** BLK-0849 at 23:00–02:00 → 2 trains affected, ~8 min delay, 91% utilization, 87% success probability.\n\nCheck the **Simulation** tab to run your own scenarios.`;
  }
  if (/approv|pending|sla/i.test(q)) {
    return `**Approval Queue:** 4 pending requests. BLK-0849 (SLA 2h15m ⚠️ urgent), BLK-0850 (SLA 5h30m), BLK-0851 (conflict), BLK-0852 (SLA 1h45m ⚠️).\n\nGo to **Approvals** tab to review and act.`;
  }
  if (/analytic|metric|kpi|utilization/i.test(q)) {
    return `**Analytics:** Utilization 87% (↑2%), Blocks planned 67 (↑8%), Delays 145 min (↓12%), Conflicts 2 (↓60%). Target 90% by Oct 2026.\n\nSee **Analytics** tab for full charts.`;
  }
  if (/train|live|running/i.test(q)) {
    return `**Live Trains:**\n🚂 12951 Mumbai Rajdhani — 130 km/h, RT\n🚂 12002 Bhopal Shatabdi — 145 km/h, 15M delay\n🚂 12050 Gatimaan — 160 km/h, RT\n🚂 12301 Howrah Rajdhani — 120 km/h, 42M delay\n\nGo to **Live Trains** tab for full search.`;
  }
  if (/what.*can.*do|feature|help.*app/i.test(q)) {
    return `**RailBlock AI Features:**\n• **Dashboard** — KPIs, charts, alerts\n• **Live Trains** — Real-time Indian Railways data\n• **GIS Map** — All 17 zones, 90+ stations\n• **Block Requests** — Create with AI optimization\n• **AI Recommendations** — Ranked options with explainability\n• **Simulation** — What-if scenarios\n• **Approvals** — SLA-tracked workflow\n• **Analytics** — Performance metrics\n• **Asset Health** — Track/signal/OHE/bridge scores`;
  }
  return `I'm currently in **local mode** (AI rate limit reached). I can answer basic questions about the app and railway data. Try asking about:\n• "Show pending blocks"\n• "Check conflicts"\n• "Asset health"\n• "What can this app do?"\n\nThe full AI will resume once the rate limit resets.`;
}

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
      return localFallback(args.messages);
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...args.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Model fallback chain: gpt-4o-mini → gpt-3.5-turbo → local
    const models = ["gpt-4o-mini", "gpt-3.5-turbo"];

    for (const model of models) {
      // Retry up to 2 times per model
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            // Wait before retry (1s, 2s)
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: 1500,
              temperature: 0.7,
            }),
          });

          if (response.status === 429) {
            // Rate limited — try next model or local fallback
            console.warn(`Rate limited on ${model} (attempt ${attempt + 1})`);
            break; // move to next model
          }

          if (!response.ok) {
            const err = await response.text().catch(() => "");
            console.warn(`OpenAI ${model} error ${response.status}: ${err.slice(0, 200)}`);
            continue; // retry
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        } catch (e) {
          console.warn(`OpenAI ${model} exception:`, e);
          continue;
        }
      }
    }

    // All API attempts exhausted — use local fallback
    console.warn("All OpenAI models exhausted, using local fallback");
    return localFallback(args.messages);
  },
});
