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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

interface SnookerTransaction {
  _id: Id<"snookerCoinTransactions">;
  _creationTime: number;
  type: string;
  amount: number;
  table?: string;
  notes?: string;
  date: string;
  totalAmount: number;
  createdBy: string;
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
  const { toast } = useToast();
  const [pricePerCoin, setPricePerCoin] = useState(2); // Default price per coin: $2
  const [totalCoins, setTotalCoins] = useState(500);

  // Get transactions from database
  const transactions = useQuery(api.snooker_coins.getAllTransactions) || [];

  // Calculate total coins and revenue
  const totalRevenue = transactions
    .filter((t) => t.type === "use")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const createTransaction = useMutation(api.snooker_coins.createTransaction);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const totalAmount = values.amount * pricePerCoin;

    try {
      // Create transaction in database
      await createTransaction({
        type: values.type,
        amount: values.amount,
        table: values.table || undefined,
        notes: values.notes || undefined,
        date: values.date.toISOString(),
        totalAmount,
      });

      // Update local state
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
      }

      // Reset form
      form.reset({
        type: "add",
        amount: 0,
        table: "",
        notes: "",
        date: new Date(),
      });

      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    }
  }

  function updateSettings(values: z.infer<typeof settingsSchema>) {
    setPricePerCoin(values.pricePerCoin);
    toast({
      title: "Success",
      description: "Settings updated successfully",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 w-full">
      <div className="space-y-6 w-full">
        <Card className="w-full ">
          <CardHeader className="flex flex-row items-center gap-4 justify-between">
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
                              step="1"
                              min="1"
                              {...field}
                              onWheel={(e) => e.currentTarget.blur()}
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
                          onWheel={(e) => e.currentTarget.blur()}
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
      <div className="w-full overflow-x-auto">
        <Card className="h-full w-full ">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-2xl">
              <ArrowUpDown className="mr-2 h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Recent snooker coin transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Coins</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Table</TableHead>
                    <TableHead className="whitespace-nowrap">Notes</TableHead>
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
                      <TableRow key={transaction._id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "add"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {transaction.type === "add" ? "Added" : "Used"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatNaira(transaction.totalAmount)}
                        </TableCell>
                        <TableCell>{transaction.table || "-"}</TableCell>
                        <TableCell className="max-w-[80px] md:max-w-[150px] truncate">
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
                Total Revenue: {formatNaira(totalRevenue)}
              </p>
            </div>
            <Button variant="outline">Export Transactions</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
