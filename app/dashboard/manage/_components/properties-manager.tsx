"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "@/hooks/use-toast"; // Updated import path
import { formatNaira } from "@/lib/utils";

type Property = {
  _id: Id<"properties">;
  _creationTime: number;
  name: string;
  description?: string;
  type: string;
  address?: string;
  floor: string;
  pricePerDay?: number;
  pricePerMonth?: number;
  isAvailable: boolean;
  createdBy?: string;
};

export function PropertiesManager() {
  const properties = useQuery(api.properties.getAll) || [];
  const addProperty = useMutation(api.properties.add);
  const updateProperty = useMutation(api.properties.update);
  const deleteProperty = useMutation(api.properties.remove);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "rental",
    floor: "",
    address: "",
    pricePerDay: 0,
    pricePerMonth: 0,
    isAvailable: true,
  });

  const propertyTypes = [
    { value: "rental", label: "Rental Property" },
    { value: "venue", label: "Event Venue" },
    { value: "equipment", label: "Equipment" },
    { value: "other", label: "Other" },
  ];

  const floorTypes = [
    { value: "Ground Floor", label: "Ground Floor" },
    { value: "First Floor", label: "First Floor" },
    { value: "Second Floor", label: "Second Floor" },
    { value: "Third Floor", label: "Third Floor" },
  ];
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "rental",
      floor: "",
      address: "",
      pricePerDay: 0,
      pricePerMonth: 0,
      isAvailable: true,
    });
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    try {
      await addProperty({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        floor: formData.floor,
        address: formData.address || undefined,
        pricePerDay: formData.pricePerDay || undefined,
        pricePerMonth: formData.pricePerMonth || undefined,
        isAvailable: formData.isAvailable,
      });

      toast({
        title: "Property Added",
        description: `${formData.name} has been added successfully.`,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      description: property.description || "",
      type: property.type,
      floor: property.floor,
      address: property.address || "",
      pricePerDay: property.pricePerDay || 0,
      pricePerMonth: property.pricePerMonth || 0,
      isAvailable: property.isAvailable,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    if (!selectedProperty) return;

    try {
      await updateProperty({
        id: selectedProperty._id,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        floor: formData.floor,
        address: formData.address || undefined,
        pricePerDay: formData.pricePerDay || undefined,
        pricePerMonth: formData.pricePerMonth || undefined,
        isAvailable: formData.isAvailable,
      });

      toast({
        title: "Property Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (id: Id<"properties">) => {
    if (
      confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      try {
        await deleteProperty({ id });

        toast({
          title: "Property Deleted",
          description: "The property has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete property. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">
          Properties ({properties.length})
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Enter the details for the new property. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProperty}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter property name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Property Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Property Floor</Label>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, floor: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floorTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter property description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter property address"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="pricePerDay">Price Per Day</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerDay: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pricePerMonth">Price Per Month</Label>
                    <Input
                      id="pricePerMonth"
                      type="number"
                      value={formData.pricePerMonth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerMonth: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isAvailable: checked })
                    }
                  />
                  <Label htmlFor="isAvailable">Available for booking</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Property</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{property.name}</span>
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${property.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Type: {property.type}</div>
                {property.description && (
                  <p className="text-sm text-muted-foreground">
                    {property.description}
                  </p>
                )}
                {property.floor && (
                  <div className="text-sm">Floor: {property.floor}</div>
                )}
                {property.address && (
                  <div className="text-sm">Location: {property.address}</div>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  {property.pricePerDay && (
                    <span>Daily: {formatNaira(property.pricePerDay)}</span>
                  )}
                  {property.pricePerMonth && (
                    <span>Monthly: {formatNaira(property.pricePerMonth)}</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditProperty(property)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteProperty(property._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}

        {properties.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No properties found
              </p>
              <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                Add your first property
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the property details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProperty}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Property Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Property Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Property Floor</Label>
                  <Select
                    value={formData.floor}
                    onValueChange={(value) =>
                      setFormData({ ...formData, floor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {floorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter property description"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter property address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-pricePerDay">Price Per Day</Label>
                  <Input
                    id="edit-pricePerDay"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerDay: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-pricePerMonth">Price Per Month</Label>
                  <Input
                    id="edit-pricePerMonth"
                    type="number"
                    value={formData.pricePerMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerMonth: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAvailable: checked })
                  }
                />
                <Label htmlFor="edit-isAvailable">Available for booking</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Property</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
