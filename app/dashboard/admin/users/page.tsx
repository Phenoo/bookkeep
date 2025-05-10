"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Edit,
  MoreHorizontal,
  Search,
  Shield,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isRoleHistoryDialogOpen, setIsRoleHistoryDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [roleChangeHistory, setRoleChangeHistory] = useState<any[]>([]);
  const [userIdForHistory, setUserIdForHistory] = useState<string | null>(null);

  // Fetch users from Convex
  const users = useQuery(api.users.getAll) || [];

  const updateRole = useMutation(api.users.updateRole);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to sync users from Clerk to Convex

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "manager":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "user":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const openRoleUpdateDialog = (user: any) => {
    setSelectedUser({
      ...user,
      previousRole: user.role,
    });
    setRoleChangeReason("");
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setIsLoading(true);

    const promise = updateRole({
      clerkId: selectedUser.clerkId,
      role: selectedUser.role,
    });

    toast.promise(promise, {
      loading: "Updating user role",
      success: `${selectedUser.firstName} ${selectedUser.lastName}'s role has been updated to ${selectedUser.role}`,
      error: "Failed to update role. Please try again.",
    });
    setIsConfirmDialogOpen(false);

    setIsLoading(false);
  };

  const confirmRoleUpdate = () => {
    setIsEditUserDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };
  // Get initials from name
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const viewUserDetails = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Details
                    </TableHead>

                    <TableHead className="hidden md:table-cell">
                      Last Sign In
                    </TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.imageUrl || ""}
                                alt={`${user.firstName} ${user.lastName}`}
                              />
                              <AvatarFallback>
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{`${user.firstName || ""} ${user.lastName || ""}`}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getRoleColor(user.role)}
                          >
                            {user.role === "admin" && (
                              <Shield className="mr-1 h-3 w-3" />
                            )}
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => viewUserDetails(user._id)}
                          >
                            Show
                          </Button>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.lastSignInAt
                            ? formatDistanceToNow(new Date(user.lastSignInAt), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  openRoleUpdateDialog(user);
                                }}
                              >
                                <Shield className="mr-2 h-4 w-4" /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" /> View Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {isLoading ? "Loading users..." : "No users found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Role Dialog */}
      {/* Edit User Role Dialog */}
      {selectedUser && (
        <Dialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser.firstName}{" "}
                {selectedUser.lastName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-role" className="text-right">
                  Current Role
                </Label>
                <div className="col-span-3">
                  <Badge
                    variant="outline"
                    className={getRoleColor(selectedUser.previousRole)}
                  >
                    {selectedUser.previousRole === "admin" && (
                      <Shield className="mr-1 h-3 w-3" />
                    )}
                    {selectedUser.previousRole.charAt(0).toUpperCase() +
                      selectedUser.previousRole.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-role" className="text-right">
                  New Role
                </Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="reason" className="text-right pt-2">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for this role change"
                  className="col-span-3"
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={confirmRoleUpdate}
                disabled={
                  selectedUser.role === selectedUser.previousRole ||
                  isLoading ||
                  !roleChangeReason
                }
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Role Change Dialog */}
      {selectedUser && (
        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser.role === "admin" ? (
                  <div className="flex items-center text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>
                      You are about to grant administrative privileges.
                    </span>
                  </div>
                ) : selectedUser.previousRole === "admin" ? (
                  <div className="flex items-center text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>
                      You are about to remove administrative privileges.
                    </span>
                  </div>
                ) : null}
                Are you sure you want to change {selectedUser.firstName}{" "}
                {selectedUser.lastName}'s role from{" "}
                <Badge
                  variant="outline"
                  className={getRoleColor(selectedUser.previousRole)}
                >
                  {selectedUser.previousRole.charAt(0).toUpperCase() +
                    selectedUser.previousRole.slice(1)}
                </Badge>{" "}
                to{" "}
                <Badge
                  variant="outline"
                  className={getRoleColor(selectedUser.role)}
                >
                  {selectedUser.role.charAt(0).toUpperCase() +
                    selectedUser.role.slice(1)}
                </Badge>
                ?
                {sendEmail && (
                  <p className="mt-2">
                    An email notification will be sent to {selectedUser.email}.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdateRole}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Confirm Change"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
