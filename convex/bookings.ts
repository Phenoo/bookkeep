import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all bookings
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

// Get a single booking by ID
export const getById = query({
  args: { id: v.id("bookings") }, // ✅ Correct table name here
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.get(args.id);
  },
});

// Add a new booking
export const add = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    propertyId: v.id("properties"), // ✅ Should be ID type for reference
    propertyName: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    amount: v.number(),
    depositAmount: v.number(),
    notes: v.optional(v.string()),
    status: v.string(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      propertyId: args.propertyId,
      propertyName: args.propertyName,
      startDate: args.startDate,
      endDate: args.endDate,
      amount: args.amount,
      depositAmount: args.depositAmount,
      notes: args.notes,
      status: args.status,
      createdBy: args.createdBy,
    });

    const sales = (await ctx.db.query("sales").order("desc").collect()) || [];

    const newValue = sales.length + 1;

    // Also create a sales record for this booking
    await ctx.db.insert("sales", {
      orderId: `BOOKING-${bookingId}`,

      customSalesId: `SALES-${newValue}`,

      items: [
        {
          id: args.propertyId,
          name: args.propertyName,
          price: args.amount,
          quantity: 1,
          category: "rent",
          subtotal: args.amount,
        },
      ],
      category: "bookings",
      totalAmount: args.amount,
      paymentMethod: "cash", // or from args
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      notes: `Booking for ${args.customerName} from ${args.startDate} to ${args.endDate}`,
      saleDate: new Date().toISOString(),
      createdBy: args.createdBy,
      status: "completed",
    });

    return bookingId;
  },
});

// Update a booking
export const update = mutation({
  args: {
    id: v.id("bookings"), // ✅ Should be Id<"bookings">
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")), // ✅ Maintain correct ID type
    propertyName: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    amount: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const { id, ...rest } = args;

    const booking = await ctx.db.patch(id, rest);

    return booking;
  },
});

// Delete a booking
export const remove = mutation({
  args: { id: v.id("bookings") }, // ✅ Correct table here
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingBooking = await ctx.db.delete(args.id);

    return existingBooking;
  },
});
