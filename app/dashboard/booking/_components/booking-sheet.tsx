"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookingForm } from "./booking-form";

export function BookingSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const properties = useQuery(api.properties.getAll) || [];

  const handleSuccess = () => {
    setIsOpen(false);
  };

  // If properties aren't loaded yet, use sample data
  const propertiesData =
    properties.length > 0
      ? properties
      : [
          { _id: "1", name: "Apartment 4B" },
          { _id: "2", name: "Office Space 101" },
          { _id: "3", name: "Storage Unit #42" },
          { _id: "4", name: "Parking Space P12" },
          { _id: "5", name: "Conference Room" },
          { _id: "6", name: "Studio Apartment 2A" },
          { _id: "7", name: "Retail Space 305" },
        ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Booking</SheetTitle>
          <SheetDescription>
            Create a new booking for a rental property. Fill in the customer
            details and booking information.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <BookingForm properties={propertiesData} onSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
