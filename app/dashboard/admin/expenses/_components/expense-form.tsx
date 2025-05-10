"use client";

import type React from "react";

import { useState } from "react";
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
import { CalendarIcon, Plus } from "lucide-react";
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

export function ExpenseForm() {
  const { toast: toaster } = useToast();
  const { userId } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    paymentMethod: "",
    vendor: "",
    notes: "",
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

    const promise = createExpense({
      title: formData.title,
      amount: Math.round(Number.parseFloat(formData.amount) * 100), // Convert to cents
      category: formData.category,
      date: date.toISOString(),
      paymentMethod: formData.paymentMethod || undefined,
      vendor: formData.vendor || undefined,
      notes: formData.notes || undefined,
      createdBy: userId || "unknown",
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? formData.recurringFrequency : undefined,
    });

    toast.promise(promise, {
      loading: "Expense has been recorded successfully",
      success: "Expense has been recorded successfully!",
      error: "Failed to record expense. Please try again",
    });

    setFormData({
      title: "",
      amount: "",
      category: "",
      paymentMethod: "",
      vendor: "",
      notes: "",
      recurringFrequency: "",
    });
    setDate(new Date());
    setIsRecurring(false);
  };

  return (
    <Card>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(!!checked)}
            />
            <Label
              htmlFor="isRecurring"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This is a recurring expense
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <Select
                value={formData.recurringFrequency}
                onValueChange={(value) =>
                  handleSelectChange("recurringFrequency", value)
                }
              >
                <SelectTrigger id="recurringFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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

// "use client";

// import type React from "react";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { CalendarIcon, Plus } from "lucide-react";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useAuth } from "@clerk/clerk-react";

// export function ExpenseForm() {
//   const { toast } = useToast();
//   const { userId } = useAuth();
//   const [date, setDate] = useState<Date>(new Date());
//   const [isRecurring, setIsRecurring] = useState(false);
//   const [formData, setFormData] = useState({
//     title: "",
//     amount: "",
//     category: "",
//     paymentMethod: "",
//     vendor: "",
//     notes: "",
//     recurringFrequency: "",
//   });

//   // Create expense mutation
//   const createExpense = useMutation(api.expenses.createExpense);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate form
//     if (!formData.title.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter an expense title",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (
//       isNaN(Number.parseFloat(formData.amount)) ||
//       Number.parseFloat(formData.amount) <= 0
//     ) {
//       toast({
//         title: "Error",
//         description: "Please enter a valid amount",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!formData.category) {
//       toast({
//         title: "Error",
//         description: "Please select a category",
//         variant: "destructive",
//       });
//       return;
//     }

//     const promise = createExpense({
//       title: formData.title,
//       amount: Math.round(Number.parseFloat(formData.amount) * 100), // Convert to cents
//       category: formData.category,
//       date: date.toISOString(),
//       paymentMethod: formData.paymentMethod || undefined,
//       vendor: formData.vendor || undefined,
//       notes: formData.notes || undefined,
//       createdBy: userId || "unknown",
//       isRecurring: isRecurring,
//       recurringFrequency: isRecurring
//         ? formData.recurringFrequency
//         : undefined,
//     });

//     toast.promise(promise, {
//       loading: "Deleting note...",
//       success: "Note deleted!",
//       error: "",
//     });

//     try {
//       // Create expense in Convex
//       await createExpense({
//         title: formData.title,
//         amount: Math.round(Number.parseFloat(formData.amount) * 100), // Convert to cents
//         category: formData.category,
//         date: date.toISOString(),
//         paymentMethod: formData.paymentMethod || undefined,
//         vendor: formData.vendor || undefined,
//         notes: formData.notes || undefined,
//         createdBy: userId || "unknown",
//         isRecurring: isRecurring,
//         recurringFrequency: isRecurring
//           ? formData.recurringFrequency
//           : undefined,
//       });

