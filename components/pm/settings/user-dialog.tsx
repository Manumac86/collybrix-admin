"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateUser, useUpdateUser } from "@/hooks/pm";
import { toast } from "sonner";
import { USER_ROLES } from "@/types/pm";
import type { User, UserRole } from "@/types/pm";

interface UserDialogProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  developer: "Developer",
  designer: "Designer",
  qa: "QA/Tester",
};

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("developer");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { trigger: createUser, isMutating: isCreating } = useCreateUser();
  const { trigger: updateUser, isMutating: isUpdating } = useUpdateUser(
    user?._id.toString() || null
  );

  const isEditing = !!user;
  const isMutating = isCreating || isUpdating;

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setAvatarUrl(user.avatarUrl || "");
      setIsActive(user.isActive);
    } else if (open && !user) {
      setName("");
      setEmail("");
      setRole("developer");
      setAvatarUrl("");
      setIsActive(true);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required");
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        role,
        avatarUrl: avatarUrl.trim() || null,
        isActive,
        clerkId: null, // Placeholder for future Clerk integration
      };

      if (isEditing) {
        const result = await updateUser(userData);
        if (result.success) {
          toast.success("User updated successfully");
          onOpenChange(false);
        }
      } else {
        const result = await createUser(userData);
        if (result.success) {
          toast.success("User created successfully");
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} user`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update user information and permissions."
                : "Add a new team member to the project."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || undefined} alt={name} />
                <AvatarFallback className="text-lg">
                  {name ? getInitials(name) : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar-url" className="text-sm font-medium">
                  Avatar URL (optional)
                </Label>
                <Input
                  id="avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoFocus={!isEditing}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {role === "admin" && "Full access to all project settings"}
                {role === "project_manager" && "Manage sprints, tasks, and team"}
                {role === "developer" && "Create and update tasks"}
                {role === "designer" && "Create and update design tasks"}
                {role === "qa" && "Test and report bugs"}
              </p>
            </div>

            {/* Active Status (only for editing) */}
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setIsActive(checked === true)
                  }
                />
                <Label
                  htmlFor="is-active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active user
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update User"
                : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
