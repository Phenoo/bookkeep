"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatNaira } from "@/lib/utils";

type MenuItem = {
  _id: Id<"menuItems">;
  _creationTime: number;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  createdBy?: string;
};

export function MenuItemsManager() {
  const menuItems = useQuery(api.menu.getAllMenuItems) || [];
  const createMenuItem = useMutation(api.menu.createMenuItem);
  const updateMenuItem = useMutation(api.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.menu.deleteMenuItem);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "food",
    image: "",
    description: "",
  });

  const categories = [
    { value: "food", label: "Food" },
    { value: "drink", label: "Drink" },
    { value: "dessert", label: "Dessert" },
    { value: "snack", label: "Snack" },
    { value: "other", label: "Other" },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      category: "food",
      image: "",
      description: "",
    });
  };

  const handleAddMenuItem = async () => {
    try {
      await createMenuItem({
        name: formData.name,
        price: formData.price,
        category: formData.category,
        image: formData.image || undefined,
        description: formData.description || undefined,
      });

      toast({
        title: "Menu Item Added",
        description: `${formData.name} has been added successfully.`,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setFormData({
      name: menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      image: menuItem.image || "",
      description: menuItem.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMenuItem = async () => {
    if (!selectedMenuItem) return;

    try {
      await updateMenuItem({
        id: selectedMenuItem._id,
        name: formData.name,
        price: formData.price,
        category: formData.category,
        image: formData.image || undefined,
        description: formData.description || undefined,
      });

      toast({
        title: "Menu Item Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMenuItem = async (id: Id<"menuItems">) => {
    if (
      confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      try {
        await deleteMenuItem({ id });

        toast({
          title: "Menu Item Deleted",
          description: "The menu item has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete menu item. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const MenuItemForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter item name"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({
              ...formData,
              price: Number.parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="Enter image URL (optional)"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter item description (optional)"
          rows={3}
        />
      </div>
    </div>
  );

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">
          Menu Items ({menuItems.length})
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Enter the details for the new menu item. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMenuItem}>Save Menu Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedMenuItems).length > 0 ? (
        Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-medium capitalize">{category}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item._id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-lg font-bold">
                        {formatNaira(item.price)}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.image && (
                        <div className="aspect-video overflow-hidden rounded-md">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMenuItem(item)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No menu items found</p>
            <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
              Add your first menu item
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the menu item details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMenuItem}>Update Menu Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
