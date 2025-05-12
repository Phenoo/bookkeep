"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "./_components/expense-form";
import { ExpensesTable } from "./_components/expense-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const Expensespage = () => {
  const expenses = useQuery(api.expenses.getAllExpenses) || [];

  const total = expenses && expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesLength = expenses && expenses.length;
  const formatNaira = (amount: number) =>
    `₦${(amount / 100).toLocaleString("en-NG", {
      style: "decimal",
      minimumFractionDigits: 2,
    })}`;

  const categorySums =
    expenses &&
    expenses.reduce((sums: Record<string, number>, expense) => {
      const { category, amount } = expense;
      if (!sums[category]) {
        sums[category] = 0;
      }
      sums[category] += amount;
      return sums;
    }, {});

  // Find category with the highest total amount
  const highestCategory = Object.keys(categorySums).reduce(
    (maxCategory, category) => {
      return categorySums[category] > categorySums[maxCategory]
        ? category
        : maxCategory;
    },
    Object.keys(categorySums)[0]
  );

  const highestAmount = categorySums[highestCategory];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
      <p className="text-muted-foreground">
        Track and manage your business expenses
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"> {formatNaira(total)}</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Biggest Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {highestCategory || ""}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNaira(highestAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expensesLength}</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4  ">
        <ExpensesTable />
      </div>
    </div>
  );
};

export default Expensespage;
