"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  Edit,
  UserCheck,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

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

export function AdminIssueList() {
  // Get all issues for admin
  const allIssues = useQuery(api.issues.getAll);
  const updateIssue = useMutation(api.issues.update);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignee, setAssignee] = useState("");

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

  // Filter issues based on search query and filters
  const filteredIssues =
    allIssues?.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || issue.priority === priorityFilter;
      const matchesCategory =
        categoryFilter === "all" || issue.category === categoryFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesCategory
      );
    }) || [];

  const handleStatusChange = async (
    issueId: Id<"issues">,
    newStatus: string
  ) => {
    try {
      await updateIssue({
        id: issueId,
        status: newStatus,
      });

      toast.success(`Issue status changed to ${newStatus}`);
    } catch (error) {
      toast.error("There was a problem updating the issue status");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIssue) return;

    try {
      await updateIssue({
        id: selectedIssue._id,
        title: selectedIssue.title,
        description: selectedIssue.description,
        priority: selectedIssue.priority,
        category: selectedIssue.category,
      });

      setEditDialogOpen(false);

      toast.success("The issue has been successfully updated");
    } catch (error) {
      toast.success("here was a problem updating the issue");
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIssue) return;

    try {
      await updateIssue({
        id: selectedIssue._id,
        assignedTo: assignee || null,
      });

      setAssignDialogOpen(false);

      toast.success(
        assignee
          ? "The issue has been assigned"
          : "The issue has been unassigned"
      );
    } catch (error) {
      toast.error("There was a problem assigning the issue");
    }
  };

  if (allIssues === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Priority</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Category</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
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
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {/* Status Update Buttons */}
                    <Select
                      value={issue.status}
                      onValueChange={(value) =>
                        handleStatusChange(issue._id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <span>Change Status</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIssue(issue);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {/* Assign Button */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIssue(issue);
                        setAssignee(issue.assignedTo || "");
                        setAssignDialogOpen(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      {issue.assignedTo ? "Reassign" : "Assign"}
                    </Button> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No issues found matching your filters
              </div>
            )}
          </TabsContent>

          <TabsContent value="unassigned">
            <div className="space-y-4 mt-4">
              {filteredIssues.filter((issue) => !issue.assignedTo).length >
              0 ? (
                filteredIssues
                  .filter((issue) => !issue.assignedTo)
                  .map((issue) => (
                    <div
                      key={issue._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Same issue card content as above */}
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
                      {/* <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setAssignee("");
                            setAssignDialogOpen(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div> */}
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No unassigned issues found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="critical">
            <div className="space-y-4 mt-4">
              {filteredIssues.filter((issue) => issue.priority === "critical")
                .length > 0 ? (
                filteredIssues
                  .filter((issue) => issue.priority === "critical")
                  .map((issue) => (
                    <div
                      key={issue._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Same issue card content as above */}
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
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <Select
                          value={issue.status}
                          onValueChange={(value) =>
                            handleStatusChange(issue._id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <span>Change Status</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No critical issues found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit Issue Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
            <DialogDescription>
              Make changes to the issue details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={selectedIssue?.title || ""}
                  onChange={(e) =>
                    setSelectedIssue((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={selectedIssue?.description || ""}
                  onChange={(e) =>
                    setSelectedIssue((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={selectedIssue?.priority || ""}
                  onValueChange={(value) =>
                    setSelectedIssue((prev) =>
                      prev ? { ...prev, priority: value } : null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={selectedIssue?.category || ""}
                  onValueChange={(value) =>
                    setSelectedIssue((prev) =>
                      prev ? { ...prev, category: value } : null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Issue Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Issue</DialogTitle>
            <DialogDescription>
              Assign this issue to a team member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignee" className="text-right">
                  Assignee
                </Label>
                <Input
                  id="assignee"
                  placeholder="Enter user ID or email"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <p className="text-sm text-muted-foreground col-span-4">
                Leave blank to unassign the issue
              </p>
            </div>
            <DialogFooter>
              <Button type="submit">
                {assignee ? "Assign Issue" : "Unassign Issue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
