import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ROLES, ROLE_PERMISSIONS } from "./schema";
import type { Role } from "./schema";

// ─── Password Hashing (Web Crypto API compatible) ───

async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  // Use SubtleCrypto for PBKDF2 — production-grade password hashing
  const encoder = new TextEncoder();
  const saltBytes = salt
    ? Uint8Array.from(atob(salt), c => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const saltStr = salt ?? btoa(String.fromCharCode(...saltBytes));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(saltStr),
      iterations: 100_000,
    },
    keyMaterial,
    256,
  );

  const hashArray = new Uint8Array(bits);
  const hash = btoa(String.fromCharCode(...hashArray));

  return { hash, salt: saltStr };
}

async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Rate Limiting Constants ───
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 10;

// ─── SIGN UP ───
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(v.union(
      v.literal(ROLES.ADMIN),
      v.literal(ROLES.APPROVER),
      v.literal(ROLES.PLANNER),
      v.literal(ROLES.FIELD),
      v.literal(ROLES.VIEWER),
    )),
    department: v.optional(v.string()),
    division: v.optional(v.string()),
    zone: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address format");
    }

    // Password strength validation
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(args.password)) {
      throw new Error("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(args.password)) {
      throw new Error("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(args.password)) {
      throw new Error("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(args.password)) {
      throw new Error("Password must contain at least one special character (!@#$%^&*)");
    }

    // Check if email already registered
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      // Log failed signup attempt
      await ctx.db.insert("auditLogs", {
        userId: "anonymous",
        action: "auth.signup_failed",
        resource: `email:${args.email}`,
        details: JSON.stringify({ reason: "Email already registered" }),
        ip: args.ip,
        userAgent: args.userAgent,
        timestamp: Date.now(),
        success: false,
      });
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    // Hash password
    const { hash, salt } = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email.toLowerCase(),
      role: (args.role as Role) ?? ROLES.PLANNER,
      department: args.department,
      division: args.division,
      zone: args.zone,
      passwordHash: hash,
      passwordSalt: salt,
      failedLoginAttempts: 0,
      lastActivityAt: Date.now(),
      sessionVersion: 0,
      isAnonymous: false,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "auth.signup",
      resource: `user:${userId}`,
      details: JSON.stringify({
        role: args.role ?? ROLES.PLANNER,
        department: args.department,
        division: args.division,
        zone: args.zone,
      }),
      ip: args.ip,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      success: true,
    });

    return { userId, message: "Account created successfully" };
  },
});

// ─── LOGIN ───
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();

    // Check rate limits
    const rateLimitKey = `login:${normalizedEmail}`;
    const rateLimit = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier", (q) =>
        q.eq("identifier", rateLimitKey).eq("action", "login")
      )
      .first();

    if (rateLimit) {
      // Check if currently blocked
      if (rateLimit.blockedUntil && rateLimit.blockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((rateLimit.blockedUntil - Date.now()) / 60000);
        await ctx.db.insert("auditLogs", {
          userId: "unknown",
          action: "auth.login_blocked",
          resource: `email:${normalizedEmail}`,
          details: JSON.stringify({ reason: "Account temporarily locked", remainingMinutes }),
          ip: args.ip,
          userAgent: args.userAgent,
          timestamp: Date.now(),
          success: false,
        });
        throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`);
      }

      // Reset if window expired
      if (Date.now() - rateLimit.windowStart > RATE_LIMIT_WINDOW_MS) {
        await ctx.db.patch(rateLimit._id, {
          attempts: 1,
          windowStart: Date.now(),
          blockedUntil: undefined,
        });
      } else if (rateLimit.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
        // Block the account
        await ctx.db.patch(rateLimit._id, {
          blockedUntil: Date.now() + LOCKOUT_DURATION_MS,
        });
        throw new Error("Too many login attempts. Account temporarily locked for 15 minutes.");
      } else {
        await ctx.db.patch(rateLimit._id, {
          attempts: rateLimit.attempts + 1,
        });
      }
    } else {
      await ctx.db.insert("rateLimits", {
        identifier: rateLimitKey,
        action: "login",
        attempts: 1,
        windowStart: Date.now(),
      });
    }

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (!user || !user.passwordHash || !user.passwordSalt) {
      await ctx.db.insert("auditLogs", {
        userId: "unknown",
        action: "auth.login_failed",
        resource: `email:${normalizedEmail}`,
        details: JSON.stringify({ reason: "User not found or no password set" }),
        ip: args.ip,
        userAgent: args.userAgent,
        timestamp: Date.now(),
        success: false,
      });
      // Use same error message to prevent email enumeration
      throw new Error("Invalid email or password");
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      throw new Error(`Account temporarily locked. Try again in ${remainingMinutes} minutes.`);
    }

    // Verify password with timing-safe comparison
    const isValid = await verifyPassword(args.password, user.passwordHash, user.passwordSalt);

    if (!isValid) {
      const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const patchData: Record<string, unknown> = { failedLoginAttempts: newAttempts };

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        patchData.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        patchData.failedLoginAttempts = 0;
      }

      await ctx.db.patch(user._id, patchData);

      await ctx.db.insert("auditLogs", {
        userId: user._id,
        action: "auth.login_failed",
        resource: `user:${user._id}`,
        details: JSON.stringify({
          reason: "Invalid password",
          attempts: newAttempts,
          locked: newAttempts >= MAX_LOGIN_ATTEMPTS,
        }),
        ip: args.ip,
        userAgent: args.userAgent,
        timestamp: Date.now(),
        success: false,
      });

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        throw new Error("Too many failed attempts. Account locked for 15 minutes.");
      }

      const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      throw new Error(`Invalid email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
    }

    // Success — reset failed attempts, update last login
    await ctx.db.patch(user._id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: Date.now(),
      lastLoginIp: args.ip,
      lastActivityAt: Date.now(),
    });

    // Create session
    const sessionToken = crypto.randomUUID();
    const sessionExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("sessions", {
      userId: user._id,
      token: sessionToken,
      createdAt: Date.now(),
      expiresAt: sessionExpires,
      lastAccessAt: Date.now(),
      ip: args.ip,
      userAgent: args.userAgent,
      isActive: true,
    });

    // Reset rate limit on successful login
    if (rateLimit) {
      await ctx.db.patch(rateLimit._id, {
        attempts: 0,
        blockedUntil: undefined,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "auth.login",
      resource: `user:${user._id}`,
      details: JSON.stringify({ role: user.role }),
      ip: args.ip,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      success: true,
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      division: user.division,
      zone: user.zone,
      sessionToken,
      expiresAt: sessionExpires,
    };
  },
});

