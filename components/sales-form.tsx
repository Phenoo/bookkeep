"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface SalesFormProps {
  category: "game" | "rent" | "food"
  onSave: (data: SaleItem) => void
}

export interface SaleItem {
  id: string
  name: string
  amount: number
  quantity: number
  date: Date
  notes: string
  category: "game" | "rent" | "food"
}

export default function SalesForm({ category, onSave }: SalesFormProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    quantity: "1",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number.parseFloat(formData.amount)) || Number.parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number.parseInt(formData.quantity)) || Number.parseInt(formData.quantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    // Create new sale item
    const newSale: SaleItem = {
      id: `sale-${Date.now()}`,
      name: formData.name,
      amount: Number.parseFloat(formData.amount),
      quantity: Number.parseInt(formData.quantity),
      date: date,
      notes: formData.notes,
      category,
    }

    // Save the sale
    onSave(newSale)

    // Reset form
    setFormData({
      name: "",
      amount: "",
      quantity: "1",
      notes: "",
    })
    setDate(new Date())

    // Show success toast
    toast({
      title: "Success",
      description: "Sale has been recorded successfully",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New {category.charAt(0).toUpperCase() + category.slice(1)} Sale</CardTitle>
        <CardDescription>Record a new sale in the {category} category</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              placeholder={`Enter ${category} item name`}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
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
            <Plus className="mr-2 h-4 w-4" /> Add Sale
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
