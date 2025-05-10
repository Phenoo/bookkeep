import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new expense
export const createExpense = mutation({
  args: {
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    date: v.string(),
    paymentMethod: v.optional(v.string()),
    receipt: v.optional(v.string()),
    notes: v.optional(v.string()),
    vendor: v.optional(v.string()),
    createdBy: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expenseId = await ctx.db.insert("expenses", {
      title: args.title,
      amount: args.amount,
      category: args.category,
      date: args.date,
      paymentMethod: args.paymentMethod,
      receipt: args.receipt,
      notes: args.notes,
      vendor: args.vendor,
      createdBy: args.createdBy,
      isRecurring: args.isRecurring || false,
      recurringFrequency: args.recurringFrequency,
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId: args.createdBy,
      action: "create",
      details: `Created expense: ${args.title}`,
      metadata: { expenseId, amount: args.amount, category: args.category },
      timestamp: Date.now(),
    });

    return { expenseId };
  },
});

// Get all expenses
export const getAllExpenses = query({
  handler: async (ctx) => {
    return await ctx.db.query("expenses").collect();
  },
});

// Get expenses by date range
export const getExpensesByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { startDate, endDate } = args;

    return await ctx.db
      .query("expenses")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();
  },
});

// Get expenses by category
export const getExpensesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Get expenses by user
export const getExpensesByUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
  },
});

// Update an expense
export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    title: v.optional(v.string()),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    receipt: v.optional(v.string()),
    notes: v.optional(v.string()),
    vendor: v.optional(v.string()),
    updatedBy: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, updatedBy, ...updateData } = args;

    // Get the current expense
    const expense = await ctx.db.get(id);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Update the expense
    await ctx.db.patch(id, updateData);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId: updatedBy,
      action: "update",
      details: `Updated expense: ${expense.title}`,
      metadata: { expenseId: id, previousData: expense, newData: updateData },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Delete an expense
export const deleteExpense = mutation({
  args: {
    id: v.id("expenses"),
    deletedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, deletedBy } = args;

    // Get the expense before deleting
    const expense = await ctx.db.get(id);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Delete the expense
    await ctx.db.delete(id);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId: deletedBy,
      action: "delete",
      details: `Deleted expense: ${expense.title}`,
      metadata: { expenseId: id, expenseData: expense },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
