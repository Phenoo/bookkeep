"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const formSchema = z
  .object({
    customerName: z.string().min(2, {
      message: "Customer name must be at least 2 characters.",
    }),
    customerEmail: z.string().optional(),
    customerPhone: z.string().min(5, {
      message: "Please enter a valid phone number.",
    }),
    propertyId: z.string({
      required_error: "Please select a property.",
    }),
    propertyName: z.string(),
    startDate: z.date({
      required_error: "Please select a start date.",
    }),
    endDate: z
      .date({
        required_error: "Please select an end date.",
      })
      .refine((date) => date > new Date(), {
        message: "End date must be in the future.",
      }),
    amount: z.coerce.number().positive({
      message: "Amount must be a positive number.",
    }),
    totalAmount: z.coerce.number().positive({
      message: "Total amount must a number",
    }),
    depositAmount: z.coerce.number().nonnegative({
      message: "Deposit amount must be a non-negative number.",
    }),
    notes: z.string().optional(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
      required_error: "Please select a status.",
    }),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
      .optional(),
    // Add next of kin fields
    nextOfKin: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

interface BookingFormProps {
  properties: Array<{
    _id: string;
    name: string;
    pricePerDay?: number;
  }>;
  onSuccess?: () => void;
}

export function BookingForm({ properties, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>();
  const addBooking = useMutation(api.bookings.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      propertyId: "",
      propertyName: "",
      startDate: new Date(),
      address: {
        street: "",
        city: "",
        state: "",
      },
      nextOfKin: {
        name: "",
        relationship: "",
        phone: "",
      },
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      amount: 0,
      depositAmount: 0,
      notes: "",
      status: "pending",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Find the property name based on the selected ID
      const selectedProperty = properties.find(
        (p) => p._id === values.propertyId
      );
      if (selectedProperty) {
        values.propertyName = selectedProperty.name;
      }

      await addBooking({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        propertyId: values.propertyId,
        propertyName: values.propertyName,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        amount: values.totalAmount,
        depositAmount: values.depositAmount,
        notes: values.notes,
        status: values.status,
      });

      toast({
        title: "Booking created",
        description: "The booking has been successfully created.",
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update property name when property ID changes
  const handlePropertyChange = (propertyId: string) => {
    const selectedProperty = properties.find((p) => p._id === propertyId);
    if (selectedProperty) {
      form.setValue("propertyName", selectedProperty.name);
      setSelectedProperty(selectedProperty);
    }
  };

  // Calculate the number of days between start and end dates
  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate total amount based on days and daily rate
  const calculateTotalAmount = () => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");
    const dailyRate = form.getValues("amount");

    if (startDate && endDate && dailyRate) {
      const days = calculateDays(startDate, endDate);
      const total = days * dailyRate;
      form.setValue("totalAmount", total);
      return total;
    }
    return 0;
  };

  // Recalculate total amount when dates or amount changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "startDate" || name === "endDate" || name === "amount") {
        calculateTotalAmount();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find((p) => p._id === selectedProperty._id);

      form.setValue("amount", property?.pricePerDay);
    }
  }, [selectedProperty]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Awka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Anambra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Next of Kin</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nextOfKin.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextOfKin.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Spouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextOfKin.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 987-6543" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Booking Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePropertyChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property._id} value={property._id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </FormControl>
                  <FormDescription>Price per day</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      {...field}
                      onWheel={(e) => e.currentTarget.blur()}
                      readOnly
                    />
                  </FormControl>
                  <FormDescription>
                    Calculated based on days × daily rate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depositAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Initial deposit amount (if applicable)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional details about the booking..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Booking..." : "Create Booking"}
        </Button>
      </form>
    </Form>
  );
}
