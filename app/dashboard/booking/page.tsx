"use client";

import { BookingSheet } from "./_components/booking-sheet";
import { BookingsTable } from "./_components/booking-table";

// Sample rent sales data

export default function RentSalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <BookingSheet />
      </div>

      <BookingsTable />
    </div>
  );
}
