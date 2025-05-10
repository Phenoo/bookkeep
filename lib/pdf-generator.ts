import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

// Extend jsPDF with autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Function to generate a sales report PDF
export const generateSalesPDF = (
  sales: any[],
  startDate: Date,
  endDate: Date,
  title = "Sales Report"
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add date range
  doc.setFontSize(11);
  doc.text(
    `Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`,
    14,
    32
  );

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 38);

  // Calculate totals
  const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Add summary
  doc.setFontSize(12);
  doc.text("Summary", 14, 48);
  doc.setFontSize(10);
  doc.text(`Total Sales: $${totalAmount.toFixed(2)}`, 14, 54);
  doc.text(`Number of Transactions: ${sales.length}`, 14, 60);

  // Add sales table
  const tableColumn = [
    "Date",
    "Order ID",
    "Customer",
    "Items",
    "Total",
    "Status",
  ];
  const tableRows = sales.map((sale) => [
    format(new Date(sale.saleDate), "MM/dd/yyyy"),
    sale.orderId,
    sale.customerName || "Anonymous",
    sale.items.length.toString(),
    `$${sale.totalAmount.toFixed(2)}`,
    sale.status,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  return doc;
};

// Function to generate an expenses report PDF
export const generateExpensesPDF = (
  expenses: any[],
  startDate: Date,
  endDate: Date,
  title = "Expenses Report"
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add date range
  doc.setFontSize(11);
  doc.text(
    `Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`,
    14,
    32
  );

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 38);

  // Calculate totals
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Add summary
  doc.setFontSize(12);
  doc.text("Summary", 14, 48);
  doc.setFontSize(10);
  doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 14, 54);
  doc.text(`Number of Expenses: ${expenses.length}`, 14, 60);

  // Add expenses table
  const tableColumn = [
    "Date",
    "Title",
    "Category",
    "Amount",
    "Vendor",
    "Payment Method",
  ];
  const tableRows = expenses.map((expense) => [
    format(new Date(expense.date), "MM/dd/yyyy"),
    expense.title,
    expense.category,
    `$${expense.amount.toFixed(2)}`,
    expense.vendor || "N/A",
    expense.paymentMethod || "N/A",
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  return doc;
};

// Function to generate a combined report PDF
export const generateCombinedPDF = (
  sales: any[],
  expenses: any[],
  startDate: Date,
  endDate: Date,
  title = "Financial Report"
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add date range
  doc.setFontSize(11);
  doc.text(
    `Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`,
    14,
    32
  );

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 38);

  // Calculate totals
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netProfit = totalSales - totalExpenses;

  // Add summary
  doc.setFontSize(12);
  doc.text("Financial Summary", 14, 48);
  doc.setFontSize(10);
  doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 14, 54);
  doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, 60);
  doc.text(`Net Profit: $${netProfit.toFixed(2)}`, 14, 66);
  doc.text(
    `Profit Margin: ${totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(2) : 0}%`,
    14,
    72
  );

  // Add sales table
  doc.setFontSize(12);
  doc.text("Sales Summary", 14, 82);

  const salesTableColumn = ["Date", "Order ID", "Total", "Status"];
  const salesTableRows = sales.map((sale) => [
    format(new Date(sale.saleDate), "MM/dd/yyyy"),
    sale.orderId,
    `$${sale.totalAmount.toFixed(2)}`,
    sale.status,
  ]);

  doc.autoTable({
    head: [salesTableColumn],
    body: salesTableRows,
    startY: 86,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  // Add expenses table
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(12);
  doc.text("Expenses Summary", 14, finalY + 10);

  const expensesTableColumn = ["Date", "Title", "Category", "Amount"];
  const expensesTableRows = expenses.map((expense) => [
    format(new Date(expense.date), "MM/dd/yyyy"),
    expense.title,
    expense.category,
    `$${expense.amount.toFixed(2)}`,
  ]);

  doc.autoTable({
    head: [expensesTableColumn],
    body: expensesTableRows,
    startY: finalY + 14,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  return doc;
};

// Function to generate an inventory report PDF
export const generateInventoryPDF = (
  inventory: any[],
  title = "Inventory Report"
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 32);

  // Calculate totals
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  // Add summary
  doc.setFontSize(12);
  doc.text("Inventory Summary", 14, 42);
  doc.setFontSize(10);
  doc.text(`Total Items: ${totalItems}`, 14, 48);
  doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 14, 54);
  doc.text(`Low Stock Items: ${lowStockItems}`, 14, 60);
  doc.text(`Out of Stock Items: ${outOfStockItems}`, 14, 66);

  // Add inventory table
  const tableColumn = [
    "Name",
    "Category",
    "Quantity",
    "Unit",
    "Cost",
    "Total Value",
    "Status",
  ];
  const tableRows = inventory.map((item) => [
    item.name,
    item.category,
    item.quantity.toString(),
    item.unit,
    `$${item.costPerUnit.toFixed(2)}`,
    `$${item.totalValue.toFixed(2)}`,
    item.status,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 76,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  return doc;
};