//       // Reset form
//       setFormData({
//         title: "",
//         amount: "",
//         category: "",
//         paymentMethod: "",
//         vendor: "",
//         notes: "",
//         recurringFrequency: "",
//       });
//       setDate(new Date());
//       setIsRecurring(false);

//       // Show success toast
//       toast({
//         title: "Success",
//         description: "Expense has been recorded successfully",
//       });

//     } catch (error) {
//       console.error("Error creating expense:", error);
//       toast({
//         title: "Error",
//         description: "Failed to record expense. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Add New Expense</CardTitle>
//         <CardDescription>Record a new business expense</CardDescription>
//       </CardHeader>
//       <form onSubmit={handleSubmit}>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="title">Expense Title</Label>
//             <Input
//               id="title"
//               name="title"
//               placeholder="Enter expense title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="amount">Amount (₦)</Label>
//               <Input
//                 id="amount"
//                 name="amount"
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 placeholder="0.00"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="category">Category</Label>
//               <Select
//                 value={formData.category}
//                 onValueChange={(value) => handleSelectChange("category", value)}
//               >
//                 <SelectTrigger id="category">
//                   <SelectValue placeholder="Select category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="supplies">Supplies</SelectItem>
//                   <SelectItem value="rent">Rent</SelectItem>
//                   <SelectItem value="utilities">Utilities</SelectItem>
//                   <SelectItem value="salaries">Salaries</SelectItem>
//                   <SelectItem value="maintenance">Maintenance</SelectItem>
//                   <SelectItem value="marketing">Marketing</SelectItem>
//                   <SelectItem value="transportation">Transportation</SelectItem>
//                   <SelectItem value="insurance">Insurance</SelectItem>
//                   <SelectItem value="taxes">Taxes</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Date</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-left font-normal"
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {date ? format(date, "PPP") : <span>Pick a date</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={date}
//                     onSelect={(date) => date && setDate(date)}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="paymentMethod">Payment Method</Label>
//               <Select
//                 value={formData.paymentMethod}
//                 onValueChange={(value) =>
//                   handleSelectChange("paymentMethod", value)
//                 }
//               >
//                 <SelectTrigger id="paymentMethod">
//                   <SelectValue placeholder="Select method" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="card">Card</SelectItem>
//                   <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                   <SelectItem value="mobile_money">Mobile Money</SelectItem>
//                   <SelectItem value="check">Check</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="vendor">Vendor/Supplier</Label>
//             <Input
//               id="vendor"
//               name="vendor"
//               placeholder="Enter vendor or supplier name"
//               value={formData.vendor}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="isRecurring"
//               checked={isRecurring}
//               onCheckedChange={(checked) => setIsRecurring(!!checked)}
//             />
//             <Label
//               htmlFor="isRecurring"
//               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//             >
//               This is a recurring expense
//             </Label>
//           </div>

//           {isRecurring && (
//             <div className="space-y-2">
//               <Label htmlFor="recurringFrequency">Frequency</Label>
//               <Select
//                 value={formData.recurringFrequency}
//                 onValueChange={(value) =>
//                   handleSelectChange("recurringFrequency", value)
//                 }
//               >
//                 <SelectTrigger id="recurringFrequency">
//                   <SelectValue placeholder="Select frequency" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="daily">Daily</SelectItem>
//                   <SelectItem value="weekly">Weekly</SelectItem>
//                   <SelectItem value="monthly">Monthly</SelectItem>
//                   <SelectItem value="quarterly">Quarterly</SelectItem>
//                   <SelectItem value="yearly">Yearly</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="notes">Notes (Optional)</Label>
//             <Textarea
//               id="notes"
//               name="notes"
//               placeholder="Add any additional details"
//               value={formData.notes}
//               onChange={handleChange}
//             />
//           </div>
//         </CardContent>
//         <CardFooter>
//           <Button type="submit" className="w-full">
//             <Plus className="mr-2 h-4 w-4" /> Add Expense
//           </Button>
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }
