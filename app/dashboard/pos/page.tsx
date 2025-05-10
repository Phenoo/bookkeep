"use client";
import { PosSystem } from "./_components/point-of-sale";

export default function PosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
      </div>

      <PosSystem />
    </div>
  );
}
