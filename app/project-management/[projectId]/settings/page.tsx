"use client";

import { useState } from "react";
import { use } from "react";
import { Tag, Users, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementTable } from "@/components/pm/settings/user-management-table";
import { TagManagerDialog } from "@/components/pm/shared/tag-manager-dialog";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/pm";

interface SettingsPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = use(params);
  const { projectId } = resolvedParams;
  const [showTagManager, setShowTagManager] = useState(false);

  const { tags, isLoading: tagsLoading } = useTags(projectId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Settings</h1>
        <p className="text-muted-foreground">
          Manage tags, users, and project configuration
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tags" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Board Settings
          </TabsTrigger>
        </TabsList>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Tags</CardTitle>
                  <CardDescription>
                    Manage tags for categorizing and organizing tasks
                  </CardDescription>
                </div>
                <Button onClick={() => setShowTagManager(true)}>
                  Manage Tags
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tagsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading tags...
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    No tags created yet
                  </p>
                  <Button onClick={() => setShowTagManager(true)}>
                    Create First Tag
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag._id.toString()}
                        className="flex items-center gap-2 px-3 py-2 border rounded-md"
                        style={{
                          borderLeft: `4px solid ${tag.color}`,
                        }}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tags.length} {tags.length === 1 ? "tag" : "tags"} total
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Board Settings Tab */}
        <TabsContent value="board" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Board Configuration</CardTitle>
              <CardDescription>
                Configure board columns, WIP limits, and workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">Coming Soon</p>
                <p className="text-sm">
                  Board customization features will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tag Manager Dialog */}
      <TagManagerDialog
        projectId={projectId}
        open={showTagManager}
        onOpenChange={setShowTagManager}
      />
    </div>
  );
}
