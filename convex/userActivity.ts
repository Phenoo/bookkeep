import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log user activity
export const log = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    category: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("userActivity", {
      userId: args.userId,
      action: args.action,
      details: args.details || "",
      category: args.category || "",
      metadata: args.metadata || {},
      resourceType: args.resourceType || "",
      resourceId: args.resourceId || "",
      timestamp: Date.now(),
    });
  },
});

// Get all activity
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("userActivity").order("desc").collect();
  },
});

// Get activity for a specific user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit || 50;
    return await ctx.db.query("userActivity").order("desc").take(limit);
  },
});

// Get activity by resource type
export const getByResourceType = query({
  args: { resourceType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("userActivity")
      .filter((q) => q.eq(q.field("resourceType"), args.resourceType))
      .order("desc")
      .collect();
  },
});

// Get activity by resource ID
export const getByResourceId = query({
  args: { resourceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("userActivity")
      .filter((q) => q.eq(q.field("resourceId"), args.resourceId))
      .order("desc")
      .collect();
  },
});
