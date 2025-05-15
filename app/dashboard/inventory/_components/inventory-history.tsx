"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { Spinner } from "@/components/spinner";
import { ArrowUp, ArrowDown, Plus, RefreshCw, Trash } from "lucide-react";

interface InventoryHistoryDialogProps {
  inventoryId: Id<"inventory"> | null;
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
}

export function InventoryHistoryDialog({
  inventoryId,
  isOpen,
  onClose,
  itemName,
}: InventoryHistoryDialogProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Fetch inventory history
  const historyEntries = useQuery(
    api.inventoryHistory.getByInventoryId,
    inventoryId ? { inventoryId } : "skip"
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "updated":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "deleted":
        return <Trash className="h-4 w-4 text-red-500" />;
      case "stock_in":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "stock_out":
        return <ArrowDown className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "updated":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "deleted":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "stock_in":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "stock_out":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get formatted action name
  const getActionName = (action: string) => {
    switch (action) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "deleted":
        return "Deleted";
      case "stock_in":
        return "Stock Added";
      case "stock_out":
        return "Stock Removed";
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  // Filter history entries based on active tab
  const filteredEntries = historyEntries?.filter((entry) => {
    if (activeTab === "all") return true;
    if (activeTab === "stock")
      return entry.action === "stock_in" || entry.action === "stock_out";
    if (activeTab === "updates") return entry.action === "updated";
    return entry.action === activeTab;
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inventory History: {itemName}</DialogTitle>
          <DialogDescription>
            View the complete history of this inventory item
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-4"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="stock">Stock Changes</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="created">Creation</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {historyEntries === undefined ? (
              <div className="flex justify-center items-center py-12">
                <Spinner />
              </div>
            ) : filteredEntries && filteredEntries.length > 0 ? (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <Badge
                          variant="outline"
                          className={getActionColor(entry.action)}
                        >
                          {getActionName(entry.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      {entry.reason && (
                        <div>
                          <Badge variant="outline">{entry.reason}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Stock changes */}
                    {(entry.action === "stock_in" ||
                      entry.action === "stock_out" ||
                      entry.quantityChange !== 0) && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Quantity</p>
                          <p className="text-sm">
                            {entry.previousQuantity !== undefined && (
                              <span className="text-muted-foreground">
                                {entry.previousQuantity} →{" "}
                              </span>
                            )}
                            {entry.newQuantity}
                            {entry.quantityChange &&
                              entry.quantityChange !== 0 && (
                                <span
                                  className={
                                    entry.quantityChange > 0
                                      ? "text-green-600 ml-1"
                                      : "text-red-600 ml-1"
                                  }
                                >
                                  ({entry.quantityChange > 0 ? "+" : ""}
                                  {entry.quantityChange})
                                </span>
                              )}
                          </p>
                        </div>
                        {entry.newCostPerUnit !== undefined && (
                          <div>
                            <p className="text-sm font-medium">Cost Per Unit</p>
                            <p className="text-sm">
                              {entry.previousCostPerUnit !== undefined && (
                                <span className="text-muted-foreground">
                                  {formatNaira(entry.previousCostPerUnit)}{" "}
                                  →{" "}
                                </span>
                              )}
                              {formatNaira(entry.newCostPerUnit)}
                            </p>
                          </div>
                        )}
                        {entry.newTotalValue !== undefined && (
                          <div>
                            <p className="text-sm font-medium">Total Value</p>
                            <p className="text-sm">
                              {entry.previousTotalValue !== undefined && (
                                <span className="text-muted-foreground">
                                  {formatNaira(entry.previousTotalValue)} →{" "}
                                </span>
                              )}
                              {formatNaira(entry.newTotalValue)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status changes */}
                    {entry.previousStatus !== entry.newStatus &&
                      entry.newStatus && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm">
                            {entry.previousStatus && (
                              <span className="text-muted-foreground">
                                {entry.previousStatus} →{" "}
                              </span>
                            )}
                            {entry.newStatus}
                          </p>
                        </div>
                      )}

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.notes}
                        </p>
                      </div>
                    )}

                    {/* Document reference */}
                    {entry.documentReference && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Reference</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.documentReference}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No history entries found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
