"use client";

import { useEffect, useState } from "react";
import { Search, Filter, FileDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { OrderTable } from "@/app/dashboard/food/_components/order-table";
import { OrderDetailsDialog } from "@/app/dashboard/food/_components/order-filter-dialog";
import { OrderFiltersDialog } from "@/app/dashboard/food/_components/order-details-dialog";
import type { Order } from "@/lib/types";

export function OrderHistory({ items }: any) {
  const [orders, setOrders] = useState<Order[]>(items);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setOrders(items);
  }, [items]);
  // Filter orders based on search query and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName &&
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail &&
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Filter by date range if set
    const orderDate = new Date(order.orderDate);
    const matchesDateRange =
      (!dateRange.from || orderDate >= dateRange.from) &&
      (!dateRange.to || orderDate <= dateRange.to);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const applyFilters = (filters: any) => {
    setDateRange(filters.dateRange);
    // Apply other filters as needed
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-6 w-full overflow-x-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-lg md:text-2xl font-bold">Order History</h1>
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <OrderTable orders={filteredOrders} onViewDetails={viewOrderDetails} />
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}

      <OrderFiltersDialog
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        dateRange={dateRange}
        onApplyFilters={applyFilters}
      />
    </div>
  );
}
