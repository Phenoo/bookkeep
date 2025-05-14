"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background">
          <div className="text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Critical Error</h1>
            <p className="mt-2 text-muted-foreground">
              A critical error occurred in the application.
            </p>
            {error.digest && (
              <p className="mt-2 text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
              <Button onClick={() => reset()}>Try Again</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
