"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  MinusCircle,
  Coins,
  ArrowUpDown,
  CalendarIcon,
  Settings2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn, formatNaira } from "@/lib/utils";

interface SnookerTransaction {
  id: string;
  date: Date;
  type: "add" | "use";
  amount: number;
  table: string;
  notes: string;
  totalAmount: number;
}

const formSchema = z.object({
  type: z.enum(["add", "use"], {
    required_error: "Please select a transaction type",
  }),
  amount: z.coerce.number().positive("Amount must be positive"),
  table: z.string().optional(),
  notes: z.string().optional(),
  date: z.date({
    required_error: "Please select a date",
  }),
});

const settingsSchema = z.object({
  pricePerCoin: z.coerce.number().positive("Price must be positive"),
});

export function SnookerCoinsTracker() {
  const [totalCoins, setTotalCoins] = useState(500);
  const [pricePerCoin, setPricePerCoin] = useState(2); // Default price per coin: $2
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transactions, setTransactions] = useState<SnookerTransaction[]>([]);

  // Calculate initial total revenue
  useState(() => {
    const revenue = transactions
      .filter((t) => t.type === "use")
      .reduce((sum, t) => sum + t.totalAmount, 0);
    setTotalRevenue(revenue);
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "add",
      amount: 0,
      table: "",
      notes: "",
      date: new Date(),
    },
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pricePerCoin,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const totalAmount = values.amount * pricePerCoin;

    const newTransaction: SnookerTransaction = {
      id: `t${transactions.length + 1}-${Date.now()}`,
      date: values.date,
      type: values.type,
      amount: values.amount,
      table: values.table || "",
      notes: values.notes || "",
      totalAmount,
    };

    // Update total coins
    if (values.type === "add") {
      setTotalCoins((prev) => prev + values.amount);
    } else {
      // Check if we have enough coins
      if (totalCoins < values.amount) {
        form.setError("amount", {
          type: "manual",
          message: "Not enough coins available",
        });
        return;
      }
      setTotalCoins((prev) => prev - values.amount);

      // Update revenue for "use" transactions
      setTotalRevenue((prev) => prev + totalAmount);
    }

    // Add transaction to history
    setTransactions((prev) => [newTransaction, ...prev]);

    // Reset form
    form.reset({
      type: "add",
      amount: 0,
      table: "",
      notes: "",
      date: new Date(),
    });
  }

  function updateSettings(values: z.infer<typeof settingsSchema>) {
    setPricePerCoin(values.pricePerCoin);

    // Recalculate all transaction amounts with new price
    const updatedTransactions = transactions.map((transaction) => ({
      ...transaction,
      totalAmount: transaction.amount * values.pricePerCoin,
    }));

    setTransactions(updatedTransactions);

    // Recalculate total revenue
    const newRevenue = updatedTransactions
      .filter((t) => t.type === "use")
      .reduce((sum, t) => sum + t.totalAmount, 0);
    setTotalRevenue(newRevenue);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5" />
                Snooker Coins Tracker
              </CardTitle>
              <CardDescription>
                Record coin additions and usage for snooker tables
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings2 className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pricing Settings</DialogTitle>
                  <DialogDescription>
                    Set the price per coin for snooker games
                  </DialogDescription>
                </DialogHeader>
                <Form {...settingsForm}>
                  <form
                    onSubmit={settingsForm.handleSubmit(updateSettings)}
                    className="space-y-4 py-4"
                  >
                    <FormField
                      control={settingsForm.control}
                      name="pricePerCoin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Coin (₦)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Current Price
                  </p>
                  <p className="text-xl font-bold text-green-800">
                    ₦{pricePerCoin.toFixed(2)} per coin
                  </p>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="add">
                            <div className="flex items-center">
                              <PlusCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span>Add Coins</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          {...field}
                        />
                      </FormControl>
                      {field.value > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Total: {formatNaira(field.value * pricePerCoin)}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "use" && (
                  <FormField
                    control={form.control}
                    name="table"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Table 1">Table 1</SelectItem>
                            <SelectItem value="Table 2">Table 2</SelectItem>
                            <SelectItem value="Table 3">Table 3</SelectItem>
                            <SelectItem value="Table 4">Table 4</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Record Transaction
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpDown className="mr-2 h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Recent snooker coin transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No transactions recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(transaction.date, "MMM d, yyyy")}
                        </TableCell>

                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>
                          ${transaction.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>{transaction.table || "-"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {transaction.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm font-medium">
                Price per coin: ${pricePerCoin.toFixed(2)}
              </p>
            </div>
            <Button variant="outline">Export Transactions</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
