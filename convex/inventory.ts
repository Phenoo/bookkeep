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

// Get inventory items by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get inventory items by status
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Add a new inventory item
export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    costPerUnit: v.number(),
    reorderLevel: v.number(),
    supplier: v.string(),
    totalValue: v.number(),
    status: v.string(),
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Insert the inventory item
    const inventoryId = await ctx.db.insert("inventory", {
      ...args,
      createdBy: userId,
    });

    // Record the creation in history
    await ctx.db.insert("inventoryHistory", {
      inventoryId,
      action: "created",
      timestamp: args.lastUpdated,
      newQuantity: args.quantity,
      newCostPerUnit: args.costPerUnit,
      newTotalValue: args.totalValue,
      newStatus: args.status,
      notes: args.notes,
      performedBy: userId,
      reason: "Initial inventory creation",
    });

    return inventoryId;
  },
});

// Update an inventory item
export const update = mutation({
  args: {
    id: v.id("inventory"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    costPerUnit: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    supplier: v.optional(v.string()),
    totalValue: v.optional(v.number()),
    status: v.optional(v.string()),
    lastUpdated: v.string(),
    notes: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, lastUpdated, reason, ...updates } = args;
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get the current inventory item
    const currentItem = await ctx.db.get(id);
    if (!currentItem) {
      throw new Error("Inventory item not found");
    }

    // Update the inventory item
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated,
    });

    // Record the update in history
    await ctx.db.insert("inventoryHistory", {
      inventoryId: id,
      action: "updated",
      timestamp: lastUpdated,
      previousQuantity: currentItem.quantity,
      newQuantity: updates.quantity ?? currentItem.quantity,
      quantityChange:
        updates.quantity !== undefined
          ? updates.quantity - currentItem.quantity
          : 0,
      previousCostPerUnit: currentItem.costPerUnit,
      newCostPerUnit: updates.costPerUnit ?? currentItem.costPerUnit,
      previousTotalValue: currentItem.totalValue,
      newTotalValue: updates.totalValue ?? currentItem.totalValue,
      previousStatus: currentItem.status,
      newStatus: updates.status ?? currentItem.status,
      reason: reason || "General update",
      notes: updates.notes,
      performedBy: userId,
    });

    return id;
  },
});

// Remove an inventory item
export const remove = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get the current inventory item before deletion
    const currentItem = await ctx.db.get(args.id);
    if (!currentItem) {
      throw new Error("Inventory item not found");
    }

    // Record the deletion in history
    await ctx.db.insert("inventoryHistory", {
      inventoryId: args.id,
      action: "deleted",
      timestamp: new Date().toISOString(),
      previousQuantity: currentItem.quantity,
      previousCostPerUnit: currentItem.costPerUnit,
      previousTotalValue: currentItem.totalValue,
      previousStatus: currentItem.status,
      reason: "Item deleted from inventory",
      performedBy: userId,
    });

    // Delete the inventory item
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Add stock to an inventory item
export const addStock = mutation({
  args: {
    id: v.id("inventory"),
    quantity: v.number(),
    costPerUnit: v.optional(v.number()),
    reason: v.string(),
    notes: v.optional(v.string()),
    documentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, quantity, costPerUnit, reason, notes, documentReference } =
      args;
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get the current inventory item
    const currentItem = await ctx.db.get(id);
    if (!currentItem) {
      throw new Error("Inventory item not found");
    }

    // Calculate new values
    const newQuantity = currentItem.quantity + quantity;
    const newCostPerUnit = costPerUnit ?? currentItem.costPerUnit;
    const newTotalValue = newQuantity * newCostPerUnit;

    // Determine new status
    let newStatus = "In Stock";
    if (newQuantity === 0) {
      newStatus = "Out of Stock";
    } else if (newQuantity <= currentItem.reorderLevel) {
      newStatus = "Low Stock";
    }

    // Update the inventory item
    await ctx.db.patch(id, {
      quantity: newQuantity,
      costPerUnit: newCostPerUnit,
      totalValue: newTotalValue,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });

    // Record the stock addition in history
    await ctx.db.insert("inventoryHistory", {
      inventoryId: id,
      action: "stock_in",
      timestamp: new Date().toISOString(),
      previousQuantity: currentItem.quantity,
      newQuantity,
      quantityChange: quantity,
      previousCostPerUnit: currentItem.costPerUnit,
      newCostPerUnit,
      previousTotalValue: currentItem.totalValue,
      newTotalValue,
      previousStatus: currentItem.status,
      newStatus,
      reason,
      notes,
      performedBy: userId,
      documentReference,
    });

    return id;
  },
});

