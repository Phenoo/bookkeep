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

const Mainissuepage = () => {
  const allIssues = useQuery(api.issues.getAll);

  const openIssues = allIssues?.filter((item) => item.status === "open");

  const inprogressIssues = allIssues?.filter(
    (item) => item.status === "in-progress"
  );
  const resolvedIssues = allIssues?.filter(
    (item) => item.status === "resolved"
  );

  if (allIssues === undefined || allIssues === null) {
    return <Spinner />;
  }
  return (
    <div className=" mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Issue Reports</h1>

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
};

export default Mainissuepage;
