"use client";
import React from "react";

import { ExpenseForm } from "./_components/expense-form";
import { ExpensesTable } from "./_components/expense-table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Expensespage = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-2xl font-bold tracking-tight">Expenses</h1>
      <p className="text-muted-foreground">
        Track and manage your business expenses
      </p>
      <Tabs defaultValue="add-expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-expense">Add New Expense</TabsTrigger>
          <TabsTrigger value="expense-table">Expense History</TabsTrigger>
        </TabsList>
        <TabsContent value="add-expense">
          <ExpenseForm />
        </TabsContent>
        <TabsContent value="expense-table">
          <ExpensesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expensespage;
