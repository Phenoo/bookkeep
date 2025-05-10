import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function UsersTable() {
  const { user } = useUser();
  const users = useQuery(api.users.getAll);
  const updateUserRole = useMutation(api.auth.updateUserRole);
  const [isLoading, setIsLoading] = useState<Id<"users"> | null>(null);

  const handleRoleChange = async (
    userId: Id<"users">,
    newRole: "admin" | "user"
  ) => {
    try {
      setIsLoading(userId);
      await updateUserRole({ userId, role: newRole });
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Users Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{user.name || "N/A"}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user._id,
                          e.target.value as "admin" | "user"
                        )
                      }
                      disabled={isLoading === user._id}
                      className="rounded border p-1 bg-background"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {isLoading === user._id && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        Updating...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
