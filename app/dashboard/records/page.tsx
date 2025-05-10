"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Search, Calendar, Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/spinner";

export default function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResource, setFilterResource] = useState("all");

  // Fetch activity from Convex
  const activities = useQuery(api.userActivity.getAll) || [];
  const users = useQuery(api.users.getAll) || [];

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.clerkId === userId);
    if (user) {
      return (
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
      );
    }
    return "Unknown User";
  };

  // Filter activities based on search query and filters
  const filteredActivities = activities.filter((activity) => {
    // Filter by search query
    const userName = getUserName(activity.userId);
    const matchesSearch =
      userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.details &&
        activity.details.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by action
    const matchesAction =
      filterAction === "all" || activity.action === filterAction;

    return matchesSearch && matchesAction;
  });

  // Get unique actions and resource types for filters
  const uniqueActions = Array.from(
    new Set(activities.map((activity) => activity.action))
  );

  // Get action badge color
  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "logout":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "create":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "update":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "delete":
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
      case "system":
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (activities === undefined || users === undefined) {
    return <Spinner />;
  }

  if (activities === null || users === null) {
    return <Spinner />;
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Activity</h1>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Date Range
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              View all user activity in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search activity..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* <Select
                  value={filterResource}
                  onValueChange={setFilterResource}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Resource Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {uniqueResourceTypes.map((resourceType) => (
                      <SelectItem key={resourceType} value={resourceType}>
                        {resourceType.charAt(0).toUpperCase() +
                          resourceType.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Details
                    </TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-[80px]">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity._id}>
                        <TableCell className="font-medium">
                          {getUserName(activity.userId)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getActionColor(activity.action)}
                          >
                            {activity.action.charAt(0).toUpperCase() +
                              activity.action.slice(1)}
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
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
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
    </>
  );
}
