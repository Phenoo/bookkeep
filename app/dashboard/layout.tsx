"use client";
import DashboardLayout from "@/components/dashboard-layout";
import { useConvexAuth } from "convex/react";
import React from "react";

import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const MainDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default MainDashboardLayout;
