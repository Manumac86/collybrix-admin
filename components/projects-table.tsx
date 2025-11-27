"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteProject, useProjects } from "@/hooks/projects";
import { Search, MoreHorizontal, Eye } from "lucide-react";
import { AddProjectDialog } from "./add-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";

const pipelineColors: Record<string, string> = {
  scouting: "bg-slate-100 text-slate-800",
  "initial contact": "bg-blue-100 text-blue-800",
  qualification: "bg-cyan-100 text-cyan-800",
  discovery: "bg-sky-100 text-sky-800",
  "technical evaluation": "bg-indigo-100 text-indigo-800",
  "due diligence": "bg-violet-100 text-violet-800",
  presentation: "bg-purple-100 text-purple-800",
  negotiation: "bg-fuchsia-100 text-fuchsia-800",
  terms: "bg-pink-100 text-pink-800",
  closing: "bg-rose-100 text-rose-800",
  "to start": "bg-orange-100 text-orange-800",
  "in progress": "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  finished: "bg-emerald-100 text-emerald-800",
};

const projectTypeColors: Record<string, string> = {
  Accelleration: "bg-blue-100 text-blue-800",
  "Software Factory": "bg-purple-100 text-purple-800",
  Consulting: "bg-amber-100 text-amber-800",
  SaaS: "bg-green-100 text-green-800",
};

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  pending: "bg-red-100 text-red-800",
};

export function ProjectsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const { projects, isLoading, error, mutate } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const { trigger: deleteProject } = useDeleteProject(selectedProjectId!);
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, projects]);

  const handleSaveProject = (updatedProject: any) => {
    mutate();
  };

  const handleDeleteProject = async (projectId: string) => {
    await setSelectedProjectId(projectId);
    await deleteProject();
  };

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">
          Error loading projects. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your projects
          </p>
        </div>
        <AddProjectDialog onSuccess={mutate} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {filteredProjects.length} projects found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Pipeline
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Started
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Initial Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Final Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    MMR
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading projects...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr
                      key={project._id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/projects/${project._id}`}
                          className="hover:underline font-medium"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/projects/${project._id}`}
                          className="hover:text-primary"
                        >
                          {project.company}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project._id}`}>
                          <Badge
                            className={`${
                              pipelineColors[project.pipelineState] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.pipelineState}
                          </Badge>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project._id}`}>
                          <Badge
                            className={
                              projectTypeColors[project.projectType] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {project.projectType}
                          </Badge>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <Link href={`/projects/${project._id}`}>
                          {new Date(project.startedDate).toLocaleDateString()}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <Link href={`/projects/${project._id}`}>
                          €{project.initialPricing.toLocaleString()}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <Link href={`/projects/${project._id}`}>
                          {project.finalPrice
                            ? `€${project.finalPrice.toLocaleString()}`
                            : "-"}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <Link href={`/projects/${project._id}`}>
                          €{(project.mmr || 0).toLocaleString()}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project._id}`}>
                          <Badge
                            className={
                              paymentStatusColors[project.paymentStatus] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {project.paymentStatus}
                          </Badge>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <EditProjectDialog
                                project={project}
                                onSave={() => handleSaveProject(project)}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/projects/${project._id}`}
                                className="w-full rounded-md !p-0"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full rounded-md justify-start gap-2 m-0"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <DeleteProjectDialog
                                projectId={project._id}
                                projectName={project.name}
                                onDelete={() =>
                                  handleDeleteProject(project._id.toString())
                                }
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
