"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockAdjustmentDialogProps {
  inventoryId: Id<"inventory"> | null;
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  currentQuantity?: number;
  unit?: string;
}

export function StockAdjustmentDialog({
  inventoryId,
  isOpen,
  onClose,
  itemName,
  currentQuantity = 0,
  unit = "",
}: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState<number>(0);
  const [costPerUnit, setCostPerUnit] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mutations
  const addStock = useMutation(api.inventory.addStock);
  const removeStock = useMutation(api.inventory.removeStock);

  // Reset form
  const resetForm = () => {
    setAdjustmentType("add");
    setQuantity(0);
    setCostPerUnit(undefined);
    setReason("");
    setNotes("");
    setReference("");
    setIsSubmitting(false);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!inventoryId) return;

    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for this adjustment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (adjustmentType === "add") {
        await addStock({
          id: inventoryId,
          quantity,
          costPerUnit,
          reason,
          notes: notes || undefined,
          documentReference: reference || undefined,
        });

        toast({
          title: "Stock added",
          description: `Added ${quantity} ${unit} to ${itemName}`,
        });
      } else {
        // Check if we have enough stock
        if (quantity > (currentQuantity || 0)) {
          toast({
            title: "Insufficient stock",
            description: `Cannot remove more than the current quantity (${currentQuantity} ${unit})`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await removeStock({
          id: inventoryId,
          quantity,
          reason,
          notes: notes || undefined,
          documentReference: reference || undefined,
        });

        toast({
          title: "Stock removed",
          description: `Removed ${quantity} ${unit} from ${itemName}`,
        });
      }

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${adjustmentType} stock: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {itemName}</DialogTitle>
          <DialogDescription>
            {adjustmentType === "add" ? "Add stock to" : "Remove stock from"}{" "}
            this inventory item
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid  gap-4">
            <div className="flex flex-col gap-2">
              <Label>Adjustment Type</Label>
              <div className="flex">
                <Button
                  type="button"
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  className="flex-1 rounded-r-none"
                  onClick={() => setAdjustmentType("add")}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "remove" ? "default" : "outline"}
                  className="flex-1 rounded-l-none"
                  onClick={() => setAdjustmentType("remove")}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Remove Stock
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity ({unit || 0})</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          {adjustmentType === "add" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="costPerUnit">
                Cost Per Unit (Optional - leave blank to keep current cost)
              </Label>
              <Input
                id="costPerUnit"
                type="number"
                min="0"
                step="1"
                value={costPerUnit === undefined ? "" : costPerUnit}
                onChange={(e) =>
                  setCostPerUnit(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason for adjustment" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentType === "add" ? (
                  <>
                    <SelectItem value="Restocking">Restocking</SelectItem>
                    <SelectItem value="Purchase">New Purchase</SelectItem>
                    <SelectItem value="Return">Customer Return</SelectItem>
                    <SelectItem value="Correction">
                      Inventory Correction
                    </SelectItem>
                    <SelectItem value="Transfer">Transfer In</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Damaged">Damaged/Expired</SelectItem>
                    <SelectItem value="Loss">Loss/Theft</SelectItem>
                    <SelectItem value="Correction">
                      Inventory Correction
                    </SelectItem>
                    <SelectItem value="Transfer">Transfer Out</SelectItem>
                  </>
                )}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              placeholder="e.g., Order #, Invoice #, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this adjustment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Processing..."
              : adjustmentType === "add"
                ? "Add Stock"
                : "Remove Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
