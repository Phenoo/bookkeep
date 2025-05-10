import React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

const spinnerVariants = cva("text-muted-foregorund animate-spin", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-2 w-2",
      lg: "h-6 w-6",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {}

export const Spinner = ({ size }: SpinnerProps) => {
  return (
    <div className="h-full min-h-screen w-full flex items-center justify-center p-8">
      <Loader className={cn(spinnerVariants({ size }))} />
    </div>
  );
};
