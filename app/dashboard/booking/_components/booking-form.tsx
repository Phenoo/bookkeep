"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

// Define interfaces for our data structures
interface Property {
  _id: Id<"properties">;
  name: string;
  pricePerDay?: number;
  depositAmount?: number;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface NextOfKin {
  name?: string;
  relationship?: string;
  phone?: string;
}

interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  amount: number;
  depositAmount: string;
  notes: string;
  status: string;
  address: Address;
  nextOfKin: NextOfKin;
}

interface AvailabilityResult {
  available: boolean;
  conflictingBooking: {
    id: Id<"bookings">;
    customerName: string;
    startDate: string;
    endDate: string;
  } | null;
}

interface BookingFormProps {
  properties: Property[];
  onSuccess: () => void;
}

export function BookingForm({ properties, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] =
    useState<AvailabilityResult | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    propertyId: "",
    propertyName: "",
    startDate: "",
    endDate: "",
    amount: 0,
    depositAmount: "0",
    notes: "",
    status: "confirmed",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    nextOfKin: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  // Mutations
  const addBooking = useMutation(api.bookings.add);
  const checkAvailability = useQuery(
    api.bookings.checkAvailability,
    formData.propertyId && formData.startDate && formData.endDate
      ? {
          propertyId: formData.propertyId as Id<"properties">,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }
      : "skip"
  );

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof BookingFormData],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle property selection
  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find((p) => p._id === propertyId);
    if (selectedProperty) {
      setFormData({
        ...formData,
        propertyId,
        propertyName: selectedProperty.name,
        amount: selectedProperty.pricePerDay || 0,
      });

      // Reset availability check when property changes
      setAvailabilityResult(null);
    }
  };

  // Handle date selection
  const handleDateSelect = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
    setFormData({
      ...formData,
      [field]: formattedDate,
    });

    // Reset availability check when dates change
    setAvailabilityResult(null);
  };
  const sendBookingConfirmationEmail = async (
    bookingId: string,
    data: BookingFormData
  ) => {
    if (!data.customerEmail) return;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `Booking Confirmation: ${data.propertyName}`,
          template: "booking-confirmation",
          data: {
            bookingId,
            customerName: data.customerName,
            propertyName: data.propertyName,
            startDate: data.startDate,
            endDate: data.endDate,
            amount:
              data.amount *
              calculateDays(new Date(data.startDate), new Date(data.endDate)),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email notification failed:", errorData);
      }
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
    }
  };

  // Check availability
  const handleCheckAvailability = async () => {
    if (!formData.propertyId || !formData.startDate || !formData.endDate) {
      toast({
        variant: "destructive",
        description:
          "Please select a property and date range to check availability",
      });
      setError("Please select a property and date range to check availability");
      return;
    }

    if (formData.startDate > formData.endDate) {
      toast({
        variant: "destructive",
        description:
          "The End date should be after the start date, Correct that.",
      });
      setError("The End date should be after the start date, Correct that.");
      return;
    }

    setIsCheckingAvailability(true);
    setError("");

    try {
      // Wait for the query to complete
      if (checkAvailability) {
        setAvailabilityResult(checkAvailability as AvailabilityResult);

        if (!(checkAvailability as AvailabilityResult).available) {
          const conflict = (checkAvailability as AvailabilityResult)
            .conflictingBooking;
          toast({
            variant: "destructive",
            description: `Property is already booked from ${new Date(conflict!.startDate).toLocaleDateString()} to ${new Date(
              conflict!.endDate
            ).toLocaleDateString()} by ${conflict!.customerName}`,
          });
          setError(
            `Property is already booked from ${new Date(conflict!.startDate).toLocaleDateString()} to ${new Date(
              conflict!.endDate
            ).toLocaleDateString()} by ${conflict!.customerName}`
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to check availability");
      toast({
        variant: "destructive",
        description: err.message || "Failed to check availability",
      });
      setAvailabilityResult(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.customerName ||
      !formData.propertyId ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Check if we've verified availability
    if (!availabilityResult || !availabilityResult.available) {
      setError("Please check availability before booking");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const bookingId = await addBooking({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        propertyId: formData.propertyId as Id<"properties">,
        propertyName: formData.propertyName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: formData.amount,
        depositAmount: parseFloat(formData.depositAmount),

        notes: formData.notes || undefined,
        status: formData.status,
        address: Object.values(formData.address).some((val) => val)
          ? {
              street: formData.address.street,
              city: formData.address.city,
              state: formData.address.state,
              zipCode: formData.address.zipCode,
              country: formData.address.country,
            }
          : undefined,
        nextOfKin: Object.values(formData.nextOfKin).some((val) => val)
          ? {
              name: formData.nextOfKin.name,
              relationship: formData.nextOfKin.relationship,
              phone: formData.nextOfKin.phone,
            }
          : undefined,
      });

      if (formData.customerEmail) {
        await sendBookingConfirmationEmail(bookingId, formData);
      }
      toast({
        title: "Booking created",
        description: `Successfully booked ${formData.propertyName} for ${formData.customerName}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create booking",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalAmount =
    formData.amount *
    (calculateDays(new Date(formData.startDate), new Date(formData.endDate)) ||
      1);

  // Required field indicator
  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {availabilityResult && availabilityResult.available && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Available!</AlertTitle>
          <AlertDescription className="text-green-700">
            This property is available for the selected dates.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">
              Property
              <RequiredIndicator />
            </Label>
            <Select
              value={formData.propertyId}
              onValueChange={handlePropertySelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property._id} value={property._id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Price
              <RequiredIndicator />
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Start Date
              <RequiredIndicator />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(new Date(formData.startDate), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : undefined
                  }
                  onSelect={(date) => handleDateSelect("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              End Date
              <RequiredIndicator />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate
                    ? format(new Date(formData.endDate), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.endDate ? new Date(formData.endDate) : undefined
                  }
                  onSelect={(date) => handleDateSelect("endDate", date)}
                  initialFocus
                  disabled={(date) =>
                    formData.startDate
                      ? date < new Date(formData.startDate)
                      : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleCheckAvailability}
          disabled={
            isCheckingAvailability ||
            !formData.propertyId ||
            !formData.startDate ||
            !formData.endDate
          }
          className="w-full"
        >
          {isCheckingAvailability ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking availability...
            </>
          ) : (
            "Check Availability"
          )}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4 text-rose-500" />
        <AlertDescription>
          Always check the availability of the apartment before you proceed.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Customer Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Customer Name
              <RequiredIndicator />
            </Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">
              Phone Number
              <RequiredIndicator />
            </Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              placeholder="Phone number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleInputChange}
            placeholder="Email address"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Next of Kin</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nextOfKin.name">Name</Label>
            <Input
              id="nextOfKin.name"
              name="nextOfKin.name"
              value={formData.nextOfKin.name}
              onChange={handleInputChange}
              placeholder="Next of kin name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextOfKin.relationship">Relationship</Label>
            <Input
              id="nextOfKin.relationship"
              name="nextOfKin.relationship"
              value={formData.nextOfKin.relationship}
              onChange={handleInputChange}
              placeholder="Relationship"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextOfKin.phone">Phone Number</Label>
          <Input
            id="nextOfKin.phone"
            name="nextOfKin.phone"
            value={formData.nextOfKin.phone}
            onChange={handleInputChange}
            placeholder="Next of kin phone number"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Booking Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={totalAmount}
              disabled
              readOnly
            />
            <p className="text-sm">Calculated based on days × daily rate</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Deposit Amount</Label>
            <Input
              id="depositAmount"
              name="depositAmount"
              type="number"
              value={formData.depositAmount.toString()}
              onChange={handleInputChange}
              min={"0"}
            />
            <p className="text-sm">Initial deposit amount (if applicable)</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional information"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full disabled:cursor-not-allowed"
        disabled={
          isSubmitting || !availabilityResult || !availabilityResult.available
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Booking...
          </>
        ) : (
          "Create Booking"
        )}
      </Button>
    </form>
  );
}

export const RequiredIndicator = () => (
  <span className="text-red-500 ml-1">*</span>
);
