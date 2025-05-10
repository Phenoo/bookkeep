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
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="max-w-7xl mx-auto p-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BusinessTracker. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
