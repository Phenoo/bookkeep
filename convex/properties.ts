import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all properties
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.query("properties").collect();
  },
});

// Get properties by user
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("properties")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
  },
});

// Get a single property by ID
export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.get(args.id);
  },
});

// Add a new property
export const add = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    floor: v.string(),
    address: v.optional(v.string()),
    pricePerDay: v.optional(v.number()),
    pricePerMonth: v.optional(v.number()),
    isAvailable: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db.insert("properties", {
      name: args.name,
      description: args.description,
      type: args.type,
      floor: args.floor,
      address: args.address,
      pricePerDay: args.pricePerDay,
      pricePerMonth: args.pricePerMonth,
      isAvailable: args.isAvailable,
      createdBy: userId,
    });
  },
});

// Update a property
export const update = mutation({
  args: {
    id: v.id("properties"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    floor: v.optional(v.string()),
    address: v.optional(v.string()),
    pricePerDay: v.optional(v.number()),
    pricePerMonth: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

// Delete a property
export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.delete(args.id);
  },
});
