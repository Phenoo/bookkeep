"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.customId}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
          <DialogDescription>
            Placed on{" "}
            {format(new Date(order.orderDate), "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {order.customerName || "Guest"}
              </p>
              {order.customerEmail && (
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.customerEmail}
                </p>
              )}
              {order.customerPhone && (
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerPhone}
                </p>
              )}
              {order.category && (
                <p>
                  <span className="font-medium">Order Type:</span>{" "}
                  {order.category}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Total Items:</span>{" "}
                {order.items.length}
              </p>
              <p>
                <span className="font-medium">Total Amount:</span>
                {formatNaira(order.totalAmount)}
              </p>
              {order.createdBy && (
                <p>
                  <span className="font-medium">Created By:</span>{" "}
                  {order.createdBy}
                </p>
              )}
              {order.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 p-2 bg-muted rounded-md">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <h3 className="text-sm font-medium mb-4">Order Items</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={`${order._id}-item-${index}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatNaira(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNaira(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNaira(order.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline">Print Receipt</Button>
          {order.status === "pending" && (
            <>
              <Button variant="default">Mark as Completed</Button>
              <Button variant="destructive">Cancel Order</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