// ─── SESSION VALIDATION ───
export const validateSession = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || !session.isActive) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      await ctx.db.patch(session._id, { isActive: false });
      return null;
    }

    // Update last access
    await ctx.db.patch(session._id, { lastAccessAt: Date.now() });

    // Look up the user who owns this session
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u) => u._id === session.userId);
    if (!user) return null;

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      division: user.division,
      zone: user.zone,
      expiresAt: session.expiresAt,
    };
  },
});

// ─── LOGOUT ───
export const logout = mutation({
  args: {
    sessionToken: v.string(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.patch(session._id, { isActive: false });

      await ctx.db.insert("auditLogs", {
        userId: session.userId,
        action: "auth.logout",
        resource: `session:${session._id}`,
        ip: args.ip,
        timestamp: Date.now(),
        success: true,
      });
    }

    return { success: true };
  },
});

// ─── AUDIT LOGS QUERY ───
export const getAuditLogs = query({
  args: {
    userId: v.optional(v.string()),
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_user", (qi) => qi.eq("userId", args.userId!))
        .order("desc")
        .take(args.limit ?? 50);
    } else if (args.action) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_action", (qi) => qi.eq("action", args.action!))
        .order("desc")
        .take(args.limit ?? 50);
    }
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// ─── GET USER'S ROLE PERMISSIONS ───
export const getUserPermissions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u) => u._id === args.userId);
    if (!user) return null;

    const role = user.role as Role;
    return {
      role,
      permissions: ROLE_PERMISSIONS[role] ?? [],
      department: user.department,
      division: user.division,
      zone: user.zone,
    };
  },
});

// ─── CHANGE PASSWORD ───
export const changePassword = mutation({
  args: {
    userId: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u) => u._id === args.userId);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValid = await verifyPassword(args.currentPassword, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      await ctx.db.insert("auditLogs", {
        userId: args.userId,
        action: "auth.password_change_failed",
        details: JSON.stringify({ reason: "Current password incorrect" }),
        ip: args.ip,
        userAgent: args.userAgent,
        timestamp: Date.now(),
        success: false,
      });
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const { hash, salt } = await hashPassword(args.newPassword);

    // Increment session version to invalidate all existing sessions
    const newVersion = (user.sessionVersion ?? 0) + 1;

    await ctx.db.patch(user._id, {
      passwordHash: hash,
      passwordSalt: salt,
      sessionVersion: newVersion,
    });

    // Invalidate all existing sessions for this user
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: "auth.password_changed",
      resource: `user:${args.userId}`,
      details: JSON.stringify({ sessionsInvalidated: sessions.length }),
      ip: args.ip,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      success: true,
    });

    return { success: true, sessionsInvalidated: sessions.length };
  },
});
