"use client";
import DashboardLayout from "@/components/dashboard-layout";
import { useConvexAuth, useQuery } from "convex/react";
import React from "react";

import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AdminContactDialog } from "@/components/admin-restrict-access";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const MainDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();

  const getUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id!,
  });

  const isApproved = getUser?.isApproved;

  if (isLoading) {
    return (
      <div className="h-full flex items-center  justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }
  if (!isAuthenticated) {
    return redirect("/");
  }

  if (isAuthenticated && !isApproved) {
    return (
      <>
        <AdminContactDialog open={true} />
      </>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default MainDashboardLayout;
