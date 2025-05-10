import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log user activity
export const log = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userActivity", {
      userId: args.userId,
      action: args.action,
      details: args.details || "",
      metadata: args.metadata || {},
      timestamp: Date.now(),
    });
  },
});

// Get all activity
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("userActivity").order("desc").collect();
  },
});

// Get activity for a specific user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userActivity")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Get recent activity
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("userActivity").order("desc").take(limit);
  },
});
