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
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  MoreHorizontal,
  Plus,
  PlusCircle,
  Search,
  Trash,
} from "lucide-react";

import type { InventoryItem } from "@/lib/types";
import { InventoryTable } from "./_components/inventory-table";
import { AddItemDialog } from "./_components/add-item";
import { EditItemDialog } from "./_components/edit-item";
import { DeleteItemDialog } from "./_components/delete-item";

// Sample inventory data
const inventoryItems = [
  {
    id: "INV001",
    name: "Office Desk",
    category: "Furniture",
    quantity: 24,
    status: "In Stock",
    lastUpdated: "2023-05-01",
  },
  {
    id: "INV002",
    name: "Ergonomic Chair",
    category: "Furniture",
    quantity: 15,
    status: "In Stock",
    lastUpdated: "2023-05-02",
  },
  {
    id: "INV003",
    name: "Laptop Stand",
    category: "Accessories",
    quantity: 8,
    status: "Low Stock",
    lastUpdated: "2023-05-03",
  },
  {
    id: "INV004",
    name: "Wireless Mouse",
    category: "Electronics",
    quantity: 32,
    status: "In Stock",
    lastUpdated: "2023-05-04",
  },
  {
    id: "INV005",
    name: "Wireless Keyboard",
    category: "Electronics",
    quantity: 0,
    status: "Out of Stock",
    lastUpdated: "2023-05-05",
  },
  {
    id: "INV006",
    name: "Monitor",
    category: "Electronics",
    quantity: 12,
    status: "In Stock",
    lastUpdated: "2023-05-06",
  },
  {
    id: "INV007",
    name: "Desk Lamp",
    category: "Accessories",
    quantity: 5,
    status: "Low Stock",
    lastUpdated: "2023-05-07",
  },
];

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory([...inventory, newItem]);
    setIsAddDialogOpen(false);
  };

  const handleEditItem = (updatedItem: InventoryItem) => {
    setInventory(
      inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-2">Inventory Items</h2>
        <p className="text-muted-foreground mb-6">
          Manage your inventory items, track stock levels, and update
          quantities.
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export</Button>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <InventoryTable
          inventory={filteredInventory}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </div>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
        existingIds={inventory.map((item) => item.id)}
      />

      {selectedItem && (
        <>
          <EditItemDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            item={selectedItem}
            onEdit={handleEditItem}
          />

          <DeleteItemDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            item={selectedItem}
            onDelete={handleDeleteItem}
          />
        </>
      )}
    </div>
  );
};

export default InventoryPage;
