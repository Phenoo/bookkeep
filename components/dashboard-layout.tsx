"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton, useUser } from "@clerk/clerk-react";
import { ModeToggle } from "./mode-toggle";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InventoryAlerts } from "./inventory-alerts";

// Add color generation function
const getRandomColor = () => {
  const colors = [
    "text-blue-500",
    "text-purple-500",
    "text-pink-500",
    "text-indigo-500",
    "text-cyan-500",
    "text-orange-500",
    "text-teal-500",
    "text-rose-500",
    "text-violet-500",
    "text-emerald-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const { user } = useUser();

  const getUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id!,
  });

  const role = getUser?.role;
  // Add type for menu items
  type MenuItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }> | (() => JSX.Element);
  };

  // Common navigation items
  const dashboardItems: MenuItem[] = [
    { title: "Expenses", href: "/dashboard/expenses", icon: DollarSign },
  ];

  // Sales tracking items
  const salesItems: MenuItem[] = [
    {
      title: "Point of Sale",
      href: "/dashboard/pos",
      icon: ShoppingCart,
    },
    {
      title: "Game Sales",
      href: "/dashboard/game",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M9 8h2" />
          <path d="M13 8h2" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      ),
    },
    {
      title: "Bookings",
      href: "/dashboard/booking",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M3 21h18" />
          <path d="M19 21v-4" />
          <path d="M19 17a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H3v5h16Z" />
          <path d="M3 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9" />
          <path d="M8 7v5" />
        </svg>
      ),
    },
    {
      title: "Food Sales",
      href: "/dashboard/food",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M17 8c0-5-5-5-5-5s-5 0-5 5" />
          <path d="M13 14H7a2 2 0 0 1-2-2V8h14v4a2 2 0 0 1-2 2h-4Z" />
          <path d="M10 15v5" />
          <path d="M14 15v5" />
          <path d="M3 8h18" />
        </svg>
      ),
    },
  ];

  // Book keeping items
  const bookkeepingItems: MenuItem[] = [
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
    },
    {
      title: "Manage",
      href: "/dashboard/manage",
      icon: ClipboardList,
    },
    {
      title: "Audit Logs",
      href: "/dashboard/admin/records",
      icon: BookOpen,
    },
  ];

  // Admin-only navigation items
  const adminItems: MenuItem[] = [
    {
      title: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Sales History",
      href: "/dashboard/admin/revenue",
      icon: Banknote,
    },
    {
      title: "Expenses History",
      href: "/dashboard/admin/expenses",
      icon: DollarSign,
    },
    { title: "Reports", href: "/dashboard/reports", icon: FileText },
  ];

  // Generate colors for each section
  const mainColor = getRandomColor();
  const salesColor = getRandomColor();
  const bookkeepingColor = getRandomColor();
  const adminColor = getRandomColor();

  // Toggle role for demo purposes

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center justify-center border-b px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <BookOpen className="h-6 w-6" />
              <span>GreenVille</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            {(role === "admin" || role === "manager") && (
              <SidebarGroup>
                <SidebarGroupLabel className={mainColor}>
                  Main
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === ""}
                        tooltip={"Dashboard"}
                      >
                        <Link href={"/dashboard"}>
                          <Home className="h-4 w-4" />
                          <span>{"Dashboard"}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {dashboardItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className={salesColor}>
                Sales Tracking
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {salesItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          {typeof item.icon === "function" ? (
                            <item.icon />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {(role === "admin" || role === "manager") && (
              <SidebarGroup>
                <SidebarGroupLabel className={bookkeepingColor}>
                  Book Keeping
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {bookkeepingItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {role === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel className={adminColor}>
                  Administration
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex w-full items-center gap-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>
                    {role === "admin" ? "AD" : role === "manager" ? "MD" : "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-sm">
                  <span className="font-medium capitalize">{role}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {role === "admin" ? "Administrator" : role}
                  </span>
                </div>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 w-full flex-col">
          <header className="sticky top-0 z-10 flex h-14 w-full items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-medium">
                {role === "admin" ? "Admin View" : "User View"}
              </span>
              <UserButton afterSwitchSessionUrl="/" />
              <ModeToggle />
            </div>
            <div className="">
              <InventoryAlerts />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
