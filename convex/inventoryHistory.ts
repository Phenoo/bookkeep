import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all history entries for an inventory item
export const getByInventoryId = query({
  args: { inventoryId: v.id("inventory") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryHistory")
      .withIndex("by_inventory_id", (q) =>
        q.eq("inventoryId", args.inventoryId)
      )
      .order("desc")
      .collect();
  },
});

// Get history entries by action type
export const getByAction = query({
  args: { action: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryHistory")
      .withIndex("by_action", (q) => q.eq("action", args.action))
      .order("desc")
      .collect();
  },
});

// Get recent history entries (across all inventory)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("inventoryHistory").order("desc").take(limit);
  },
});

// Get history entries by date range
export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryHistory")
      .filter((q) => q.gte(q.field("timestamp"), args.startDate))
      .filter((q) => q.lte(q.field("timestamp"), args.endDate))
      .order("desc")
      .collect();
  },
});

// Get history entries by user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryHistory")
      .withIndex("by_user", (q) => q.eq("performedBy", args.userId))
      .order("desc")
      .collect();
  },
});
