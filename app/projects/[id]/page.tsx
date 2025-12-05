"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ProjectTimeline } from "@/components/project-timeline";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDeleteProject, useProject } from "@/hooks/projects";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectContacts, setProjectContacts] = useState<any[]>([]);
  const { project, isLoading, error } = useProject(projectId);
  const { trigger: deleteProject } = useDeleteProject(projectId!);
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
      setProjectMilestones(project.milestones || []);
      setProjectContacts(project.contacts || []);
    }
  }, [project]);

  const handleAddMilestone = (newMilestone: any) => {
    setProjectMilestones([...projectMilestones, newMilestone]);
  };

  const handleSaveProject = () => {
    // Refresh project data after update
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const project = await response.json();
          setCurrentProject(project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  };

  const handleDeleteProject = async () => {
    await deleteProject();
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading project...
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="p-8 mb-6">
        <Link href="/projects">
          <Button variant="outline" size="sm" className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center text-muted-foreground">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="outline" size="sm" className="mb-6 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      {/* Project Header with Edit and Delete Buttons */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {currentProject.name}
          </h1>
          <p className="text-muted-foreground mt-2">{currentProject.company}</p>
          <Link
            href={currentProject.docsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            View Project Docs
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>
        {/* Edit and Delete Buttons */}
        <div className="flex gap-2">
          <EditProjectDialog
            project={currentProject}
            onSave={handleSaveProject}
          />
          <DeleteProjectDialog
            projectId={currentProject._id}
            projectName={currentProject.name}
            onDelete={handleDeleteProject}
          />
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Pipeline State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={`${
                pipelineColors[currentProject.pipelineState] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {currentProject.pipelineState}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Project Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                projectTypeColors[currentProject.projectType] ||
                "bg-gray-100 text-gray-800"
              }
            >
              {currentProject.projectType}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-blue-100 text-blue-800">
              {currentProject.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                paymentStatusColors[currentProject.paymentStatus] ||
                "bg-gray-100 text-gray-800"
              }
            >
              {currentProject.paymentStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pricing & Financial Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Initial Pricing</CardTitle>
            <CardDescription>Project quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              €{currentProject.initialPricing.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Final Price</CardTitle>
            <CardDescription>Agreed upon price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {currentProject.finalPrice
                ? `€${currentProject.finalPrice.toLocaleString()}`
                : "Not set"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
            <CardDescription>MMR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              €{(currentProject.mmr || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline */}
      <ProjectTimeline
        milestones={projectMilestones}
        onAddMilestone={handleAddMilestone}
      />

      {/* Description Section */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {currentProject.description}
          </p>
        </CardContent>
      </Card>

      {/* Contacts */}
      {projectContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Contacts</CardTitle>
            <CardDescription>
              {projectContacts.length} contact(s) associated with this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {contact.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contact.position}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {contact.company}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${contact.email}`}>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </a>
                    <a href={`tel:${contact.phoneNumber}`}>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
