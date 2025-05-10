import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all inventory items
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("inventory").collect();
  },
});

// Get inventory item by ID
export const getById = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add inventory item
export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    costPerUnit: v.number(),
    totalValue: v.number(),
    reorderLevel: v.number(),
    supplier: v.string(),
    status: v.string(),
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "anonymous";

    const inventoryId = await ctx.db.insert("inventory", {
      ...args,
      createdBy: userId,
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "create_inventory_item",
      details: `Created inventory item: ${args.name}`,
      metadata: { inventoryId },
      timestamp: Date.now(),
    });

    return inventoryId;
  },
});

// Update inventory item
export const update = mutation({
  args: {
    id: v.id("inventory"),
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    costPerUnit: v.number(),
    totalValue: v.number(),
    reorderLevel: v.number(),
    supplier: v.string(),
    status: v.string(),
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "anonymous";

    const existingItem = await ctx.db.get(id);
    if (!existingItem) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.patch(id, updates);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "update_inventory_item",
      details: `Updated inventory item: ${args.name}`,
      metadata: { inventoryId: id },
      timestamp: Date.now(),
    });

    return id;
  },
});

// Remove inventory item
export const remove = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "anonymous";

    const existingItem = await ctx.db.get(args.id);
    if (!existingItem) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.delete(args.id);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "delete_inventory_item",
      details: `Deleted inventory item: ${existingItem.name}`,
      metadata: { inventoryId: args.id },
      timestamp: Date.now(),
    });

    return args.id;
  },
});
