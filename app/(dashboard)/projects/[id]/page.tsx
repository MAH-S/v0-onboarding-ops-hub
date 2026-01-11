"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { ArrowLeft, ExternalLink, Calendar, Users, ListTodo, Settings2 } from "lucide-react"
import Link from "next/link"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectNotes } from "@/components/projects/project-notes"
import { ProjectUploads } from "@/components/projects/project-uploads"
import { ProjectMilestones } from "@/components/projects/project-milestones"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectCostingRequests } from "@/components/projects/project-costing-requests"
import { ProjectOnboardingControls } from "@/components/projects/project-onboarding-controls"
import { CopilotTriggerButton } from "@/components/copilot/copilot-trigger-button"
import { useCopilotStore } from "@/lib/copilot-store"

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { projects, associates, tasks, milestones } = useAppStore()
  const [activeTab, setActiveTab] = useState("overview")
  const { setContext } = useCopilotStore()

  const project = projects.find((p) => p.id === id)

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

  const projectAssociates = associates.filter((a) => project.assignedAssociates.includes(a.id))
  const projectTasks = tasks.filter((t) => t.projectId === id)
  const projectMilestones = milestones.filter((m) => m.projectId === id)

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Onboarding Controls
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="uploads">Quotes & Invoices</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Task Tracker</TabsTrigger>
          <TabsTrigger value="costing">Costing Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview
            project={project}
            associates={projectAssociates}
            milestones={projectMilestones}
            tasks={projectTasks}
          />
        </TabsContent>

        <TabsContent value="controls">
          <ProjectOnboardingControls project={project} />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={id} />
        </TabsContent>

        <TabsContent value="uploads">
          <ProjectUploads projectId={id} />
        </TabsContent>

        <TabsContent value="milestones">
          <ProjectMilestones projectId={id} />
        </TabsContent>

        <TabsContent value="tasks">
          <ProjectTasks projectId={id} />
        </TabsContent>

        <TabsContent value="costing">
          <ProjectCostingRequests projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
