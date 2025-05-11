import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function UserActivityDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
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
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="grid gap-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
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
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <Skeleton className="h-10 w-full md:w-64" />
            <div className="flex flex-wrap items-center gap-2 w-full">
              <Skeleton className="h-10 w-full md:w-[150px]" />
              <Skeleton className="h-10 w-full md:w-[150px]" />
              <Skeleton className="h-10 w-full md:w-[150px]" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="hidden md:block h-6 w-64" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
