"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Role } from "@/generated/prisma";
import { Save, Trash2, UserIcon, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteDialog from "@/components/custom-ui/DeleteDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  image: string | null;
  id: string;
  role: Role;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userChanges, setUserChanges] = useState<Map<string, Role>>(new Map());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        setUsers(result.users);
        setUserChanges(new Map());
        setSelectedUsers(new Set());
      } else {
        throw new Error(result.error || "Failed to fetch users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
    setSelectedUsers(new Set()); // Clear selection when filter changes
  }, [users, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);

    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newChanges = new Map(userChanges);

    // If role matches original, remove from changes
    if (user.role === newRole) {
      newChanges.delete(userId);
    } else {
      newChanges.set(userId, newRole);
    }

    setUserChanges(newChanges);
  };

  const hasChanges = () => userChanges.size > 0;

  const isUserModified = (userId: string) => userChanges.has(userId);

  const getUserDisplayRole = (user: User) => {
    return userChanges.get(user.id) || user.role;
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    try {
      const changes = Array.from(userChanges.entries()).map(
        ([userId, role]) => ({
          userId,
          role,
        })
      );

      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save changes");
      }

      fetchUsers();

      toast.success("Changes saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        `Failed to save changes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDelete = async (userIds: string[]) => {
    if (!userIds || userIds.length === 0) {
      toast.error("No users selected for deletion.");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete users");
      }

      fetchUsers();

      toast.success(`${userIds.length} user(s) deleted successfully`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `Failed to delete users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };
  const isAllSelected =
    filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;
  const isIndeterminate =
    selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[250px] w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges()}
          className="bg-aquamarine-50 hover:bg-aquamarine-800 dark:bg-aquamarine dark:hover:bg-aquamarine-50 text-black-2 flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>

        <div className="ml-auto">
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
            disabled={selectedUsers.size === 0}>
            <Trash2 className="h-4 w-4" />
            <span className="sm:hidden">({selectedUsers.size})</span>
            <span className="hidden sm:inline">
              Delete Selected ({selectedUsers.size})
            </span>
          </Button>
        </div>
      </div>

      <Table className="p-2 rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isIndeterminate ? "indeterminate" : isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead className="text-center">Image</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-end">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground">
                {searchQuery.trim()
                  ? "No users found matching your search"
                  : "No users found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className={
                  isUserModified(user.id) ? "bg-green-500/10 border-2" : ""
                }>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Avatar>
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt="User profile picture"
                    />
                    <AvatarFallback className="bg-foreground dark:bg-aquamarine text-background">
                      <UserIcon className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={getUserDisplayRole(user)}
                    onValueChange={(value: Role) =>
                      handleRoleChange(user.id, value)
                    }>
                    <SelectTrigger
                      className={`bg-transparent dark:bg-transparent dark:hover:bg-transparent border-none shadow-none h-auto p-0 ${
                        isUserModified(user.id)
                          ? "text-green-500 font-medium"
                          : ""
                      }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="MOD">MOD</SelectItem>
                      <SelectItem value="USER">USER</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-end">
                  {user.createdAt}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="text-xs text-muted-foreground">
        Showing {filteredUsers.length} out of {users.length} users
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        title="Delete Users"
        id={[...selectedUsers]}
        itemType="user"
      />
    </div>
  );
}
