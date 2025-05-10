"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SnookerCoinsTracker } from "./snooker-tracker";

export function GameSalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Game Sales</h1>
        <p className="text-muted-foreground mt-2">
          Track game sales, manage tokens, and monitor usage across different
          game types.
        </p>
      </div>

      <Tabs defaultValue="snooker" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="snooker">Snooker</TabsTrigger>
          <TabsTrigger value="arcade">Arcade</TabsTrigger>
        </TabsList>
        <TabsContent value="snooker" className="mt-6">
          <SnookerCoinsTracker />
        </TabsContent>
        <TabsContent value="arcade" className="mt-6">
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">
              Arcade games tracking coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
