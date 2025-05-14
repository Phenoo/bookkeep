"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, BarChart3 } from "lucide-react";
import { UserIssueList } from "@/components/userlist-issues";
import { IssueReportForm } from "@/components/userform-issue";

export default function Issuepage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Issue Reports</h1>

      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList>
          <TabsTrigger value="issues">View Issues</TabsTrigger>
          <TabsTrigger value="report">Report an Issue</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <UserIssueList />
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
