"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, BarChart3 } from "lucide-react";
import { IssueReportForm } from "@/components/userform-issue";
import { AdminIssueList } from "@/components/adminlist-issues";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Spinner } from "@/components/spinner";

export default function AdminIssuespage() {
  const allIssues = useQuery(api.issues.getAll);

  const openIssues = allIssues?.filter((item) => item.status === "open");

  const inprogressIssues = allIssues?.filter(
    (item) => item.status === "in-progress"
  );
  const resolvedIssues = allIssues?.filter(
    (item) => item.status === "resolved"
  );

  if (allIssues === undefined) {
    return <Spinner />;
  }
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Issue Reports</h1>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIssues?.length}</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inprogressIssues?.length}</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedIssues?.length}</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Resolution Time
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>

          <TabsTrigger value="report">Report an Issue</TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <AdminIssueList />
        </TabsContent>
        <TabsContent value="report">
          <div className="max-w-2xl mx-auto">
            <IssueReportForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
