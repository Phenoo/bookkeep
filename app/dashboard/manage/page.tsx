"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertiesManager } from "./_components/properties-manager";
import { MenuItemsManager } from "./_components/menu-items-manager";
import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState("properties");

  const { user, isLoaded: isClerkLoaded } = useUser();

  const getUser = useQuery(
    api.users.getByClerkId,
    isClerkLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  const role = getUser?.role;

  if (getUser === undefined || getUser === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  if (role === "user") {
    return redirect("/dashboard/pos");
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-lg md:text-2xl font-bold ">
        Manage Business Assets
      </h1>

      <Tabs
        defaultValue="properties"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-xl">
                Manage Properties
              </CardTitle>
              <CardDescription>
                Add, edit, or remove properties available for rent or use in
                your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertiesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu-items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Menu Items</CardTitle>
              <CardDescription>
                Add, edit, or remove items from your food and drink menu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MenuItemsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
