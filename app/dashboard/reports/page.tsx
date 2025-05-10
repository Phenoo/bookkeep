"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { CalendarIcon, FileDown, BarChart3, PieChart } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { formatNaira } from "@/lib/utils";

export default function ReportsPage() {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<
    "sales" | "expenses" | "combined"
  >("combined");

  // Calculate week start and end dates
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // End on Sunday

  // Format dates for display
  const weekRangeDisplay = `${format(weekStart, "MMM d, yyyy")} - ${format(weekEnd, "MMM d, yyyy")}`;

  // Fetch sales data
  const salesData = useQuery(api.sales.getAllSales) || [];

  // Fetch expenses data
  const expensesData = useQuery(api.expenses.getAllExpenses) || [];

  // Filter data for the selected week
  const weekSales = salesData.filter((sale) => {
    const saleDate = parseISO(sale.saleDate);
    return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
  });

  const weekExpenses = expensesData.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
  });

  // Calculate totals
  const totalSales = weekSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalExpenses = weekExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netProfit = totalSales - totalExpenses;

  // Group sales by category
  const salesByCategory = weekSales.reduce(
    (acc, sale) => {
      const category = sale.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sale.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Group expenses by category
  const expensesByCategory = weekExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

  // Export report to CSV
  const exportToCSV = () => {
    let csvContent = "";
    let filename = "";

    if (reportType === "sales" || reportType === "combined") {
      // Sales report
      const salesHeaders = [
        "Date",
        "Order ID",
        "Category",
        "Customer",
        "Items",
        "Total Amount",
        "Payment Method",
        "Status",
      ];
      const salesRows = weekSales.map((sale) => [
        sale.saleDate,
        sale.orderId,
        sale.category || "Uncategorized",
        sale.customerName || "Anonymous",
        sale.items.length.toString(),
        sale.totalAmount.toString(),
        sale.paymentMethod || "Unknown",
        sale.status,
      ]);

      csvContent += "SALES REPORT\n";
      csvContent += `Week: ${weekRangeDisplay}\n\n`;
      csvContent += salesHeaders.join(",") + "\n";
      csvContent += salesRows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      if (reportType === "combined") {
        csvContent += "\n\n";
      }
    }

    if (reportType === "expenses" || reportType === "combined") {
      // Expenses report
      const expensesHeaders = [
        "Date",
        "Title",
        "Category",
        "Amount",
        "Vendor",
        "Payment Method",
        "Notes",
      ];
      const expensesRows = weekExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.category,
        expense.amount.toString(),
        expense.vendor || "",
        expense.paymentMethod || "Unknown",
        expense.notes || "",
      ]);

      csvContent += "EXPENSES REPORT\n";
      csvContent += `Week: ${weekRangeDisplay}\n\n`;
      csvContent += expensesHeaders.join(",") + "\n";
      csvContent += expensesRows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
    }

    if (reportType === "combined") {
      // Summary
      csvContent += "\n\nSUMMARY\n";
      csvContent += `Total Sales: $${totalSales.toFixed(2)}\n`;
      csvContent += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
      csvContent += `Net Profit: $${netProfit.toFixed(2)}\n`;
    }

    // Set filename based on report type
    filename = `${reportType}_report_${format(weekStart, "yyyy-MM-dd")}_to_${format(weekEnd, "yyyy-MM-dd")}.csv`;

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Weekly Reports</h1>
        <Button onClick={exportToCSV}>
          <FileDown className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToPreviousWeek}>
            Previous Week
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {weekRangeDisplay}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedWeek}
                onSelect={(date) => date && setSelectedWeek(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={goToNextWeek}>
            Next Week
          </Button>
        </div>

        <Select
          value={reportType}
          onValueChange={(value) =>
            setReportType(value as "sales" | "expenses" | "combined")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Report</SelectItem>
            <SelectItem value="expenses">Expenses Report</SelectItem>
            <SelectItem value="combined">Combined Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              {weekSales.length} transactions this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNaira(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {weekExpenses.length} expenses this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatNaira(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netProfit >= 0 ? "Profit" : "Loss"} this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>
                  Financial overview for {weekRangeDisplay}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Sales</span>
                    <span>{formatNaira(totalSales)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses</span>
                    <span>{formatNaira(totalExpenses)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold">Net Profit</span>
                    <span
                      className={`font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatNaira(netProfit)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Profit Margin:{" "}
                    {totalSales > 0
                      ? ((netProfit / totalSales) * 100).toFixed(2)
                      : 0}
                    %
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
                <CardDescription>
                  Sales vs Expenses for {weekRangeDisplay}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <div className="flex items-end h-[200px] gap-16">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 bg-blue-500 rounded-t-md"
                      style={{
                        height: `${Math.min((totalSales / Math.max(totalSales, totalExpenses)) * 200, 200)}px`,
                      }}
                    ></div>
                    <div className="mt-2 text-sm font-medium">Sales</div>
                    <div className="text-xs">{formatNaira(totalSales)}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 bg-red-500 rounded-t-md"
                      style={{
                        height: `${Math.min((totalExpenses / Math.max(totalSales, totalExpenses)) * 200, 200)}px`,
                      }}
                    ></div>
                    <div className="mt-2 text-sm font-medium">Expenses</div>
                    <div className="text-xs">{formatNaira(totalExpenses)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Breakdown</CardTitle>
              <CardDescription>
                Sales by category for {weekRangeDisplay}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(salesByCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(salesByCategory).map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{category}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>{formatNaira(amount)}</span>
                        <span className="text-xs text-muted-foreground">
                          {((amount / totalSales) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatNaira(totalSales)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <p>No sales data for this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses Breakdown</CardTitle>
              <CardDescription>
                Expenses by category for {weekRangeDisplay}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(expensesByCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(
                    ([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>{category}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>{formatNaira(amount)}</span>
                          <span className="text-xs text-muted-foreground">
                            {((amount / totalExpenses) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">
                      {formatNaira(totalExpenses)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <PieChart className="h-12 w-12 mb-2" />
                  <p>No expenses data for this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
