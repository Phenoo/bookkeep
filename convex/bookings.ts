import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Define interfaces for our data structures
interface ConflictingBooking {
  id: Id<"bookings">;
  customerName: string;
  startDate: string;
  endDate: string;
}

interface AvailabilityResult {
  available: boolean;
  conflictingBooking: ConflictingBooking | null;
}

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
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.get(args.id);
  },
});

// Check if a property is available for the given date range
export const checkAvailability = query({
  args: {
    propertyId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    excludeBookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args): Promise<AvailabilityResult> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Parse the dates
    const requestStart = new Date(args.startDate);
    const requestEnd = new Date(args.endDate);

    // Get all bookings for this property
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("propertyId"), args.propertyId))
      .filter((q) => q.neq(q.field("status"), "cancelled")) // Exclude cancelled bookings
      .collect();

    // Filter out the booking we're currently updating (if provided)
    const relevantBookings = args.excludeBookingId
      ? bookings.filter((booking) => booking._id !== args.excludeBookingId)
      : bookings;

    // Check for overlapping bookings
    for (const booking of relevantBookings) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check if the requested dates overlap with this booking
      // Overlap occurs when:
      // 1. The requested start date is before the booking end date AND
      // 2. The requested end date is after the booking start date
      if (requestStart < bookingEnd && requestEnd > bookingStart) {
        return {
          available: false,
          conflictingBooking: {
            id: booking._id,
            customerName: booking.customerName,
            startDate: booking.startDate,
            endDate: booking.endDate,
          },
        };
      }
    }

    // If we get here, the property is available for the requested dates
    return {
      available: true,
      conflictingBooking: null,
    };
  },
});

// Add a new booking with availability check
export const add = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyId: v.id("properties"),
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

    // Check if the property is available for the requested dates
    const availability = await ctx.runQuery(api.bookings.checkAvailability, {
      propertyId: args.propertyId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    if (!availability.available) {
      throw new Error(
        `Property is already booked from ${new Date(
          availability.conflictingBooking!.startDate
        ).toLocaleDateString()} to ${new Date(availability.conflictingBooking!.endDate).toLocaleDateString()} by ${
          availability.conflictingBooking!.customerName
        }`
      );
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

// Update a booking with availability check
export const update = mutation({
  args: {
    id: v.id("bookings"),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyId: v.optional(v.string()),
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

    // If dates or property are being changed, check availability
    if (
      (rest.startDate || rest.endDate || rest.propertyId) &&
      rest.status !== "cancelled"
    ) {
      const startDate = rest.startDate || existingBooking.startDate;
      const endDate = rest.endDate || existingBooking.endDate;
      const propertyId = rest.propertyId || existingBooking.propertyId;

      // Only check availability if this is not a cancellation
      const availability = await ctx.runQuery(api.bookings.checkAvailability, {
        propertyId,
        startDate,
        endDate,
        excludeBookingId: id, // Exclude the current booking from the check
      });

      if (!availability.available) {
        throw new Error(
          `Property is already booked from ${new Date(
            availability.conflictingBooking!.startDate
          ).toLocaleDateString()} to ${new Date(availability.conflictingBooking!.endDate).toLocaleDateString()} by ${
            availability.conflictingBooking!.customerName
          }`
        );
      }
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
  args: { id: v.id("bookings") },
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

// Get bookings for a specific property
export const getByPropertyId = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("propertyId"), args.propertyId))
      .order("desc")
      .collect();
  },
});

// Get bookings for a date range
export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const start = new Date(args.startDate);
    const end = new Date(args.endDate);

    // Get all bookings
    const allBookings = await ctx.db.query("bookings").collect();

    // Filter bookings that overlap with the given date range
    return allBookings.filter((booking) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check for overlap
      return bookingStart <= end && bookingEnd >= start;
    });
  },
});
