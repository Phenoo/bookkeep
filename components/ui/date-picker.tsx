"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string | Date;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

// Safari-safe date parsing function
function safeParseDateString(
  dateString: string | Date | undefined
): Date | undefined {
  if (!dateString) return undefined;

  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : undefined;
  }

  try {
    // Try parsing as ISO string first (Safari-friendly)
    if (typeof dateString === "string") {
      // If it's already in ISO format, parse it
      if (dateString.includes("T") || dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsed = parseISO(dateString);
        return isValid(parsed) ? parsed : undefined;
      }

      // Try creating a new Date object
      const parsed = new Date(dateString);
      return isValid(parsed) ? parsed : undefined;
    }
  } catch (error) {
    console.warn("Date parsing error:", error);
    return undefined;
  }

  return undefined;
}

// Safari-safe date formatting function
function formatDateToISO(date: Date): string {
  // Create ISO date string in local timezone (Safari-friendly)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the current value safely
  const selectedDate = React.useMemo(() => {
    return safeParseDateString(value);
  }, [value]);

  const handleDateSelect = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        // Convert to ISO string for consistent storage across browsers
        const isoString = formatDateToISO(date);
        onChange(isoString);
      } else {
        onChange(undefined);
      }
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
