"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Users,
  ListTodo,
  Settings2,
  Briefcase,
  Play,
  Archive,
  BookOpen,
  Trophy,
  Info,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectNotes } from "@/components/projects/project-notes"
import { ProjectUploads } from "@/components/projects/project-uploads"
import { ProjectMilestones } from "@/components/projects/project-milestones"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectCostingRequests } from "@/components/projects/project-costing-requests"
import { ProjectPipelineControls, getPipelineTabLabel } from "@/components/projects/project-pipeline-controls"
import { CopilotTriggerButton } from "@/components/copilot/copilot-trigger-button"
import { useCopilotStore } from "@/lib/copilot-store"
import type { ProjectLifecycle } from "@/lib/mock-data"

const getLifecycleIcon = (lifecycle: ProjectLifecycle) => {
  switch (lifecycle) {
    case "new-business":
      return <Briefcase className="h-3.5 w-3.5" />
    case "onboarding":
      return <Play className="h-3.5 w-3.5" />
    case "execution":
      return <Play className="h-3.5 w-3.5" />
    case "closure":
      return <Archive className="h-3.5 w-3.5" />
    case "learnings":
      return <BookOpen className="h-3.5 w-3.5" />
    case "completed":
      return <Trophy className="h-3.5 w-3.5" />
    default:
      return <Settings2 className="h-3.5 w-3.5" />
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { projects, associates, tasks, milestones } = useAppStore()
  const { user, hasPermission, canAccessProject } = useAuthStore()
  const [activeTab, setActiveTab] = useState("overview")
  const { setContext } = useCopilotStore()

  const project = projects.find((p) => p.id === id)

  // Check access permission
  const hasAccess = project ? canAccessProject(project.ownerId, project.assignedAssociates) : false

  // Check if user can edit this project
  const canEdit =
    hasAccess &&
    hasPermission("editProject") &&
    (user?.role !== "engagement-lead" || user.associateId === project?.ownerId)

  // Associates can only see tasks tab
  const isAssociateOnly = user?.role === "associate"

  useEffect(() => {
    // Redirect if no access
    if (project && !hasAccess) {
      router.push("/projects")
    }
  }, [project, hasAccess, router])

  useEffect(() => {
    // Associates should default to tasks tab
    if (isAssociateOnly) {
      setActiveTab("tasks")
    }
  }, [isAssociateOnly])

  useEffect(() => {
    if (project) {
      setContext({
        scope: "project",
        project,
      })
    }
    return () => {
      setContext({ scope: "global" })
    }
  }, [project, setContext])

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">You don't have access to this project</p>
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  const projectAssociates = associates.filter((a) => project.assignedAssociates.includes(a.id))
  const projectTasks = tasks.filter((t) => t.projectId === id)
  const projectMilestones = milestones.filter((m) => m.projectId === id)

  // For associates, filter tasks to only show their assigned tasks
  const visibleTasks =
    isAssociateOnly && user?.associateId ? projectTasks.filter((t) => t.assigneeId === user.associateId) : projectTasks

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Onboarding":
        return "secondary"
      case "Execution":
        return "default"
      case "Blocked":
        return "destructive"
      case "Closed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const lifecycle = project.lifecycle ?? "onboarding"
  const pipelineTabLabel = getPipelineTabLabel(lifecycle)
  const PipelineIcon = getLifecycleIcon(lifecycle)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
            <Badge variant="outline" className="capitalize">
              {lifecycle.replace("-", " ")}
            </Badge>
            {!canEdit && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                View Only
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{project.client}</p>
        </div>
        <CopilotTriggerButton context={{ scope: "project", project }} label="Ask Copilot" />
        {project.mondayBoardLink && (
          <Button variant="outline" asChild>
            <a href={project.mondayBoardLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              monday.com Board
            </a>
          </Button>
        )}
      </div>

      {isAssociateOnly && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You are viewing your assigned tasks for this project. Contact the project lead for other project details.
          </AlertDescription>
        </Alert>
      )}

      {!isAssociateOnly && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Progress value={project.milestonesProgress} className="h-2 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.milestonesProgress}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                  <ListTodo className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectTasks.filter((t) => t.status !== "done").length}</p>
                  <p className="text-xs text-muted-foreground">Open Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectAssociates.length}</p>
                  <p className="text-xs text-muted-foreground">Associates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <Calendar className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.avgCycleTime}d</p>
                  <p className="text-xs text-muted-foreground">Avg Cycle Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {/* Associates only see tasks */}
          {isAssociateOnly ? (
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          ) : (
            <>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {canEdit && (
                <TabsTrigger value="controls" className="flex items-center gap-1.5">
                  {PipelineIcon}
                  {pipelineTabLabel}
                </TabsTrigger>
              )}
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="uploads">Quotes & Invoices</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="tasks">Task Tracker</TabsTrigger>
              <TabsTrigger value="costing">Costing Requests</TabsTrigger>
            </>
          )}
        </TabsList>

        {!isAssociateOnly && (
          <>
            <TabsContent value="overview">
              <ProjectOverview
                project={project}
                associates={projectAssociates}
                milestones={projectMilestones}
                tasks={projectTasks}
                canEdit={canEdit}
              />
            </TabsContent>

            {canEdit && (
              <TabsContent value="controls">
                <ProjectPipelineControls project={project} />
              </TabsContent>
            )}

            <TabsContent value="notes">
              <ProjectNotes projectId={id} canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="uploads">
              <ProjectUploads projectId={id} canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="milestones">
              <ProjectMilestones projectId={id} canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="costing">
              <ProjectCostingRequests projectId={id} canEdit={canEdit} />
            </TabsContent>
          </>
        )}

        <TabsContent value="tasks">
          <ProjectTasks
            projectId={id}
            canEdit={canEdit || isAssociateOnly}
            filterByAssociateId={isAssociateOnly ? user?.associateId : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
