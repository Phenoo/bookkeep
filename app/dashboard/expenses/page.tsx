"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "./_components/expense-form";
import { ExpensesTable } from "./_components/expense-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const Expensespage = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
      <p className="text-muted-foreground">
        Track and manage your business expenses
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExpenseForm />
        <ExpensesTable />
      </div>
    </div>
  );
};

export default Expensespage;
