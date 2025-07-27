"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { calculateDays } from "./booking-details";

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
  depositAmount: number;
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

interface EditBookingFormProps {
  bookingId: Id<"bookings">;
  properties: Property[];
  onSuccess: () => void;
}

export function EditBookingForm({
  bookingId,
  properties,
  onSuccess,
}: EditBookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] =
    useState<AvailabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form data with empty values
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    propertyId: "",
    propertyName: "",
    startDate: "",
    endDate: "",
    amount: 0,
    depositAmount: 0,
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

  // Fetch the booking data
  const booking = useQuery(api.bookings.getById, { id: bookingId });

  // Mutations
  const updateBooking = useMutation(api.bookings.update);
  const checkAvailability = useQuery(
    api.bookings.checkAvailability,
    formData.propertyId && formData.startDate && formData.endDate
      ? {
          propertyId: formData.propertyId as Id<"properties">,
          startDate: formData.startDate,
          endDate: formData.endDate,
          excludeBookingId: bookingId, // Exclude the current booking from availability check
        }
      : "skip"
  );

  // Populate form data when booking data is loaded
  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail || "",
        customerPhone: booking.customerPhone || "",
        propertyId: booking.propertyId,
        propertyName: booking.propertyName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        amount: booking.amount,
        depositAmount: booking.depositAmount,
        notes: booking.notes || "",
        status: booking.status,
        address: {
          street: booking.address?.street || "",
          city: booking.address?.city || "",
          state: booking.address?.state || "",
          zipCode: booking.address?.zipCode || "",
          country: booking.address?.country || "",
        },
        nextOfKin: {
          name: booking.nextOfKin?.name || "",
          relationship: booking.nextOfKin?.relationship || "",
          phone: booking.nextOfKin?.phone || "",
        },
      });
      setIsLoading(false);

      // Set initial availability to true since the booking already exists
      setAvailabilityResult({
        available: true,
        conflictingBooking: null,
      });
    }
  }, [booking]);

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
        amount: selectedProperty.pricePerDay || formData.amount,
      });

      // Reset availability check when property changes
      if (propertyId !== booking?.propertyId) {
        setAvailabilityResult(null);
      }
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
    if (
      formattedDate !==
      (field === "startDate" ? booking?.startDate : booking?.endDate)
    ) {
      setAvailabilityResult(null);
    }
  };

  const sendBookingUpdateEmail = async (data: BookingFormData) => {
    if (!data.customerEmail) return;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `Booking Update: ${data.propertyName}`,
          template: "booking-confirmation",
          data: {
            bookingId: bookingId,
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
      console.error("Failed to send booking update email:", error);
    }
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    setFormData({
      ...formData,
      status,
    });
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

    // Check if we've verified availability for changed dates/property
    const datesOrPropertyChanged =
      formData.propertyId !== booking?.propertyId ||
      formData.startDate !== booking?.startDate ||
      formData.endDate !== booking?.endDate;

    if (
      datesOrPropertyChanged &&
      (!availabilityResult || !availabilityResult.available)
    ) {
      setError("Please check availability before updating booking");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateBooking({
        id: bookingId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        propertyId: formData.propertyId as Id<"properties">,
        propertyName: formData.propertyName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: formData.amount,
        depositAmount: formData.depositAmount,
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
        await sendBookingUpdateEmail(formData);
      }
      toast({
        title: "Booking updated",
        description: `Successfully updated booking for ${formData.propertyName}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update booking");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update booking",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Required field indicator
  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

        <div className="space-y-2">
          <Label htmlFor="status">
            Booking Status
            <RequiredIndicator />
          </Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Only show availability check button if dates or property changed */}
        {(formData.propertyId !== booking?.propertyId ||
          formData.startDate !== booking?.startDate ||
          formData.endDate !== booking?.endDate) && (
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
        )}
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
            <Label htmlFor="customerPhone">Phone Number</Label>
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
        <h3 className="text-lg font-medium">Address Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              placeholder="City"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address.state">State/Province</Label>
            <Input
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              placeholder="State/Province"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.zipCode">Zip/Postal Code</Label>
            <Input
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              placeholder="Zip/Postal code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.country">Country</Label>
            <Input
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              placeholder="Country"
            />
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
        className="w-full"
        disabled={
          isSubmitting ||
          ((formData.propertyId !== booking?.propertyId ||
            formData.startDate !== booking?.startDate ||
            formData.endDate !== booking?.endDate) &&
            (!availabilityResult || !availabilityResult.available))
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Booking...
          </>
        ) : (
          "Update Booking"
        )}
      </Button>
    </form>
  );
}
