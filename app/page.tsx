"use client";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Spinner } from "@/components/spinner";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between p-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-xl">GreenVille Apartment</span>
          </div>
          <nav className="flex items-center gap-4">
            {isLoading && <Spinner />}
            {!isAuthenticated && !isLoading && (
              <>
                <SignInButton mode="modal">
                  <Button variant={"ghost"} size={"sm"}>
                    Log in
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant={"ghost"} size={"sm"}>
                    Dashboard
                  </Button>
                </SignInButton>
              </>
            )}

            {isAuthenticated && !isLoading && (
              <>
                <Button variant={"ghost"} asChild>
                  <Link href={"/dashboard"}>Dashboard</Link>
                </Button>
                <UserButton afterSwitchSessionUrl="/" />
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Complete Business Management
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Track sales, manage inventory, and keep your books in order with
              our all-in-one business management solution.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isLoading && <Spinner />}
              {!isAuthenticated && !isLoading && (
                <>
                  <SignInButton mode="modal">
                    <Button size="lg">Log in</Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button variant={"outline"} size="lg">
                      Dashboard
                    </Button>
                  </SignInButton>
                </>
              )}

              {isAuthenticated && !isLoading && (
                <>
                  <Button variant={"outline"} asChild>
                    <Link href={"/dashboard"}>Dashboard</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features
              </h2>
              <ul className="mt-6 grid gap-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <svg
                      className=" h-5 w-5 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">Sales Tracking</h3>
                    <p className="text-muted-foreground">
                      Track sales across Game, Rent, and Food categories.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <svg
                      className=" h-5 w-5 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">
                      Inventory Management
                    </h3>
                    <p className="text-muted-foreground">
                      Keep track of your inventory in real-time with detailed
                      records.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <svg
                      className=" h-5 w-5 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">Process Tracking</h3>
                    <p className="text-muted-foreground">
                      Document and monitor all business processes efficiently.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <svg
                      className=" h-5 w-5 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">Admin Analytics</h3>
                    <p className="text-muted-foreground">
                      Comprehensive analytics and history for administrators.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-8">
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed p-8">
                <p className="text-sm text-muted-foreground">
                  Dashboard Preview
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BusinessTracker. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
