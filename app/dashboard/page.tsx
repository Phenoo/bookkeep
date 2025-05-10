import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,284.55</div>
                <p className="text-xs text-muted-foreground">
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
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">
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
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
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
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
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
                  {[
                    {
                      category: "Game",
                      name: "PlayStation 5",
                      amount: "$499.99",
                      date: "Today, 10:30 AM",
                    },
                    {
                      category: "Inventory",
                      name: "Office Desk (INV001)",
                      amount: "Added 5 units",
                      date: "Today, 9:15 AM",
                    },
                    {
                      category: "Rent",
                      name: "Apartment 4B",
                      amount: "$1,200.00",
                      date: "Yesterday, 2:15 PM",
                    },
                    {
                      category: "Food",
                      name: "Catering Service",
                      amount: "$350.00",
                      date: "Yesterday, 11:45 AM",
                    },
                    {
                      category: "Process",
                      name: "Inventory Audit",
                      amount: "Updated to 65%",
                      date: "2 days ago, 3:30 PM",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            activity.category === "Game"
                              ? "bg-purple-100 text-purple-700"
                              : activity.category === "Rent"
                                ? "bg-blue-100 text-blue-700"
                                : activity.category === "Food"
                                  ? "bg-green-100 text-green-700"
                                  : activity.category === "Inventory"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {activity.category === "Game" ? (
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
                          ) : activity.category === "Rent" ? (
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
                          ) : activity.category === "Food" ? (
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
                          ) : activity.category === "Inventory" ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <BarChart3 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{activity.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Game Sales</p>
                      <p className="text-sm font-medium">$4,285.75</p>
                    </div>
                    <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      35% of total sales
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Rent Sales</p>
                      <p className="text-sm font-medium">$5,842.50</p>
                    </div>
                    <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: "48%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      48% of total sales
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Food Sales</p>
                      <p className="text-sm font-medium">$2,156.30</p>
                    </div>
                    <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: "17%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      17% of total sales
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Total Sales</p>
                      <p className="font-bold">$12,284.55</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                <CardTitle>Game Sales</CardTitle>
                <CardDescription className="text-purple-100">
                  Track your game sales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold">$1,284.50</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      12%
                    </span>{" "}
                    from last month
                  </p>
                </div>
                <Link href="/dashboard/game">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Manage Game Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <CardTitle>Rent Sales</CardTitle>
                <CardDescription className="text-blue-100">
                  Track your rental income
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold">$3,842.75</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      8%
                    </span>{" "}
                    from last month
                  </p>
                </div>
                <Link href="/dashboard/rent">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Manage Rent Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white">
                <CardTitle>Food Sales</CardTitle>
                <CardDescription className="text-green-100">
                  Track your food sales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-2xl font-bold">$2,156.30</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-rose-500 flex items-center">
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                      3%
                    </span>{" "}
                    from last month
                  </p>
                </div>
                <Link href="/dashboard/food">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Manage Food Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">13</div>
                <p className="text-xs text-muted-foreground">
                  -2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inventory Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$124,500</div>
                <p className="text-xs text-muted-foreground">
                  +$12,500 from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Link href="/dashboard/inventory">
              <Button>View All Inventory</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
