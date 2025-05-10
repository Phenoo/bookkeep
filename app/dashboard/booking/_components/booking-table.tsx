"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatNaira } from "@/lib/utils";

export function BookingsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const bookings = useQuery(api.bookings.getAll) || [];

  const seedProperties = useMutation(api.seed.seedMenuItems);

  const handleSeed = async () => {
    try {
      const result = await seedProperties();
      alert(`${result.message} (${result.count} items)`);
    } catch (error) {
      console.error("Seeding failed:", error);
      alert("Failed to seed properties.");
    }
  };
  // Filter bookings based on search query
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // If no bookings are loaded yet, use sample data
  const displayBookings = bookings.length > 0 ? filteredBookings : [];

  return (
    <Card>
      <CardHeader>
        <CardDescription>View and manage property bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayBookings.length > 0 ? (
                displayBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">
                      {booking.customerName}
                    </TableCell>
                    <TableCell>{booking.propertyName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(booking.startDate), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          to
                        </span>
                        <span>
                          {format(new Date(booking.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNaira(booking.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(booking.status)}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
