"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";

interface OrderFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: DateRange;
  onApplyFilters: (filters: any) => void;
}

export function OrderFiltersDialog({
  open,
  onOpenChange,
  dateRange,
  onApplyFilters,
}: OrderFiltersDialogProps) {
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("all");

  const handleApply = () => {
    onApplyFilters({
      dateRange: localDateRange,
      minAmount: minAmount ? Number.parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? Number.parseFloat(maxAmount) : undefined,
      category: category === "all" ? undefined : category,
    });
  };

  const handleReset = () => {
    setLocalDateRange({ from: undefined, to: undefined });
    setMinAmount("");
    setMaxAmount("");
    setCategory("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Orders</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your order history view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Calendar
              mode="range"
              selected={localDateRange}
              onSelect={setLocalDateRange as any}
              className="border rounded-md w-full"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Min Amount ($)</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Max Amount ($)</Label>
              <Input
                id="max-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Order Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Dine-in">Dine-in</SelectItem>
                <SelectItem value="Takeout">Takeout</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
