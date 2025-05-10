import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Plus, Users } from "lucide-react";

// Sample process data
const processes = [
  {
    id: "PROC001",
    name: "Inventory Audit",
    status: "In Progress",
    progress: 65,
    assignedTo: "John Doe",
    startDate: "2023-05-01",
    dueDate: "2023-05-15",
    description: "Complete audit of all inventory items in the warehouse.",
  },
  {
    id: "PROC002",
    name: "Quarterly Report",
    status: "Pending",
    progress: 0,
    assignedTo: "Jane Smith",
    startDate: "2023-05-10",
    dueDate: "2023-05-20",
    description: "Prepare quarterly financial report for stakeholders.",
  },
  {
    id: "PROC003",
    name: "Equipment Maintenance",
    status: "Completed",
    progress: 100,
    assignedTo: "Mike Johnson",
    startDate: "2023-04-25",
    dueDate: "2023-05-05",
    description: "Regular maintenance of all warehouse equipment.",
  },
  {
    id: "PROC004",
    name: "Staff Training",
    status: "In Progress",
    progress: 30,
    assignedTo: "Sarah Williams",
    startDate: "2023-05-05",
    dueDate: "2023-05-25",
    description: "Training session for new inventory management system.",
  },
  {
    id: "PROC005",
    name: "Supplier Evaluation",
    status: "In Progress",
    progress: 80,
    assignedTo: "John Doe",
    startDate: "2023-04-20",
    dueDate: "2023-05-10",
    description: "Evaluate current suppliers for cost and quality.",
  },
];

export default function ProcessesPage() {
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Process Management
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Process
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Processes</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {processes.map((process) => (
            <ProcessCard
              key={process.id}
              process={process}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="space-y-4">
          {processes
            .filter((p) => p.status === "In Progress")
            .map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {processes
            .filter((p) => p.status === "Completed")
            .map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {processes
            .filter((p) => p.status === "Pending")
            .map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProcessCardProps {
  process: {
    id: string;
    name: string;
    status: string;
    progress: number;
    assignedTo: string;
    startDate: string;
    dueDate: string;
    description: string;
  };
  getStatusColor: (status: string) => string;
}

function ProcessCard({ process, getStatusColor }: ProcessCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{process.name}</CardTitle>
            <CardDescription>{process.description}</CardDescription>
          </div>
          <Badge variant="outline" className={getStatusColor(process.status)}>
            {process.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{process.progress}%</span>
            </div>
            <Progress value={process.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Assigned to:</span>
              <span>{process.assignedTo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due date:</span>
              <span>{process.dueDate}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Button size="sm">Update</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
