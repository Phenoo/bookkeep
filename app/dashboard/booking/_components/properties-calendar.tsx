"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, isWithinInterval } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Id } from "@/convex/_generated/dataModel";

// Define interfaces for our data structures
interface Property {
  _id: Id<"properties">;
  name: string;
}

interface Booking {
  _id: Id<"bookings">;
  customerName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function PropertyAvailabilityCalendar() {
  const [selectedProperty, setSelectedProperty] = useState<
    Id<"properties"> | ""
  >("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [month, setMonth] = useState<Date>(new Date());

  // Fetch properties
  const properties = useQuery(api.properties.getAll) || [];

  // Fetch bookings for the selected property
  const propertyBookings = useQuery(
    api.bookings.getByPropertyId,
    selectedProperty ? { propertyId: selectedProperty } : "skip"
  );

  // Update bookings when property changes
  useEffect(() => {
    if (propertyBookings) {
      setBookings(propertyBookings as Booking[]);
    } else {
      setBookings([]);
    }
  }, [propertyBookings]);

  // Check if a date is booked
  const isDateBooked = (date: Date): boolean => {
    return bookings.some((booking) => {
      if (booking.status === "cancelled") return false;

      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  // Get booking details for a date
  const getBookingForDate = (date: Date): Booking | undefined => {
    return bookings.find((booking) => {
      if (booking.status === "cancelled") return false;

      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  // Custom day renderer for the calendar
  const renderDay = (
    day: Date,
    selectedDay: Date | undefined,
    dayProps: React.HTMLAttributes<HTMLDivElement>
  ) => {
    const isBooked = isDateBooked(day);
    const booking = isBooked ? getBookingForDate(day) : undefined;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              {...dayProps}
              className={`${dayProps.className} relative ${isBooked ? "bg-red-50 hover:bg-red-100" : ""}`}
            >
              {day.getDate()}
              {isBooked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
              )}
            </div>
          </TooltipTrigger>
          {isBooked && booking && (
            <TooltipContent>
              <div className="text-sm">
                <p className="font-bold">{booking.customerName}</p>
                <p>
                  {format(new Date(booking.startDate), "MMM d")} -{" "}
                  {format(new Date(booking.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Availability</CardTitle>
        <CardDescription>
          Check which dates are available for booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Property</label>
            {properties.length > 0 ? (
              <Select
                value={selectedProperty}
                onValueChange={(value) =>
                  setSelectedProperty(value as Id<"properties">)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property: Property) => (
                    <SelectItem key={property._id} value={property._id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white">
              Available
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              Booked
            </Badge>
          </div>

          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            components={{
              Day: renderDay as any,
            }}
            disabled={!selectedProperty}
          />

          {selectedProperty && bookings.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Upcoming Bookings</h3>
              <div className="space-y-2">
                {bookings
                  .filter(
                    (booking) =>
                      booking.status !== "cancelled" &&
                      new Date(booking.endDate) >= new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.startDate).getTime() -
                      new Date(b.startDate).getTime()
                  )
                  .map((booking) => (
                    <div key={booking._id} className="p-2 border rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {booking.customerName}
                        </span>
                        <Badge>{booking.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(booking.startDate), "MMM d")} -{" "}
                        {format(new Date(booking.endDate), "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
