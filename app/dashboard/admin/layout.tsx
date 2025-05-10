"use client";
import DashboardLayout from "@/components/dashboard-layout";
import { useConvexAuth, useQuery } from "convex/react";
import React from "react";

import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const AdminMainDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const { user } = useUser();

  const getUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id!,
  });

  const role = getUser?.role;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  if (role === "user") {
    return redirect("/dashboard");
  }

  return <>{children}</>;
};

export default AdminMainDashboardLayout;
