import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    style: "decimal",
    minimumFractionDigits: 2,
  })}`;
