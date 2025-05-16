"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatNaira, UNIT_CATEGORIES } from "@/lib/utils";
import { Spinner } from "@/components/spinner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  Plus,
  Search,
  Edit,
  Trash,
  MoreHorizontal,
  History,
  ArrowUpDown,
} from "lucide-react";
import { InventoryHistoryDialog } from "./_components/inventory-history";
import { StockAdjustmentDialog } from "./_components/stock-adjustment";

interface InventoryItem {
  _id: Id<"inventory">;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  reorderLevel: number;
  supplier: string;
  status: string;
  lastUpdated: string;
  notes?: string;
  createdBy?: string;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isStockAdjustmentDialogOpen, setIsStockAdjustmentDialogOpen] =
    useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Id<"inventory">[]>([]);
  const [isCategoryEditDialogOpen, setIsCategoryEditDialogOpen] =
    useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: "",
    costPerUnit: "",
    reorderLevel: "",
    supplier: "",
    notes: "",
  });

  const { user, isLoaded: isClerkLoaded } = useUser();

  const getUser = useQuery(
    api.users.getByClerkId,
    isClerkLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    costPerUnit: 0,
    reorderLevel: 0,
    supplier: "",
    notes: "",
  });

  // Fetch inventory items
  const inventoryItems = useQuery(api.inventory.getAll) || [];

  // Mutations
  const addInventoryItem = useMutation(api.inventory.add);
  const updateInventoryItem = useMutation(api.inventory.update);
  const deleteInventoryItem = useMutation(api.inventory.remove);
  const addCreationHistory = useMutation(
    api.migrations.addCreationHistoryToExistingInventory
  );

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(inventoryItems.map((item) => item.category)),
  ];

  // Filter inventory items based on search query and category
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "quantity" || name === "costPerUnit" || name === "reorderLevel"
          ? Number.parseFloat(value) || 0
          : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      costPerUnit: 0,
      reorderLevel: 0,
      supplier: "",
      notes: "",
    });
  };

  // Open edit dialog
  const openEditDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
      reorderLevel: item.reorderLevel,
      supplier: item.supplier,
      notes: item.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Open history dialog
  const openHistoryDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsHistoryDialogOpen(true);
  };

  // Open stock adjustment dialog
  const openStockAdjustmentDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsStockAdjustmentDialogOpen(true);
  };

  // Handle add item
  const handleAddItem = async () => {
    try {
      // Calculate total value
      const totalValue = formData.quantity * formData.costPerUnit;

      // Determine status
      let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
      if (formData.quantity === 0) {
        status = "Out of Stock";
      } else if (formData.quantity <= formData.reorderLevel) {
        status = "Low Stock";
      }

      // Call the mutation to add the item to the database
      await addInventoryItem({
        ...formData,
        totalValue,
        status,
        lastUpdated: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!currentItem) return;

    try {
      // Calculate total value
      const totalValue = formData.quantity * formData.costPerUnit;

      // Determine status
      let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
      if (formData.quantity === 0) {
        status = "Out of Stock";
      } else if (formData.quantity <= formData.reorderLevel) {
        status = "Low Stock";
      }

      await updateInventoryItem({
        id: currentItem._id,
        ...formData,
        totalValue,
        status,
        lastUpdated: new Date().toISOString(),
        reason: "Manual update",
      });

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });

      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!currentItem) return;

    try {
      await deleteInventoryItem({
        id: currentItem._id,
      });

      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    try {
      // Create an object with only the fields that have values
      const updateData: Record<string, any> = {};
      if (bulkEditData.category) updateData.category = bulkEditData.category;
      if (bulkEditData.costPerUnit)
        updateData.costPerUnit = Number(bulkEditData.costPerUnit);
      if (bulkEditData.reorderLevel)
        updateData.reorderLevel = Number(bulkEditData.reorderLevel);
      if (bulkEditData.supplier) updateData.supplier = bulkEditData.supplier;
      if (bulkEditData.notes) updateData.notes = bulkEditData.notes;

      // If no fields to update, show a message and return
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes",
          description: "Please specify at least one field to update",
        });
        return;
      }

      // Update each selected item
      const updatePromises = selectedItems.map((itemId) =>
        updateInventoryItem({
          id: itemId,
          ...updateData,
          lastUpdated: new Date().toISOString(),
          reason: "Bulk update",
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: `Updated ${selectedItems.length} inventory items successfully`,
      });

      // Reset form and close dialog
      setBulkEditData({
        category: "",
        costPerUnit: "",
        reorderLevel: "",
        supplier: "",
        notes: "",
      });
      setSelectedItems([]);
      setIsBulkEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory items",
        variant: "destructive",
      });
    }
  };

  // Handle checkbox selection
  const toggleItemSelection = (itemId: Id<"inventory">) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item._id));
    }
  };

  // Export inventory to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Category",
      "Quantity",
      "Unit",
      "Cost Per Unit",
      "Total Value",
      "Reorder Level",
      "Supplier",
      "Status",
      "Last Updated",
      "Notes",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map((item) =>
        [
          item.name,
          item.category,
          item.quantity,
          item.unit,
          item.costPerUnit,
          item.totalValue,
          item.reorderLevel,
          item.supplier,
          item.status,
          item.lastUpdated,
          item.notes || "",
        ]
          .map((cell) => `"${cell}"`)
          .join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Out of Stock":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const role = getUser?.role;

  if (getUser === undefined || getUser === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const runMigration = async () => {
    try {
      const migrationResult = await addCreationHistory({});
    } catch (error) {
    } finally {
    }
  };

  if (role === "user") {
    return redirect("/dashboard/pos");
  }

  // Handle bulk category update
  const handleBulkCategoryUpdate = async () => {
    try {
      if (!bulkCategory.trim()) {
        toast({
          title: "Error",
          description: "Please enter a category name",
          variant: "destructive",
        });
        return;
      }

      // Update each selected item
      const updatePromises = selectedItems.map((itemId) =>
        updateInventoryItem({
          id: itemId,
          category: bulkCategory,
          lastUpdated: new Date().toISOString(),
          reason: "Bulk category update",
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: `Updated category for ${selectedItems.length} inventory items`,
      });

      // Reset form and close dialog
      setBulkCategory("");
      setSelectedItems([]);
      setIsCategoryEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory items",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-2xl">
              Inventory Items
            </CardTitle>
            <CardDescription>
              Manage your inventory items, track stock levels, and update
              quantities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                {selectedItems.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsCategoryEditDialogOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Change Category (
                    {selectedItems.length})
                  </Button>
                )}
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={
                            selectedItems.length === filteredItems.length &&
                            filteredItems.length > 0
                          }
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item._id}
                        className={
                          selectedItems.includes(item._id) ? "bg-muted/50" : ""
                        }
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => toggleItemSelection(item._id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatNaira(item.costPerUnit)}</TableCell>
                        <TableCell>{formatNaira(item.totalValue)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(item.status)}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </TableCell>
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
                                onClick={() => openStockAdjustmentDialog(item)}
                              >
                                <ArrowUpDown className="mr-2 h-4 w-4" /> Adjust
                                Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openHistoryDialog(item)}
                              >
                                <History className="mr-2 h-4 w-4" /> View
                                History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(item)}
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., pcs, kg, liters"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="costPerUnit">Cost Per Unit</Label>
                <Input
                  id="costPerUnit"
                  name="costPerUnit"
                  type="number"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Enter cost per unit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  placeholder="Enter reorder level"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Make changes to the inventory item. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., pcs, kg, liters"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-costPerUnit">Cost Per Unit</Label>
                <Input
                  id="edit-costPerUnit"
                  name="costPerUnit"
                  type="number"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  placeholder="Enter cost per unit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  placeholder="Enter reorder level"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <InventoryHistoryDialog
        inventoryId={currentItem?._id || null}
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        itemName={currentItem?.name}
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        inventoryId={currentItem?._id || null}
        isOpen={isStockAdjustmentDialogOpen}
        onClose={() => setIsStockAdjustmentDialogOpen(false)}
        itemName={currentItem?.name}
        currentQuantity={currentItem?.quantity}
        unit={currentItem?.unit}
      />

      {/* Bulk Edit Dialog */}
      <Dialog
        open={isBulkEditDialogOpen}
        onOpenChange={setIsBulkEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Edit Inventory Items</DialogTitle>
            <DialogDescription>
              Edit {selectedItems.length} items at once. Only filled fields will
              be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bulk-category">Category</Label>
              <Input
                id="bulk-category"
                value={bulkEditData.category}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, category: e.target.value })
                }
                placeholder="Leave empty to keep existing values"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bulk-costPerUnit">Cost Per Unit</Label>
                <Input
                  id="bulk-costPerUnit"
                  type="number"
                  min="0"
                  value={bulkEditData.costPerUnit}
                  onChange={(e) =>
                    setBulkEditData({
                      ...bulkEditData,
                      costPerUnit: e.target.value,
                    })
                  }
                  placeholder="Leave empty to keep existing values"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bulk-reorderLevel">Reorder Level</Label>
                <Input
                  id="bulk-reorderLevel"
                  type="number"
                  min="0"
                  value={bulkEditData.reorderLevel}
                  onChange={(e) =>
                    setBulkEditData({
                      ...bulkEditData,
                      reorderLevel: e.target.value,
                    })
                  }
                  placeholder="Leave empty to keep existing values"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bulk-supplier">Supplier</Label>
              <Input
                id="bulk-supplier"
                value={bulkEditData.supplier}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, supplier: e.target.value })
                }
                placeholder="Leave empty to keep existing values"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bulk-notes">Notes</Label>
              <Textarea
                id="bulk-notes"
                value={bulkEditData.notes}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, notes: e.target.value })
                }
                placeholder="Leave empty to keep existing values"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Update {selectedItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Edit Dialog */}
      <Dialog
        open={isCategoryEditDialogOpen}
        onOpenChange={setIsCategoryEditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Category</DialogTitle>
            <DialogDescription>
              Update the category for {selectedItems.length} selected item
              {selectedItems.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bulk-category">New Category</Label>

              <Input
                className="mt-2"
                placeholder="Enter new category name"
                value={bulkCategory === "new-category" ? "" : bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkCategoryUpdate}>
              Update {selectedItems.length} Item
              {selectedItems.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
