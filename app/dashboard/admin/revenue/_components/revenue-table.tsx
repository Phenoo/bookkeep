"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Search, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import { formatNaira } from "@/lib/utils";

export function RevenueTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>();

  // Fetch sales data
  const sales = useQuery(api.sales.getAllSales) || [];

  // Filter sales based on search query and category
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      searchQuery === "" ||
      sale.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.customerName &&
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      !selectedCategory || sale.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Format price to display in pounds
  const formatPrice = (price: number) => {
    return `£${(price / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  // Get unique categories
  const categories = Array.from(
    new Set(sales.map((sale) => sale.category).filter(Boolean))
  );

  // View sale details
  const viewSaleDetails = (sale: any) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  // Export sales data as CSV
  const exportSalesCSV = () => {
    // Create CSV content
    const headers = [
      "Order ID",
      "Date",
      "Category",
      "Customer",
      "Items",
      "Total",
      "Payment Method",
      "Status",
    ];
    const rows = filteredSales.map((sale) => [
      sale.orderId,
      formatDate(sale.saleDate),
      sale.category || "N/A",
      sale.customerName || "Anonymous",
      sale.items.length,
      (sale.totalAmount / 100).toFixed(2),
      sale.paymentMethod || "N/A",
      sale.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Sales data has been exported to CSV",
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "refunded":
        return <Badge className="bg-red-500">Refunded</Badge>;
      case "partially_refunded":
        return <Badge className="bg-amber-500">Partial Refund</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Category
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={exportSalesCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sales ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell className="font-medium">
                            {sale.customSalesId}
                          </TableCell>
                          <TableCell>{formatDate(sale.saleDate)}</TableCell>
                          <TableCell className="capitalize">
                            {sale.category || "—"}
                          </TableCell>
                          <TableCell>
                            {sale.customerName || "Anonymous"}
                          </TableCell>
                          <TableCell>{sale.items.length} items</TableCell>
                          <TableCell className="text-right">
                            {formatNaira(sale.totalAmount)}
                          </TableCell>
                          <TableCell>{sale.paymentMethod || "—"}</TableCell>
                          <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => viewSaleDetails(sale)}
                                >
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Print receipt logic
                                    toast({
                                      title: "Receipt printed",
                                      description: `Receipt for order ${sale.orderId} has been sent to printer`,
                                    });
                                  }}
                                >
                                  Print receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Sale Details - Order #{selectedSale?.customSalesId}
            </DialogTitle>
            <DialogDescription>
              {selectedSale && formatDate(selectedSale.saleDate)} -{" "}
              {getStatusBadge(selectedSale?.status)}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedSale.customerName || "Anonymous"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedSale.customerEmail || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedSale.customerPhone || "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Method:</span>{" "}
                      {selectedSale.paymentMethod || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span>{" "}
                      {formatNaira(selectedSale.totalAmount)}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {selectedSale.category || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
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
                      {selectedSale.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
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
                        <TableCell colSpan={4} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatNaira(selectedSale.totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div>
                  <h3 className="text-lg font-medium">Notes</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedSale.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Print receipt logic
                    toast({
                      title: "Receipt printed",
                      description: `Receipt for order ${selectedSale.orderId} has been sent to printer`,
                    });
                  }}
                >
                  Print Receipt
                </Button>
                <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
