"use client";

import { type SaleItem } from "@/components/sales-form";
import { OrderHistory } from "@/components/sales-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";

// Sample food sales data
const initialFoodSales: SaleItem[] = [];

export default function FoodSalesPage() {
  const foodSales = useQuery(api.orders.getAll) || [];

  // Load sales from localStorage on component mount

  if (foodSales === null) {
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );
  }

  if (foodSales === undefined) {
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Food Sales</h1>
      </div>

      <div className="grid gap-6  w-full">
        {/* <div className="md:col-span-1">
          <SalesForm category="food" onSave={handleSaveSale} />
        </div> */}
        <div className="w-full">
          <OrderHistory items={foodSales} />
        </div>
      </div>
    </div>
  );
}
