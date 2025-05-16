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
    image: v.optional(v.string()),

    vendor: v.optional(v.string()),
    createdBy: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const expenseId = await ctx.db.insert("expenses", {
      title: args.title,
      amount: args.amount,
      category: args.category,
      date: args.date,
      paymentMethod: args.paymentMethod,
      receipt: args.receipt,
      notes: args.notes,
      image: args.notes,
      vendor: args.vendor,
      createdBy: userId,
      isRecurring: args.isRecurring || false,
      recurringFrequency: args.recurringFrequency,
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId: userId,
      action: "create_expense",
      details: `Created expense: ${args.title}`,
      category: "expenses",
      resourceType: "expense",
      resourceId: expenseId,
      metadata: {
        expenseId,
        title: args.title,
        amount: args.amount,
        category: args.category,
        vendor: args.vendor,
        isRecurring: args.isRecurring,
      },
      timestamp: Date.now(),
    });

    return { expenseId };
  },
});

// Get all expenses
export const getAllExpenses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
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
    image: v.optional(v.string()),
    receipt: v.optional(v.string()),
    notes: v.optional(v.string()),
    vendor: v.optional(v.string()),
    updatedBy: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, updatedBy, ...updateData } = args;

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
      action: "update_expense",
      details: `Updated expense: ${expense.title}`,
      category: "expenses",
      resourceType: "expense",
      resourceId: id,
      metadata: {
        expenseId: id,
        title: expense.title,
        previousData: expense,
        newData: updateData,
      },
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

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
      action: "delete_expense",
      details: `Deleted expense: ${expense.title}`,
      category: "expenses",
      resourceType: "expense",
      resourceId: id,
      metadata: {
        expenseId: id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        vendor: expense.vendor,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getExpenseById = query({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const expense = await ctx.db.get(args.id);
    return expense;
  },
});
