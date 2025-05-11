import { RevenueTable } from "./_components/revenue-table";

export default function RevenuePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">
            Revenue
          </h1>
          <p>View and manage all sales transactions</p>
        </div>
      </div>
      <RevenueTable />
    </div>
  );
}
