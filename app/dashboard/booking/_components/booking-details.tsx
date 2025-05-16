import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  User,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";

// Helper function to format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

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

// Calculate the number of days between start and end dates
export const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface BookingDetailsProps {
  booking: any;
}

export function BookingDetails({ booking }: BookingDetailsProps) {
  if (!booking) return null;

  const days = calculateDays(booking.startDate, booking.endDate);
  const dailyRate = booking.amount / days;

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{booking.propertyName}</h2>
          <p className="text-muted-foreground">
            Booking ID: <span className="font-mono">{booking._id}</span>
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${getStatusColor(booking.status)} px-3 py-1 text-sm`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-lg">{booking.customerName}</p>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>{booking.customerEmail}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>{booking.customerPhone}</span>
              </div>
            </div>

            {booking.address && (
              <>
                <Separator />
                <div>
                  <p className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {booking.address.street && <p>{booking.address.street}</p>}
                    {booking.address.city && booking.address.state && (
                      <p>
                        {booking.address.city}, {booking.address.state}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {booking.nextOfKin && booking.nextOfKin.name && (
              <>
                <Separator />
                <div>
                  <p className="font-medium mb-2">Next of Kin</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{booking.nextOfKin.name}</p>
                    {booking.nextOfKin.relationship && (
                      <p>Relationship: {booking.nextOfKin.relationship}</p>
                    )}
                    {booking.nextOfKin.phone && (
                      <p>Phone: {booking.nextOfKin.phone}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-medium">
                  {format(new Date(booking.startDate), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {format(new Date(booking.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {days} {days === 1 ? "day" : "days"}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Daily Rate</p>
                <p className="font-medium">{formatNaira(booking.amount)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  {formatNaira(booking.amount * days)}
                </p>
              </div>
              {booking.depositAmount > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Deposit Paid</p>
                  <p className="font-medium">
                    {formatNaira(booking.depositAmount)}
                  </p>
                </div>
              )}
              {booking.depositAmount > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Balance Due</p>
                  <p className="font-medium">
                    {formatNaira(booking.amount * days - booking.depositAmount)}
                  </p>
                </div>
              )}
            </div>

            {booking.createdAt && (
              <>
                <Separator />
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Created:{" "}
                    {format(
                      new Date(booking.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </>
            )}

            {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  Last updated:{" "}
                  {format(
                    new Date(booking.updatedAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {booking.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{booking.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">
                  {formatNaira(booking.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    booking.depositAmount >= booking.amount
                      ? "confirmed"
                      : "pending"
                  )}
                >
                  {booking.depositAmount >= booking.amount
                    ? "Paid in Full"
                    : "Partially Paid"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Deposit Paid</p>
                <p className="font-medium">
                  {formatNaira(booking.depositAmount)}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Balance Due</p>
                <p className="font-medium">
                  {formatNaira(
                    Math.max(0, booking.amount - booking.depositAmount)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
