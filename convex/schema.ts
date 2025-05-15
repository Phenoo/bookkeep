import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isApproved: v.optional(v.boolean()),
    role: v.string(),
    lastSignInAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  // Properties table
  properties: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    address: v.optional(v.string()),
    pricePerDay: v.optional(v.number()),
    pricePerMonth: v.optional(v.number()),
    isAvailable: v.boolean(),
    createdBy: v.optional(v.string()),
  }).index("by_user", ["createdBy"]),

  // Bookings table
  bookings: defineTable({
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    propertyId: v.string(),
    propertyName: v.string(),
    startDate: v.string(), // ISO date string
    endDate: v.string(), // ISO date string
    amount: v.number(),
    depositAmount: v.number(),
    notes: v.optional(v.string()),
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
    status: v.string(), // "pending", "confirmed", "cancelled", "completed"
    createdBy: v.optional(v.string()),
  }).index("by_user", ["createdBy"]),

  // Sales table
  sales: defineTable({
    orderId: v.string(),
    customSalesId: v.optional(v.string()),
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
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
    saleDate: v.string(),
    createdBy: v.optional(v.string()),
    status: v.string(),
  }).index("by_user", ["createdBy"]),

  // Menu Items table
  menuItems: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(), // "food", "drink", etc.
    image: v.optional(v.string()),
    description: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  }).index("by_user", ["createdBy"]),

  // Orders table
  orders: defineTable({
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
    status: v.string(), // "pending", "completed", "cancelled"
    notes: v.optional(v.string()),
    orderDate: v.string(), // ISO date string
    createdBy: v.optional(v.string()),
  }).index("by_user", ["createdBy"]),

  // Inventory table
  // Existing Inventory table
  inventory: defineTable({
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    costPerUnit: v.number(),
    totalValue: v.number(),
    reorderLevel: v.number(),
    supplier: v.string(),
    status: v.string(), // "In Stock", "Low Stock", "Out of Stock"
    lastUpdated: v.string(), // ISO date string
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_supplier", ["supplier"])
    .index("by_user", ["createdBy"]),

  // New Inventory History table
  inventoryHistory: defineTable({
    inventoryId: v.id("inventory"), // Reference to the inventory item
    action: v.string(), // "created", "updated", "deleted", "stock_in", "stock_out"
    timestamp: v.string(), // ISO date string
    previousQuantity: v.optional(v.number()),
    newQuantity: v.optional(v.number()),
    quantityChange: v.optional(v.number()), // Positive for additions, negative for removals
    previousCostPerUnit: v.optional(v.number()),
    newCostPerUnit: v.optional(v.number()),
    previousTotalValue: v.optional(v.number()),
    newTotalValue: v.optional(v.number()),
    previousStatus: v.optional(v.string()),
    newStatus: v.optional(v.string()),
    reason: v.optional(v.string()), // Reason for the change (e.g., "Restocking", "Damaged", "Sale")
    notes: v.optional(v.string()),
    performedBy: v.optional(v.string()), // User who made the change
    documentReference: v.optional(v.string()), // Reference to related document (e.g., order ID, invoice number)
  })
    .index("by_inventory_id", ["inventoryId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["performedBy"]),
  // User activity table
  userActivity: defineTable({
    userId: v.string(),
    action: v.string(),
    details: v.string(),
    category: v.optional(v.string()),
    metadata: v.any(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"]),
  expenses: defineTable({
    title: v.string(),
    amount: v.number(),
    category: v.string(), // "supplies", "rent", "utilities", "salaries", "maintenance", etc.
    date: v.string(), // ISO date string
    paymentMethod: v.optional(v.string()), // "cash", "card", "bank_transfer", etc.
    receipt: v.optional(v.string()), // URL to receipt image
    notes: v.optional(v.string()),
    vendor: v.optional(v.string()),
    createdBy: v.string(),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.string()), // "daily", "weekly", "monthly", "yearly"
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_created_by", ["createdBy"]),

  // Snooker Coin Transactions table
  snookerCoinTransactions: defineTable({
    type: v.string(), // "add" or "use"
    amount: v.number(),
    table: v.optional(v.string()),
    notes: v.optional(v.string()),
    date: v.string(),
    totalAmount: v.number(),
    createdBy: v.string(),
  }).index("by_date", ["date"]),

  issues: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.string(), // "low", "medium", "high", "critical"
    category: v.string(), // "technical", "billing", "feature", "security", "other"
    status: v.string(), // "open", "in-progress", "resolved"
    attachments: v.array(v.string()),
    createdAt: v.string(), // ISO date string
    updatedAt: v.optional(v.string()), // ISO date string
    createdBy: v.optional(v.string()),
    assignedTo: v.optional(v.union(v.string(), v.null())),
    comments: v.array(
      v.object({
        id: v.string(),
        content: v.string(),
        createdBy: v.optional(v.string()),
        createdAt: v.string(), // ISO date string
      })
    ),
  })
    .index("by_user", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_category", ["category"]),
});
