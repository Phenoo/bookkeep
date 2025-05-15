"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Search, Trash, FileDown } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatNaira } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditExpenseForm } from "@/app/dashboard/expenses/_components/expense-form";

export function ExpensesTable() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editExpense, setEdtingExpense] = useState(false);
  const [expense, setExpense] = useState(null);
  // Fetch expenses from Convex
  const expenses = useQuery(api.expenses.getAllExpenses) || [];

  // Delete expense mutation
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  // Filter expenses based on search query and category filter
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    // const matchesCategory = categoryFilter
    //   ? expense.category === categoryFilter
    //   : true;

    const matchesCategory =
      !categoryFilter || categoryFilter === "all"
        ? true
        : expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: Id<"expenses">) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense({
          id,
          deletedBy: userId || "unknown",
        });

        toast({
          title: "Expense deleted",
          description: "The expense has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Format price to display in pounds

  // Get category color and label
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "supplies":
        return { color: "bg-blue-100 text-blue-800", label: "Supplies" };
      case "rent":
        return { color: "bg-purple-100 text-purple-800", label: "Rent" };
      case "utilities":
        return { color: "bg-yellow-100 text-yellow-800", label: "Utilities" };
      case "salaries":
        return { color: "bg-green-100 text-green-800", label: "Salaries" };
      case "maintenance":
        return { color: "bg-orange-100 text-orange-800", label: "Maintenance" };
      case "marketing":
        return { color: "bg-pink-100 text-pink-800", label: "Marketing" };
      case "transportation":
        return {
          color: "bg-indigo-100 text-indigo-800",
          label: "Transportation",
        };
      case "insurance":
        return { color: "bg-red-100 text-red-800", label: "Insurance" };
      case "taxes":
        return { color: "bg-gray-100 text-gray-800", label: "Taxes" };
      default:
        return { color: "bg-slate-100 text-slate-800", label: "Other" };
    }
  };

  return (
    <>
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Expenses History</CardTitle>
          <CardDescription>
            View and manage your business expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={categoryFilter || ""}
                onValueChange={(value) => setCategoryFilter(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
              <Button variant="outline" size="icon">
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">
                        <div>
                          {expense.title}
                          {expense.isRecurring && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Recurring
                            </Badge>
                          )}
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getCategoryDetails(expense.category).color}`}
                        >
                          {getCategoryDetails(expense.category).label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNaira(expense.amount)}</TableCell>
                      <TableCell>
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{expense.vendor || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setExpense(expense);
                                setEdtingExpense(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(expense._id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={editExpense}
        defaultOpen={editExpense}
        onOpenChange={() => setEdtingExpense(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <EditExpenseForm expense={expense} setIsEditing={setEdtingExpense} />
        </DialogContent>
      </Dialog>
    </>
  );
}
