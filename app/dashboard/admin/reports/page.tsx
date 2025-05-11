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
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfYear,
  endOfYear,
  addYears,
  subYears,
  getYear,
  getMonth,
} from "date-fns";
import { CalendarIcon, FileDown, BarChart3, PieChart } from "lucide-react";
import { formatNaira } from "@/lib/utils";

export default function ReportsPage() {
  // Add period type state
  const [periodType, setPeriodType] = useState<"weekly" | "monthly" | "yearly">(
    "weekly"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<
    "sales" | "expenses" | "combined"
  >("combined");

  // Calculate period start and end dates based on period type
  let periodStart: Date;
  let periodEnd: Date;
  let periodRangeDisplay: string;

  if (periodType === "weekly") {
    periodStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
    periodEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // End on Sunday
    periodRangeDisplay = `${format(periodStart, "MMM d, yyyy")} - ${format(periodEnd, "MMM d, yyyy")}`;
  } else if (periodType === "monthly") {
    periodStart = startOfMonth(selectedDate);
    periodEnd = endOfMonth(selectedDate);
    periodRangeDisplay = format(selectedDate, "MMMM yyyy");
  } else {
    // yearly
    periodStart = startOfYear(selectedDate);
    periodEnd = endOfYear(selectedDate);
    periodRangeDisplay = format(selectedDate, "yyyy");
  }

  // Fetch sales data
  const salesData = useQuery(api.sales.getAllSales) || [];

  // Fetch expenses data
  const expensesData = useQuery(api.expenses.getAllExpenses) || [];

  // Filter data for the selected period
  const periodSales = salesData.filter((sale) => {
    const saleDate = parseISO(sale.saleDate);
    return isWithinInterval(saleDate, { start: periodStart, end: periodEnd });
  });

  const periodExpenses = expensesData.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, {
      start: periodStart,
      end: periodEnd,
    });
  });

  // Calculate totals
  const totalSales = periodSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );
  const totalExpenses = periodExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netProfit = totalSales - totalExpenses;

  // Group sales by category
  const salesByCategory = periodSales.reduce(
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
  const expensesByCategory = periodExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Navigation functions for different period types
  const goToPreviousPeriod = () => {
    if (periodType === "weekly") {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else if (periodType === "monthly") {
      setSelectedDate(subMonths(selectedDate, 1));
    } else {
      // yearly
      setSelectedDate(subYears(selectedDate, 1));
    }
  };

  const goToNextPeriod = () => {
    if (periodType === "weekly") {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else if (periodType === "monthly") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      // yearly
      setSelectedDate(addYears(selectedDate, 1));
    }
  };

  // Export report to CSV
  const exportToCSV = () => {
    let csvContent = "";
    let filename = "";
    const periodTypeCapitalized =
      periodType.charAt(0).toUpperCase() + periodType.slice(1);

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
      const salesRows = periodSales.map((sale) => [
        sale.saleDate,
        sale.orderId,
        sale.category || "Uncategorized",
        sale.customerName || "Anonymous",
        sale.items.length.toString(),
        sale.totalAmount.toString(),
        sale.paymentMethod || "Unknown",
        sale.status,
      ]);

      csvContent += `SALES REPORT (${periodTypeCapitalized})\n`;
      csvContent += `Period: ${periodRangeDisplay}\n\n`;
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
      const expensesRows = periodExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.category,
        expense.amount.toString(),
        expense.vendor || "",
        expense.paymentMethod || "Unknown",
        expense.notes || "",
      ]);

      csvContent += `EXPENSES REPORT (${periodTypeCapitalized})\n`;
      csvContent += `Period: ${periodRangeDisplay}\n\n`;
      csvContent += expensesHeaders.join(",") + "\n";
      csvContent += expensesRows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
    }

    if (reportType === "combined") {
      // Summary
      csvContent += "\n\nSUMMARY\n";
      csvContent += `Total Sales: ${formatNaira(totalSales)}\n`;
      csvContent += `Total Expenses: ${formatNaira(totalExpenses)}\n`;
      csvContent += `Net Profit: ${formatNaira(netProfit)}\n`;
    }

    // Set filename based on report type and period
    let periodForFilename = "";
    if (periodType === "weekly") {
      periodForFilename = `${format(periodStart, "yyyy-MM-dd")}_to_${format(periodEnd, "yyyy-MM-dd")}`;
    } else if (periodType === "monthly") {
      periodForFilename = format(selectedDate, "yyyy-MM");
    } else {
      // yearly
      periodForFilename = format(selectedDate, "yyyy");
    }

    filename = `${reportType}_${periodType}_report_${periodForFilename}.csv`;

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

  // Get appropriate title based on period type
  const getPageTitle = () => {
    switch (periodType) {
      case "weekly":
        return "Weekly Reports";
      case "monthly":
        return "Monthly Reports";
      case "yearly":
        return "Yearly Reports";
      default:
        return "Reports";
    }
  };

  // Render date selector based on period type
  const renderDateSelector = () => {
    if (periodType === "weekly") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {periodRangeDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    } else if (periodType === "monthly") {
      // For monthly, we'll show a month picker
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {periodRangeDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-2">
              <Select
                value={String(getMonth(selectedDate))}
                onValueChange={(value) => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(Number.parseInt(value));
                  setSelectedDate(newDate);
                }}
              >
                <SelectTrigger className="w-[180px] mb-2">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">January</SelectItem>
                  <SelectItem value="1">February</SelectItem>
                  <SelectItem value="2">March</SelectItem>
                  <SelectItem value="3">April</SelectItem>
                  <SelectItem value="4">May</SelectItem>
                  <SelectItem value="5">June</SelectItem>
                  <SelectItem value="6">July</SelectItem>
                  <SelectItem value="7">August</SelectItem>
                  <SelectItem value="8">September</SelectItem>
                  <SelectItem value="9">October</SelectItem>
                  <SelectItem value="10">November</SelectItem>
                  <SelectItem value="11">December</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(getYear(selectedDate))}
                onValueChange={(value) => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(Number.parseInt(value));
                  setSelectedDate(newDate);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      );
    } else {
      // yearly
      // For yearly, we'll show a year picker
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[120px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {periodRangeDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-2">
              <Select
                value={String(getYear(selectedDate))}
                onValueChange={(value) => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(Number.parseInt(value));
                  setSelectedDate(newDate);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
  };

  // Get navigation button labels based on period type
  const getPreviousButtonLabel = () => {
    switch (periodType) {
      case "weekly":
        return "Previous Week";
      case "monthly":
        return "Previous Month";
      case "yearly":
        return "Previous Year";
      default:
        return "Previous";
    }
  };

  const getNextButtonLabel = () => {
    switch (periodType) {
      case "weekly":
        return "Next Week";
      case "monthly":
        return "Next Month";
      case "yearly":
        return "Next Year";
      default:
        return "Next";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
        <Button onClick={exportToCSV}>
          <FileDown className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Period type selector */}
          <Select
            value={periodType}
            onValueChange={(value) =>
              setPeriodType(value as "weekly" | "monthly" | "yearly")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={goToPreviousPeriod}>
            {getPreviousButtonLabel()}
          </Button>

          {renderDateSelector()}

          <Button variant="outline" onClick={goToNextPeriod}>
            {getNextButtonLabel()}
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
              {periodSales.length} transactions this {periodType.slice(0, -2)}
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
              {periodExpenses.length} expenses this {periodType.slice(0, -2)}
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
              {netProfit >= 0 ? "Profit" : "Loss"} this{" "}
              {periodType.slice(0, -2)}
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
                <CardTitle>
                  {periodType.charAt(0).toUpperCase() + periodType.slice(1)}{" "}
                  Summary
                </CardTitle>
                <CardDescription>
                  Financial overview for {periodRangeDisplay}
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
                  Sales vs Expenses for {periodRangeDisplay}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <div className="flex items-end h-[200px] gap-16">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 bg-blue-500 rounded-t-md"
                      style={{
                        height: `${Math.min((totalSales / Math.max(totalSales, totalExpenses, 1)) * 200, 200)}px`,
                      }}
                    ></div>
                    <div className="mt-2 text-sm font-medium">Sales</div>
                    <div className="text-xs">{formatNaira(totalSales)}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 bg-red-500 rounded-t-md"
                      style={{
                        height: `${Math.min((totalExpenses / Math.max(totalSales, totalExpenses, 1)) * 200, 200)}px`,
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
                Sales by category for {periodRangeDisplay}
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
                  <p>No sales data for this {periodType.slice(0, -2)}</p>
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
                Expenses by category for {periodRangeDisplay}
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
                  <p>No expenses data for this {periodType.slice(0, -2)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
