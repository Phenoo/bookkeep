"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import type { Id } from "@/convex/_generated/dataModel";

interface Issue {
  _id: Id<"issues">;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string | null;
}

export function UserIssueList() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  // Get issues created by the current user
  const userIssues = useQuery(
    api.issues.getByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "resolved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "medium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "";
    }
  };

  // Filter issues based on search query
  const filteredIssues =
    userIssues?.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (userIssues === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Issues</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your issues..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="text-center py-10 text-muted-foreground">
            Please sign in to view your issues
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <h3 className="font-semibold">{issue.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(issue.status)}
                    >
                      {issue.status === "in-progress"
                        ? "In Progress"
                        : issue.status.charAt(0).toUpperCase() +
                          issue.status.slice(1)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(issue.priority)}
                    >
                      {issue.priority.charAt(0).toUpperCase() +
                        issue.priority.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {issue.category.charAt(0).toUpperCase() +
                        issue.category.slice(1)}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {issue.description}
                </p>
                <div className="mt-3 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground">
                  <span>Created: {formatDate(issue.createdAt)}</span>
                  <span>
                    Last Updated:{" "}
                    {issue.updatedAt && formatDate(issue.updatedAt)}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            You haven't reported any issues yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
