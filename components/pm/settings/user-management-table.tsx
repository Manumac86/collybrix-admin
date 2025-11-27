"use client";

import { useState } from "react";
import { Plus, Edit, MoreVertical, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers, usePatchUser } from "@/hooks/pm";
import { toast } from "sonner";
import type { User, UserRole } from "@/types/pm";
import { UserDialog } from "./user-dialog";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  developer: "Developer",
  designer: "Designer",
  qa: "QA/Tester",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-500/10 text-red-700 dark:text-red-400",
  project_manager: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  developer: "bg-green-500/10 text-green-700 dark:text-green-400",
  designer: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  qa: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

// User Row Component with hook
function UserRow({
  user,
  onEdit,
}: {
  user: User;
  onEdit: (user: User) => void;
}) {
  const { trigger: patchUser } = usePatchUser(user._id.toString());

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleToggleActive = async () => {
    try {
      const result = await patchUser({
        isActive: !user.isActive,
      });

      if (result.success) {
        toast.success(
          user.isActive
            ? `${user.name} deactivated`
            : `${user.name} activated`
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  return (
    <TableRow>
      {/* User */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.name}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </TableCell>

      {/* Role */}
      <TableCell>
        <Badge variant="secondary" className={cn("font-medium", ROLE_COLORS[user.role])}>
          {ROLE_LABELS[user.role]}
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell>
        {user.isActive ? (
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            Inactive
          </Badge>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleActive}>
              {user.isActive ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function UserManagementTable() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { users, isLoading } = useUsers(
    roleFilter === "all" ? undefined : { role: roleFilter }
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage users and their roles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="qa">QA/Tester</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {roleFilter === "all"
                        ? "No users found"
                        : `No ${roleFilter} users found`}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user._id.toString()}
                    user={user}
                    onEdit={setEditingUser}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        {!isLoading && users.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {users.length} users</span>
            <span>
              Active: {users.filter((u) => u.isActive).length}
            </span>
            <span>
              Inactive: {users.filter((u) => !u.isActive).length}
            </span>
          </div>
        )}
      </div>

      {/* User Dialogs */}
      <UserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
      <UserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
