"use client";
import { useQuery } from "convex/react";
import React from "react";

import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const AdminMainDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useUser();

  const getUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id!,
  });

  const role = getUser?.role;

  if (getUser === undefined || getUser === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  if (role === "user" || role === "manager") {
    return redirect("/dashboard/pos");
  }

  return <>{children}</>;
};

export default AdminMainDashboardLayout;
