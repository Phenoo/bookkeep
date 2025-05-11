import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new snooker coin transaction
export const createTransaction = mutation({
  args: {
    type: v.string(), // "add" or "use"
    amount: v.number(),
    table: v.optional(v.string()),
    notes: v.optional(v.string()),
    date: v.string(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const sales = (await ctx.db.query("sales").order("desc").collect()) || [];
    const newValue = sales.length + 1;
    // Create the transaction
    const transactionId = await ctx.db.insert("snookerCoinTransactions", {
      type: args.type,
      amount: args.amount,
      table: args.table,
      notes: args.notes,
      date: args.date,
      totalAmount: args.totalAmount,
      createdBy: userId,
    });

    await ctx.db.insert("sales", {
      orderId: `SNOOKER-COINS-${transactionId}`,
      customSalesId: `SALES-${newValue}`,
      items: [
        {
          id: transactionId,
          name: `Snooker Coins${args.table ? ` - Table ${args.table}` : ""}`,
          price: args.totalAmount,
          quantity: args.amount,
          category: "snooker_coins",
          subtotal: args.totalAmount,
        },
      ],
      category: "snooker_coins",
      totalAmount: args.totalAmount,
      paymentMethod: "cash",
      notes: args.notes || `Snooker coins transaction for ${args.amount} coins`,
      saleDate: args.date,
      createdBy: userId,
      status: "completed",
    });
    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "create_snooker_coin_transaction",
      details: `${args.type === "add" ? "Added" : "Used"} ${args.amount} coins${args.table ? ` for table ${args.table}` : ""}`,
      category: "snooker",
      resourceType: "snooker_coin_transaction",
      resourceId: transactionId,
      metadata: {
        transactionId,
        type: args.type,
        amount: args.amount,
        table: args.table,
        totalAmount: args.totalAmount,
      },
      timestamp: Date.now(),
    });

    // Create sales record for "use" transactions

    return transactionId;
  },
});

// Get all snooker coin transactions
export const getAllTransactions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("snookerCoinTransactions").collect();
  },
});

// Get transactions by date range
export const getTransactionsByDateRange = query({
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
      .query("snookerCoinTransactions")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();
  },
});
