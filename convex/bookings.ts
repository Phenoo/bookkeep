import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all bookings
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
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
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    // Next of kin information (new)
    nextOfKin: v.optional(
      v.object({
        name: v.optional(v.string()),
        relationship: v.optional(v.string()),
        phone: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    status: v.string(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity?.subject || "anonymous";

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      propertyId: args.propertyId,
      propertyName: args.propertyName,
      startDate: args.startDate,
      endDate: args.endDate,
      address: args.address,
      nextOfKin: args.nextOfKin,
      amount: args.amount,
      depositAmount: args.depositAmount,
      notes: args.notes,
      status: args.status,
      createdBy: userId,
    });

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "create_booking",
      details: `Created booking for ${args.customerName} at ${args.propertyName}`,
      category: "bookings",
      resourceType: "booking",
      resourceId: bookingId,
      metadata: {
        bookingId,
        customerName: args.customerName,
        propertyName: args.propertyName,
        startDate: args.startDate,
        endDate: args.endDate,
        amount: args.amount,
        status: args.status,
      },
      timestamp: Date.now(),
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
      createdBy: userId,
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
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    // Next of kin information (new)
    nextOfKin: v.optional(
      v.object({
        name: v.optional(v.string()),
        relationship: v.optional(v.string()),
        phone: v.optional(v.string()),
      })
    ),
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
    const userId = identity?.subject || "anonymous";
    const { id, ...rest } = args;

    // Get the current booking
    const existingBooking = await ctx.db.get(id);
    if (!existingBooking) {
      throw new Error("Booking not found");
    }

    // Update the booking
    await ctx.db.patch(id, rest);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "update_booking",
      details: `Updated booking for ${existingBooking.customerName} at ${existingBooking.propertyName}`,
      category: "bookings",
      resourceType: "booking",
      resourceId: id,
      metadata: {
        bookingId: id,
        customerName: existingBooking.customerName,
        propertyName: existingBooking.propertyName,
        previousData: existingBooking,
        newData: rest,
      },
      timestamp: Date.now(),
    });

    return id;
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
    const userId = identity?.subject || "anonymous";

    // Get the booking before deleting
    const existingBooking = await ctx.db.get(args.id);
    if (!existingBooking) {
      throw new Error("Booking not found");
    }

    // Delete the booking
    await ctx.db.delete(args.id);

    // Log user activity
    await ctx.db.insert("userActivity", {
      userId,
      action: "delete_booking",
      details: `Deleted booking for ${existingBooking.customerName} at ${existingBooking.propertyName}`,
      category: "bookings",
      resourceType: "booking",
      resourceId: args.id,
      metadata: {
        bookingId: args.id,
        customerName: existingBooking.customerName,
        propertyName: existingBooking.propertyName,
        bookingData: existingBooking,
      },
      timestamp: Date.now(),
    });

    return args.id;
  },
});
