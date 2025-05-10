import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all menu items
export const getAllMenuItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

// Get menu items by category
export const getMenuItemsByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Get menu items by user
export const getMenuItemsByUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
  },
});

// Get a single menu item by ID
export const getMenuItemById = query({
  args: {
    id: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new menu item
export const createMenuItem = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const menuItemId = await ctx.db.insert("menuItems", {
      name: args.name,
      price: args.price,
      category: args.category,
      image: args.image,
      description: args.description,
      createdBy: args.createdBy,
    });

    return { menuItemId };
  },
});

// Update a menu item
export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    await ctx.db.patch(id, updateData);

    return { success: true };
  },
});

// Delete a menu item
export const deleteMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
