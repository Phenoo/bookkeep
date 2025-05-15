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

export const UNIT_CATEGORIES = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Liter (l)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "serving", label: "Serving" },
  { value: "portion", label: "Portion" },
  { value: "plate", label: "Plate" },
  { value: "dozen", label: "Dozen" },
  { value: "bunch", label: "Bunch" },
];