// Remove stock from an inventory item
export const removeStock = mutation({
  args: {
    id: v.id("inventory"),
    quantity: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
    documentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, quantity, reason, notes, documentReference } = args;
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get the current inventory item
    const currentItem = await ctx.db.get(id);
    if (!currentItem) {
      throw new Error("Inventory item not found");
    }

    // Ensure we don't remove more than available
    if (quantity > currentItem.quantity) {
      throw new Error("Cannot remove more stock than available");
    }

    // Calculate new values
    const newQuantity = currentItem.quantity - quantity;
    const newTotalValue = newQuantity * currentItem.costPerUnit;

    // Determine new status
    let newStatus = "In Stock";
    if (newQuantity === 0) {
      newStatus = "Out of Stock";
    } else if (newQuantity <= currentItem.reorderLevel) {
      newStatus = "Low Stock";
    }

    // Update the inventory item
    await ctx.db.patch(id, {
      quantity: newQuantity,
      totalValue: newTotalValue,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });

    // Record the stock removal in history
    await ctx.db.insert("inventoryHistory", {
      inventoryId: id,
      action: "stock_out",
      timestamp: new Date().toISOString(),
      previousQuantity: currentItem.quantity,
      newQuantity,
      quantityChange: -quantity,
      previousCostPerUnit: currentItem.costPerUnit,
      newCostPerUnit: currentItem.costPerUnit,
      previousTotalValue: currentItem.totalValue,
      newTotalValue,
      previousStatus: currentItem.status,
      newStatus,
      reason,
      notes,
      performedBy: userId,
      documentReference,
    });

    return id;
  },
});

// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // Get all inventory items
// export const getAll = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//       throw new Error("Not authenticated");
//     }

//     return await ctx.db.query("inventory").collect();
//   },
// });

// // Get inventory item by ID
// export const getById = query({
//   args: { id: v.id("inventory") },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//       throw new Error("Not authenticated");
//     }
//     return await ctx.db.get(args.id);
//   },
// });

// // Add inventory item
// export const add = mutation({
//   args: {
//     name: v.string(),
//     category: v.string(),
//     quantity: v.number(),
//     unit: v.string(),
//     costPerUnit: v.number(),
//     totalValue: v.number(),
//     reorderLevel: v.number(),
//     supplier: v.string(),
//     status: v.string(),
//     lastUpdated: v.string(),
//     notes: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }

//     const userId = identity?.subject || "anonymous";

//     const inventoryId = await ctx.db.insert("inventory", {
//       ...args,
//       createdBy: userId,
//     });

//     // Log user activity
//     await ctx.db.insert("userActivity", {
//       userId,
//       action: "create_inventory_item",
//       details: `Created inventory item: ${args.name}`,
//       category: "inventory",
//       resourceType: "inventory",
//       resourceId: inventoryId,
//       metadata: {
//         inventoryId,
//         itemName: args.name,
//         category: args.category,
//         quantity: args.quantity,
//         totalValue: args.totalValue,
//       },
//       timestamp: Date.now(),
//     });

//     return inventoryId;
//   },
// });

// // Update inventory item
// export const update = mutation({
//   args: {
//     id: v.id("inventory"),
//     name: v.string(),
//     category: v.string(),
//     quantity: v.number(),
//     unit: v.string(),
//     costPerUnit: v.number(),
//     totalValue: v.number(),
//     reorderLevel: v.number(),
//     supplier: v.string(),
//     status: v.string(),
//     lastUpdated: v.string(),
//     notes: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const { id, ...updates } = args;

//     const identity = await ctx.auth.getUserIdentity();
//     const userId = identity?.subject || "anonymous";

//     if (!identity) {
//       throw new Error("Not authenticated");
//     }
//     const existingItem = await ctx.db.get(id);
//     if (!existingItem) {
//       throw new Error("Inventory item not found");
//     }

//     await ctx.db.patch(id, updates);

//     // Log user activity
//     await ctx.db.insert("userActivity", {
//       userId,
//       action: "update_inventory_item",
//       details: `Updated inventory item: ${args.name}`,
//       category: "inventory",
//       resourceType: "inventory",
//       resourceId: id,
//       metadata: {
//         inventoryId: id,
//         itemName: args.name,
//         previousData: existingItem,
//         newData: updates,
//       },
//       timestamp: Date.now(),
//     });

//     return id;
//   },
// });

// // Remove inventory item
// export const remove = mutation({
//   args: { id: v.id("inventory") },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     const userId = identity?.subject || "anonymous";

//     if (!identity) {
//       throw new Error("Not authenticated");
//     }

//     const existingItem = await ctx.db.get(args.id);
//     if (!existingItem) {
//       throw new Error("Inventory item not found");
//     }

//     await ctx.db.delete(args.id);

//     // Log user activity
//     await ctx.db.insert("userActivity", {
//       userId,
//       action: "delete_inventory_item",
//       details: `Deleted inventory item: ${existingItem.name}`,
//       category: "inventory",
//       resourceType: "inventory",
//       resourceId: args.id,
//       metadata: {
//         inventoryId: args.id,
//         itemName: existingItem.name,
//         itemData: existingItem,
//       },
//       timestamp: Date.now(),
//     });

//     return args.id;
//   },
// });
