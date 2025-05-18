"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Pen, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-uploader";
import { useRouter } from "next/navigation";

export function ExpenseForm() {
  const { toast: toaster } = useToast();
  const router = useRouter();

  const { userId } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [success, setSucccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    paymentMethod: "",
    vendor: "",
    notes: "",
    image: "",
    recurringFrequency: "",
  });

  // Create expense mutation
  const createExpense = useMutation(api.expenses.createExpense);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate form
    if (!formData.title.trim()) {
      toaster({
        title: "Error",
        description: "Please enter an expense title",
        variant: "destructive",
      });
      return;
    }

    if (
      isNaN(Number.parseFloat(formData.amount)) ||
      Number.parseFloat(formData.amount) <= 0
    ) {
      toaster({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toaster({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      toast.loading("Recording expense...");

      await createExpense({
        title: formData.title,
        amount: Math.round(Number.parseFloat(formData.amount) * 100), // Convert to cents
        category: formData.category,
        date: date.toISOString(),
        paymentMethod: formData.paymentMethod || undefined,
        vendor: formData.vendor || undefined,
        notes: formData.notes || undefined,
        image: formData.image || undefined,
        createdBy: userId || "unknown",
        isRecurring: isRecurring,
        recurringFrequency: isRecurring
          ? formData.recurringFrequency
          : undefined,
      });
      setSucccess(true);
      toast.dismiss();
      toast.success("Expense has been recorded successfully!", {
        style: {
          background: "green",
          color: "white",
        },
      });
      setFormData({
        title: "",
        amount: "",
        category: "",
        paymentMethod: "",
        vendor: "",
        image: "",
        notes: "",
        recurringFrequency: "",
      });
      setDate(new Date());
      setIsRecurring(false);
      router.refresh();
      // Reset form
    } catch (error) {
      toast.dismiss();
      toast.error(
        "Failed to record expense: " +
          (error instanceof Error ? error.message : "Unknown error"),
        {
          style: {
            background: "red",
            color: "white",
          },
        }
      );
    }
  };

  return (
    <Card className="max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>Record a new business expense</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Expense Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter expense title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleSelectChange("paymentMethod", value)
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor/Supplier</Label>
            <Input
              id="vendor"
              name="vendor"
              placeholder="Enter vendor or supplier name"
              value={formData.vendor}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Receipt Document (Optional)</Label>
            <ImageUpload
              value={formData.image}
              trigger={success}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional details"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function EditExpenseForm({ expense, setIsEditing }: any) {
  const { toast: toaster } = useToast();
  const router = useRouter();
  const { userId } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [success, setSucccess] = useState(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    vendor: expense.vendor,
    notes: expense.notes,
    image: expense.image,
    recurringFrequency: "",
  });

  useEffect(() => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor,
      image: expense.image,
      notes: expense.notes,
      recurringFrequency: "",
    });
    // handleSelectChange("category", expense.category);
    // handleSelectChange("paymentMethod", expense.paymentMethod);
  }, [expense]);

  // Create expense mutation
  const editExpense = useMutation(api.expenses.updateExpense);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate form
    if (!formData.title.trim()) {
      toaster({
        title: "Error",
        description: "Please enter an expense title",
        variant: "destructive",
      });
      return;
    }

    if (
      isNaN(Number.parseFloat(formData.amount)) ||
      Number.parseFloat(formData.amount) <= 0
    ) {
      toaster({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toaster({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(false);

    try {
      toast.loading("Recording expense...");

      await editExpense({
        id: expense._id,
        title: formData.title,
        amount: Math.round(Number.parseFloat(formData.amount) * 100), // Convert to cents
        category: formData.category,
        date: date.toISOString(),
        paymentMethod: formData.paymentMethod || undefined,
        vendor: formData.vendor || undefined,
        image: formData.image || undefined,
        notes: formData.notes || undefined,
        updatedBy: userId || "unknown",
        isRecurring: isRecurring,
        recurringFrequency: isRecurring
          ? formData.recurringFrequency
          : undefined,
      });

      toast.dismiss();
      setSucccess(true);
      toast.success("Expense has been updated successfully!", {
        style: {
          background: "green",
          color: "white",
        },
      });
      setFormData({
        title: "",
        amount: "",
        category: "",
        paymentMethod: "",
        vendor: "",
        notes: "",
        image: null,
        recurringFrequency: "",
      });
      setDate(new Date());
      setIsRecurring(false);
      router.refresh();
      // Reset form
    } catch (error) {
      toast.dismiss();
      toast.error(
        "Failed to record expense: " +
          (error instanceof Error ? error.message : "Unknown error"),
        {
          style: {
            background: "red",
            color: "white",
          },
        }
      );
    }
  };

  return (
    <Card className="border-none mt-4 max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Expense Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter expense title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleSelectChange("paymentMethod", value)
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor/Supplier</Label>
            <Input
              id="vendor"
              name="vendor"
              placeholder="Enter vendor or supplier name"
              value={formData.vendor}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Receipt Document (Optional)</Label>
            <ImageUpload
              value={formData.image}
              trigger={success}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional details"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Pen className="mr-2 h-4 w-4" /> Edit Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
