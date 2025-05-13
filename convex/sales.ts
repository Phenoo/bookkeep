import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new sale
export const createSale = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        category: v.string(),
        subtotal: v.number(),
      })
    ),
    category: v.optional(v.string()),
    totalAmount: v.number(),
    paymentMethod: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customSalesId: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const sales = (await ctx.db.query("sales").order("desc").collect()) || [];

    const newValue = sales.length + 1;

    const saleId = await ctx.db.insert("sales", {
      orderId,
      customSalesId: `SALES-${newValue}`,
      items: args.items,
      totalAmount: args.totalAmount,
      paymentMethod: args.paymentMethod || "cash",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      notes: args.notes,
      saleDate: new Date().toISOString(),
      createdBy: userId,
      status: "completed",
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId: userId,
      action: "create_sale",
      details: `Created sale with order ID: ${orderId}`,
      category: "sales",
      resourceType: "sale",
      resourceId: saleId,
      metadata: {
        saleId,
        orderId,
        totalAmount: args.totalAmount,
        items: args.items,
        customerName: args.customerName,
        paymentMethod: args.paymentMethod,
      },
      timestamp: Date.now(),
    });

    return { saleId, orderId };
  },
});

// Get all sales
export const getAllSales = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("sales").collect();
  },
});

// Get sales by date range
export const getSalesByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { startDate, endDate } = args;

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("sales")
      .filter((q) =>
        q.and(
          q.gte(q.field("saleDate"), startDate),
          q.lte(q.field("saleDate"), endDate)
        )
      )
      .collect();
  },
});

// Get sales by user
export const getSalesByUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sales")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
  },
});

// Update sale status (for refunds)
export const updateSaleStatus = mutation({
  args: {
    saleId: v.id("sales"),
    status: v.string(),
    notes: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { saleId, status, notes, updatedBy } = args;

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current sale
    const sale = await ctx.db.get(saleId);
    if (!sale) {
      throw new Error("Sale not found");
    }

    // Update the sale
    await ctx.db.patch(saleId, {
      status,
      notes: notes ? `${sale.notes || ""} | ${notes}` : sale.notes,
    });

    // Log user activity
    if (updatedBy) {
      await ctx.db.insert("userActivity", {
        userId: updatedBy,
        action: "update_sale",
        details: `Updated sale status to ${status}`,
        category: "sales",
        resourceType: "sale",
        resourceId: saleId,
        metadata: {
          saleId,
          orderId: sale.orderId,
          previousStatus: sale.status,
          newStatus: status,
          notes: notes,
        },
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});
