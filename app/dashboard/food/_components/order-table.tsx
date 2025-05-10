"use client";

import { format } from "date-fns";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

export function OrderTable({ orders, onViewDetails }: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center py-8 text-muted-foreground"
            >
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">{order.customId}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{order.customerName || "Guest"}</span>
                  {order.customerEmail && (
                    <span className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(order.orderDate), "MMM d, yyyy")}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(order.orderDate), "h:mm a")}
                </div>
              </TableCell>
              <TableCell>{order.items.length} items</TableCell>
              <TableCell>{formatNaira(order.totalAmount)}</TableCell>
              <TableCell>{order.category || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(order)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                      {order.status === "pending" && (
                        <>
                          <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
