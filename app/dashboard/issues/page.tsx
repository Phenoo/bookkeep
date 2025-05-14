"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueReportForm } from "@/components/userform-issue";
import { UserIssueList } from "../food/_components/userlist-issues";

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
