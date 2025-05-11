"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatNaira } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const sales = useQuery(api.sales.getAllSales) || [];

  const { user } = useUser();

  const inventoryItems = useQuery(api.inventory.getAll) || [];

  const users = useQuery(api.users.getAll) || [];
  const usersActivities = useQuery(api.userActivity.getAll) || [];

  const recentActivity = usersActivities.filter((_, i) => i < 5);

  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const getUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id!,
  });

  const role = getUser?.role;

  if (getUser === null || getUser === undefined || !role) {
    return <Spinner />;
  }

  if (role === "user") {
    return redirect("/dashboard/pos");
  }

  const salesByCategory = sales.reduce(
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

  console.log(recentActivity, "shshhshs");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Overview</h4>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNaira(totalSales)}
                </div>
                <p className="text-xs text-muted-foreground  hidden">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    12%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inventory
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryItems.length}
                </div>
                <p className="text-xs text-muted-foreground hidden">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    4%
                  </span>{" "}
                  from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Processes
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersActivities.length}
                </div>
                <p className="text-xs text-muted-foreground hidden">
                  <span className="text-rose-500 flex items-center">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    8%
                  </span>{" "}
                  from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground hidden">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    20%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Overview of recent sales and inventory changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            activity.category === "snooker"
                              ? "bg-purple-100 text-purple-700"
                              : activity.category === "bookings"
                                ? "bg-blue-100 text-blue-700"
                                : activity.category === "orders"
                                  ? "bg-green-100 text-green-700"
                                  : activity.category === "Inventory" ||
                                      activity.category === "expenses"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {activity.category === "snooker" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="M9 8h2" />
                              <path d="M13 8h2" />
                              <path d="M9 12h6" />
                              <path d="M9 16h6" />
                            </svg>
                          ) : activity.category === "bookings" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 21h18" />
                              <path d="M19 21v-4" />
                              <path d="M19 17a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H3v5h16Z" />
                              <path d="M3 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9" />
                              <path d="M8 7v5" />
                            </svg>
                          ) : activity.category === "orders" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M17 8c0-5-5-5-5-5s-5 0-5 5" />
                              <path d="M13 14H7a2 2 0 0 1-2-2V8h14v4a2 2 0 0 1-2 2h-4Z" />
                              <path d="M10 15v5" />
                              <path d="M14 15v5" />
                              <path d="M3 8h18" />
                            </svg>
                          ) : activity.category === "Inventory" ||
                            activity.category === "expenses" ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <BarChart3 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.details}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {activity.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {/* {formatNaira(activity.metadata.totalAmount)} */}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
                <CardDescription>Monthly breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* djjdjd */}
                  {Object.keys(salesByCategory).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(salesByCategory).map(
                        ([category, amount]) => (
                          <div key={category} className="">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium capitalize">
                                  {category} Sales
                                </p>
                                <p className="text-sm font-medium">
                                  {formatNaira(amount)}
                                </p>
                              </div>
                              <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-600 rounded-full"
                                  style={{
                                    width: `${((amount / totalSales) * 100).toFixed(1)}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {((amount / totalSales) * 100).toFixed(1)}% of
                                total sales
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      <div className="border-t pt-4 flex justify-between items-center">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">
                          {formatNaira(totalSales)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mb-2" />
                      <p>No sales data for this week</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
