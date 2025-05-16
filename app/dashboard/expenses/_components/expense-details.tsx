"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Eye, X, Download } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";

interface ExpenseDetailProps {
  expenseId: Id<"expenses"> | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetail({
  expenseId,
  isOpen,
  onClose,
}: ExpenseDetailProps) {
  const [imageFullscreen, setImageFullscreen] = useState(false);

  // Fetch the specific expense details
  const expense = useQuery(
    api.expenses.getExpenseById,
    expenseId ? { id: expenseId } : "skip"
  );

  if (!expense) return null;

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

  const handleDownloadReceipt = () => {
    if (expense.image) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = expense.image;
      link.download = `Receipt-${expense.title}-${format(new Date(expense.date), "yyyy-MM-dd")}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Expense Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{expense.title}</h2>
            <Badge className={`${getCategoryDetails(expense.category).color}`}>
              {getCategoryDetails(expense.category).label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {formatNaira(expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{format(new Date(expense.date), "MMMM d, yyyy")}</p>
            </div>
            {expense.vendor && (
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p>{expense.vendor}</p>
              </div>
            )}
            {expense.isRecurring && (
              <div>
                <p className="text-sm text-muted-foreground">Recurring</p>
                <Badge variant="outline">Yes</Badge>
              </div>
            )}
          </div>

          {expense.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm bg-muted p-3 rounded-md">{expense.notes}</p>
            </div>
          )}

          <Separator />

          {/* Receipt Image Section */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Receipt</p>
            {expense.image ? (
              <div className="space-y-2">
                <div className="relative border rounded-md overflow-hidden">
                  <Dialog
                    open={imageFullscreen}
                    onOpenChange={setImageFullscreen}
                  >
                    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white z-10"
                          onClick={() => setImageFullscreen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img
                          src={expense.image || "/placeholder.svg"}
                          alt="Receipt"
                          className="w-full h-auto max-h-[85vh] object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <img
                    src={expense.image || "/placeholder.svg"}
                    alt="Receipt"
                    className="w-full h-auto max-h-[300px] object-contain cursor-pointer"
                    onClick={() => setImageFullscreen(true)}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/20 hover:bg-black/40 text-white"
                      onClick={() => setImageFullscreen(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/20 hover:bg-black/40 text-white"
                      onClick={handleDownloadReceipt}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No receipt attached</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
