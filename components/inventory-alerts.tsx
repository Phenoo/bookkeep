"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export function InventoryAlerts() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Fetch inventory items
  const inventoryItems = useQuery(api.inventory.getAll) || [];

  // Filter low stock and out of stock items
  const alertItems = inventoryItems.filter(
    (item) =>
      (item.status === "Low Stock" || item.status === "Out of Stock") &&
      !dismissedAlerts.includes(item._id)
  );

  // Show toast notification when new alerts are detected
  useEffect(() => {
    if (alertItems.length > 0) {
      const newAlerts = alertItems.filter(
        (item) => !dismissedAlerts.includes(item._id)
      );
      if (newAlerts.length > 0) {
        toast({
          title: "Inventory Alert",
          description: `${newAlerts.length} item(s) need attention`,
          duration: 5000,
        });
      }
    }
  }, [inventoryItems, dismissedAlerts, toast]);

  // Dismiss an alert
  const dismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Out of Stock":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alertItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white">
              {alertItems.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="font-medium">Inventory Alerts</div>
          <div className="text-sm text-muted-foreground">
            Items that need attention
          </div>
        </div>
        {alertItems.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="divide-y">
              {alertItems.map((item) => (
                <div key={item._id} className="p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => dismissAlert(item._id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} remaining
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                    <Link
                      href="/dashboard/inventory"
                      onClick={() => setOpen(false)}
                    >
                      <Button variant="link" size="sm" className="h-auto p-0">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No alerts at this time
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
