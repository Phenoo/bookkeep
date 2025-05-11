"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowLeft,
  FileDown,
  Mail,
  Clock,
  Tag,
  FileText,
  Activity,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function UserActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Fetch user activities and user details
  const user = useQuery(api.users.getById, { id: userId as Id<"users"> });

  const clerkId = user?.clerkId;

  const activities =
    useQuery(api.userActivity.getByUserId, { userId: clerkId || "" }) || [];

  // Calculate activity stats
  const totalActivities = activities.length;
  const lastActivity =
    activities.length > 0
      ? Math.max(...activities.map((a) => a.timestamp))
      : null;

  // Get unique actions and resource types for filters
  const uniqueActions = Array.from(new Set(activities.map((a) => a.action)));

  // Count activities by type
  const actionCounts = activities.reduce(
    (acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count activities by resource

  // Filter activities based on search and filters
  const filteredActivities = activities.filter((activity) => {
    // Filter by search query
    const matchesSearch =
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.details &&
        activity.details.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by action
    const matchesAction =
      filterAction === "all" || activity.action === filterAction;

    // Filter by resource type

    // Filter by date range
    let matchesDate = true;
    const now = Date.now();
    const activityTime = activity.timestamp;

    if (dateRange === "today") {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      matchesDate = activityTime >= startOfDay;
    } else if (dateRange === "week") {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      matchesDate = activityTime >= oneWeekAgo;
    } else if (dateRange === "month") {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      matchesDate = activityTime >= oneMonthAgo;
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  // Get action badge color
  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "logout":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "create":
      case "create_inventory_item":
      case "create_expense":
      case "create_sale":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "update":
      case "update_inventory_item":
      case "update_expense":
      case "update_sale":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "delete":
      case "delete_inventory_item":
      case "delete_expense":
      case "delete_sale":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get resource type badge color
  const getResourceTypeColor = (resourceType: string) => {
    switch (resourceType) {
      case "user":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "order":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
      case "menu":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "inventory":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "expense":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "sale":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "system":
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Export activities to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Action", "Resource Type", "Details", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...filteredActivities.map((activity) =>
        [
          activity.action,
          activity.details || "",
          new Date(activity.timestamp).toISOString(),
        ]
          .map((cell) => `"${cell}"`)
          .join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `user_activities_${user?.firstName || user?.email}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">User Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>The requested user could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            User Activity Details
          </h1>
        </div>
        <div className="flex gap-2"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user.imageUrl || "/placeholder.svg"}
                  alt={user.firstName || "User"}
                />
                <AvatarFallback className="text-lg">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <h3 className="text-xl font-semibold">
                  {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "N/A"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.email || "No email"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge>{user.role}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined{" "}
                    {user.createdAt
                      ? format(new Date(user.createdAt), "PP")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Activity className="h-4 w-4" /> Total Activities
                </span>
                <span className="text-2xl font-bold">{totalActivities}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Last Activity
                </span>
                <span className="text-md">
                  {lastActivity
                    ? formatDistanceToNow(new Date(lastActivity), {
                        addSuffix: true,
                      })
                    : "Never"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Most Common Action
                </span>
                <span className="text-md">
                  {Object.entries(actionCounts).sort(
                    (a, b) => b[1] - a[1]
                  )[0]?.[0] || "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            View all activities for{" "}
            {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email ||
              "this user"}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activity..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() +
                        action.slice(1).replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Details
                  </TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity._id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getActionColor(activity.action)}
                        >
                          {activity.action.charAt(0).toUpperCase() +
                            activity.action.slice(1).replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {activity.details || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          title={format(new Date(activity.timestamp), "PPpp")}
                        >
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No activity found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
