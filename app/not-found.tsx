import Link from "next/link";
import { Calendar, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotFound() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-white border-r border-gray-200 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center font-medium">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            <span>Greenville Apartments</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6">
          <Link href="/" className="lg:hidden">
            <Calendar className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1"></div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
          <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              Page not found
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="mt-10 w-full"></div>
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <a
                  href="mailto:greenville@online"
                  className="font-medium text-primary hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
