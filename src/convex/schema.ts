import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Railway RBAC roles mapped to real-world positions
export const ROLES = {
  ADMIN: "admin",           // DRM / Divisional Railway Manager
  APPROVER: "approver",     // Sr. DOM / Section Controller
  PLANNER: "planner",       // Section Engineer / P-Way
  FIELD: "field",           // Field Crew / Gang Supervisor
  VIEWER: "viewer",         // Safety Officer / Auditor
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.APPROVER),
  v.literal(ROLES.PLANNER),
  v.literal(ROLES.FIELD),
  v.literal(ROLES.VIEWER),
);
export type Role = Infer<typeof roleValidator>;

// Permission sets per role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ["*"], // all permissions
  approver: ["blocks.approve", "blocks.reject", "blocks.view", "conflicts.resolve", "analytics.view", "assets.view"],
  planner: ["blocks.create", "blocks.view", "ai.view", "simulations.run", "assets.view"],
  field: ["blocks.execute", "blocks.start_end", "checklists.submit", "gps.track"],
  viewer: ["blocks.view", "analytics.view", "assets.view", "audit.view"],
};

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // Enhanced users table with security fields
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),

      // RBAC
      role: v.optional(roleValidator),
      department: v.optional(v.string()),    // e.g. "P-Way Engineering", "Signal & Telecom"
      division: v.optional(v.string()),       // e.g. "Delhi", "Mumbai"
      zone: v.optional(v.string()),           // e.g. "NR", "CR"

      // Security fields
      passwordHash: v.optional(v.string()),
      passwordSalt: v.optional(v.string()),
      failedLoginAttempts: v.optional(v.number()),
      lockedUntil: v.optional(v.number()),       // timestamp when lock expires
      lastLoginAt: v.optional(v.number()),
      lastLoginIp: v.optional(v.string()),
      lastActivityAt: v.optional(v.number()),
      sessionVersion: v.optional(v.number()),    // incremented on password change to invalidate old sessions

      // MFA
      mfaEnabled: v.optional(v.boolean()),
      mfaSecret: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("role", ["role"])
      .index("zone", ["zone"]),

    // Audit log — immutable trail of every security-relevant action
    auditLogs: defineTable({
      userId: v.string(),
      action: v.string(),          // e.g. "auth.login", "auth.signup", "blocks.approve", "role.change"
      resource: v.optional(v.string()),   // e.g. "block:BLK-0847", "user:abc123"
      details: v.optional(v.string()),     // JSON string with extra context
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      timestamp: v.number(),
      success: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_action", ["action"])
      .index("by_timestamp", ["timestamp"]),

    // User sessions — track active sessions for security
    sessions: defineTable({
      userId: v.string(),
      token: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
      lastAccessAt: v.number(),
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      isActive: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_token", ["token"])
      .index("by_expires", ["expiresAt"]),

    // Rate limiting tracker
    rateLimits: defineTable({
      identifier: v.string(),     // e.g. "login:admin@railways.gov.in" or "ip:192.168.1.1"
      action: v.string(),         // e.g. "login", "otp_request"
      attempts: v.number(),
      windowStart: v.number(),
      blockedUntil: v.optional(v.number()),
    })
      .index("by_identifier", ["identifier", "action"]),

    // add other tables here

    // tableName: defineTable({
    //   ...
    //   // table fields
    // }).index("by_field", ["field"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
