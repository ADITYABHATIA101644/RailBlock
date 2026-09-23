import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("escalated"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled"),
);

async function writeAudit(
  ctx: MutationCtx,
  entry: {
    userId: string;
    action: string;
    resource?: string;
    details?: string;
    success?: boolean;
  },
) {
  await ctx.db.insert("auditLogs", {
    userId: entry.userId,
    action: entry.action,
    resource: entry.resource,
    details: entry.details,
    timestamp: Date.now(),
    success: entry.success ?? true,
  });
}

/** Generate a sequential-ish unique block ID */
function makeBlockId() {
  return `BLK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

// ─── CREATE ───
export const createBlockRequest = mutation({
  args: {
    section: v.string(),
    dept: v.string(),
    workType: v.string(),
    requestedBy: v.string(),
    requestedByRole: v.optional(v.string()),
    urgency: v.string(),
    blockType: v.optional(v.string()),
    window: v.string(),
    duration: v.string(),
    aiScore: v.optional(v.number()),
    aiRecommended: v.optional(v.boolean()),
    aiRationale: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const blockId = makeBlockId();
    const now = Date.now();

    await ctx.db.insert("blockRequests", {
      ...args,
      blockId,
      status: "pending",
      createdAt: now,
    });

    await writeAudit(ctx, {
      userId: args.requestedBy,
      action: "blocks.create",
      resource: `block:${blockId}`,
      details: JSON.stringify({ section: args.section, dept: args.dept, urgency: args.urgency }),
    });

    return { blockId, createdAt: now };
  },
});

// ─── LIST ───
export const listBlockRequests = query({
  args: {
    status: v.optional(statusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("blockRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit ?? 100);
    }
    return await ctx.db
      .query("blockRequests")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 100);
  },
});

export const getBlockByBlockId = query({
  args: { blockId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
  },
});

// ─── APPROVE (Sr. DOM / Approver / Admin) ───
export const approveBlock = mutation({
  args: { blockId: v.string(), decidedBy: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);
    if (block.status !== "pending" && block.status !== "escalated") {
      throw new Error(`Block ${args.blockId} is already ${block.status}`);
    }

    await ctx.db.patch(block._id, {
      status: "approved",
      decidedAt: Date.now(),
      decidedBy: args.decidedBy,
    });

    await writeAudit(ctx, {
      userId: args.decidedBy,
      action: "blocks.approve",
      resource: `block:${args.blockId}`,
      details: JSON.stringify({ section: block.section, dept: block.dept }),
    });

    return { success: true };
  },
});

// ─── REJECT ───
export const rejectBlock = mutation({
  args: { blockId: v.string(), decidedBy: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);

    await ctx.db.patch(block._id, {
      status: "rejected",
      decidedAt: Date.now(),
      decidedBy: args.decidedBy,
      rejectionReason: args.reason,
    });

    await writeAudit(ctx, {
      userId: args.decidedBy,
      action: "blocks.reject",
      resource: `block:${args.blockId}`,
      details: JSON.stringify({ reason: args.reason ?? "Not specified" }),
    });

    return { success: true };
  },
});

// ─── ESCALATE ───
export const escalateBlock = mutation({
  args: { blockId: v.string(), decidedBy: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);

    await ctx.db.patch(block._id, {
      status: "escalated",
      decidedAt: Date.now(),
      decidedBy: args.decidedBy,
    });

    await writeAudit(ctx, {
      userId: args.decidedBy,
      action: "blocks.escalate",
      resource: `block:${args.blockId}`,
      details: "Escalated to DRM for decision",
    });

    return { success: true };
  },
});

// ─── FIELD CREW: START BLOCK ───
export const startBlock = mutation({
  args: { blockId: v.string(), crewName: v.string() },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);
    if (block.status !== "approved" && block.status !== "in_progress") {
      throw new Error(`Block ${args.blockId} must be approved before starting (current: ${block.status})`);
    }

    await ctx.db.patch(block._id, {
      status: "in_progress",
      startedAt: Date.now(),
    });

    await writeAudit(ctx, {
      userId: args.crewName,
      action: "blocks.start",
      resource: `block:${args.blockId}`,
    });

    return { success: true, startedAt: Date.now() };
  },
});

// ─── FIELD CREW: COMPLETE BLOCK (safety checklist enforced) ───
export const completeBlock = mutation({
  args: {
    blockId: v.string(),
    crewName: v.string(),
    workCompletedPct: v.number(),
    safetySignoff: v.boolean(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.safetySignoff) {
      throw new Error("Safety sign-off is mandatory before completing a block (G&SR requirement)");
    }
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);
    if (block.status !== "in_progress") {
      throw new Error(`Block ${args.blockId} is not in progress (current: ${block.status})`);
    }

    await ctx.db.patch(block._id, {
      status: "completed",
      completedAt: Date.now(),
      workCompletedPct: args.workCompletedPct,
      notes: args.remarks,
    });

    await writeAudit(ctx, {
      userId: args.crewName,
      action: "blocks.complete",
      resource: `block:${args.blockId}`,
      details: JSON.stringify({ workCompletedPct: args.workCompletedPct }),
    });

    return { success: true };
  },
});

// ─── CANCEL ───
export const cancelBlock = mutation({
  args: { blockId: v.string(), decidedBy: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blockRequests")
      .withIndex("by_blockId", (q) => q.eq("blockId", args.blockId))
      .first();
    if (!block) throw new Error(`Block ${args.blockId} not found`);

    await ctx.db.patch(block._id, { status: "cancelled" });

    await writeAudit(ctx, {
      userId: args.decidedBy,
      action: "blocks.cancel",
      resource: `block:${args.blockId}`,
      details: JSON.stringify({ reason: args.reason ?? "Not specified" }),
    });

    return { success: true };
  },
});

// ─── DASHBOARD STATS (KPI cards) ───
export const getBlockStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("blockRequests").collect();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const today = all.filter((b) => b.createdAt >= dayAgo);
    const completed = all.filter((b) => b.status === "completed");
    const withPct = completed.filter((b) => typeof b.workCompletedPct === "number");

    return {
      total: all.length,
      pending: all.filter((b) => b.status === "pending").length,
      approved: all.filter((b) => b.status === "approved").length,
      inProgress: all.filter((b) => b.status === "in_progress").length,
      completed: completed.length,
      rejected: all.filter((b) => b.status === "rejected").length,
      escalated: all.filter((b) => b.status === "escalated").length,
      createdToday: today.length,
      avgUtilization:
        withPct.length > 0
          ? Math.round(withPct.reduce((sum, b) => sum + (b.workCompletedPct ?? 0), 0) / withPct.length)
          : null,
    };
  },
});
