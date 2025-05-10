import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download, FileText, Search } from "lucide-react";

// Sample records data
const records = [
  {
    id: "REC001",
    type: "Inventory Update",
    description: "Added 50 units of Office Desk (INV001)",
    createdBy: "John Doe",
    date: "2023-05-01",
  },
  {
    id: "REC002",
    type: "Process Completion",
    description: "Completed Equipment Maintenance (PROC003)",
    createdBy: "Mike Johnson",
    date: "2023-05-05",
  },
  {
    id: "REC003",
    type: "Inventory Update",
    description: "Removed 5 units of Laptop Stand (INV003)",
    createdBy: "Jane Smith",
    date: "2023-05-06",
  },
  {
    id: "REC004",
    type: "Process Update",
    description: "Updated progress of Inventory Audit (PROC001) to 65%",
    createdBy: "John Doe",
    date: "2023-05-07",
  },
  {
    id: "REC005",
    type: "Inventory Update",
    description: "Added 20 units of Wireless Mouse (INV004)",
    createdBy: "Sarah Williams",
    date: "2023-05-08",
  },
  {
    id: "REC006",
    type: "Process Creation",
    description: "Created new process: Staff Training (PROC004)",
    createdBy: "Sarah Williams",
    date: "2023-05-05",
  },
  {
    id: "REC007",
    type: "Inventory Update",
    description: "Updated Desk Lamp (INV007) quantity to 5 units",
    createdBy: "John Doe",
    date: "2023-05-07",
  },
  {
    id: "REC008",
    type: "Process Update",
    description: "Updated progress of Supplier Evaluation (PROC005) to 80%",
    createdBy: "John Doe",
    date: "2023-05-08",
  },
];

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Records</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Records
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Records</CardTitle>
          <CardDescription>
            View all activity records related to inventory and processes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-8 w-full"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inventory">Inventory Update</SelectItem>
                    <SelectItem value="process">Process Update</SelectItem>
                    <SelectItem value="completion">
                      Process Completion
                    </SelectItem>
                    <SelectItem value="creation">Process Creation</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="shrink-0">
                  <Calendar className="h-4 w-4" />
                  <span className="sr-only">Date filter</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[80px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell>{record.createdBy}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
