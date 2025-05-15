import { mutation } from "./_generated/server";

// Migration to add creation history for existing inventory items
export const addCreationHistoryToExistingInventory = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all inventory items that don't have a creation history entry
    const inventoryItems = await ctx.db.query("inventory").collect();
    let createdCount = 0;

    // For each inventory item, check if it has a creation history entry
    for (const item of inventoryItems) {
      // Check if a creation history entry already exists
      const existingHistory = await ctx.db
        .query("inventoryHistory")
        .withIndex("by_inventory_id", (q) => q.eq("inventoryId", item._id))
        .filter((q) => q.eq(q.field("action"), "created"))
        .first();

      // If no creation history exists, create one
      if (!existingHistory) {
        await ctx.db.insert("inventoryHistory", {
          inventoryId: item._id,
          action: "created",
          timestamp: item.lastUpdated || new Date().toISOString(),
          newQuantity: item.quantity,
          newCostPerUnit: item.costPerUnit,
          newTotalValue: item.totalValue,
          newStatus: item.status,
          notes: item.notes,
          performedBy: item.createdBy,
          reason: "Initial inventory creation (backfilled)",
        });
        createdCount++;
      }
    }

    return {
      success: true,
      message: `Added creation history for ${createdCount} inventory items`,
      totalItems: inventoryItems.length,
      itemsUpdated: createdCount,
    };
  },
});
