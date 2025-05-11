import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all orders
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Get a single order by ID
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.get(args.id);
  },
});

// Add a new order
export const add = mutation({
  args: {
    customId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    category: v.optional(v.string()),
    items: v.array(
      v.object({
        category: v.optional(v.string()),
        menuItemId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        subtotal: v.number(),
      })
    ),
    totalAmount: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const orders = (await ctx.db.query("orders").order("desc").collect()) || [];
    const newValue = orders.length + 1;

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      customId: `ORDER-0${newValue}`,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      items: args.items,
      totalAmount: args.totalAmount,
      status: args.status,
      notes: args.notes,
      category: args.category,
      orderDate: new Date().toISOString(),
      createdBy: userId,
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "create_order",
      details: `Created order ${args.customId || `ORDER-0${newValue}`} for ${args.customerName || "Customer"}`,
      category: "orders",
      resourceType: "order",
      resourceId: orderId,
      metadata: {
        orderId,
        customId: args.customId || `ORDER-0${newValue}`,
        customerName: args.customerName,
        totalAmount: args.totalAmount,
        items: args.items,
        status: args.status,
        category: args.category,
      },
      timestamp: Date.now(),
    });

    const sales = (await ctx.db.query("sales").order("desc").collect()) || [];
    const newValue2 = sales.length + 1;

    // Create a sales record for this order
    await ctx.db.insert("sales", {
      orderId: `ORDER-${orderId}`,
      customSalesId: `SALES-${newValue2}`,
      items: args.items.map((item) => ({
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category || "general",
        subtotal: item.subtotal,
      })),
      category: args.category || "orders",
      totalAmount: args.totalAmount,
      paymentMethod: "cash",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      notes: args.notes,
      saleDate: new Date().toISOString(),
      createdBy: userId,
      status: "completed",
    });

    return orderId;
  },
});

// Update an order
export const update = mutation({
  args: {
    id: v.id("orders"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    category: v.optional(v.string()),
    items: v.optional(
      v.array(
        v.object({
          menuItemId: v.string(),
          name: v.string(),
          price: v.number(),
          quantity: v.number(),
          subtotal: v.number(),
        })
      )
    ),
    totalAmount: v.optional(v.number()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const { id, ...rest } = args;

    // Get the current order
    const existingOrder = await ctx.db.get(id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    // Update the order
    await ctx.db.patch(id, rest);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "update_order",
      details: `Updated order ${existingOrder.customId} for ${existingOrder.customerName || "Customer"}`,
      category: "orders",
      resourceType: "order",
      resourceId: id,
      metadata: {
        orderId: id,
        customId: existingOrder.customId,
        customerName: existingOrder.customerName,
        previousData: existingOrder,
        newData: rest,
      },
      timestamp: Date.now(),
    });

    return id;
  },
});

// Delete an order
export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Get the order before deleting
    const existingOrder = await ctx.db.get(args.id);
    if (!existingOrder) {
      throw new Error("Order not found");
    }

    // Delete the order
    await ctx.db.delete(args.id);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "delete_order",
      details: `Deleted order ${existingOrder.customId} for ${existingOrder.customerName || "Customer"}`,
      category: "orders",
      resourceType: "order",
      resourceId: args.id,
      metadata: {
        orderId: args.id,
        customId: existingOrder.customId,
        customerName: existingOrder.customerName,
        orderData: existingOrder,
      },
      timestamp: Date.now(),
    });

    return args.id;
  },
});
