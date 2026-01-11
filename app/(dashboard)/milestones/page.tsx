"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import {
  Flag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  ChevronRight,
  Target,
  TrendingUp,
  Calendar,
  Building2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import type { ProjectLifecycle, Project } from "@/lib/mock-data"

const LIFECYCLE_STAGES: { id: ProjectLifecycle; label: string; color: string; lightColor: string }[] = [
  { id: "new-business", label: "New Business", color: "bg-blue-600", lightColor: "bg-blue-200" },
  { id: "onboarding", label: "Onboarding", color: "bg-blue-600", lightColor: "bg-blue-200" },
  { id: "execution", label: "Execution", color: "bg-blue-600", lightColor: "bg-blue-200" },
  { id: "closure", label: "Closure", color: "bg-blue-600", lightColor: "bg-blue-200" },
  { id: "learnings", label: "Learnings", color: "bg-blue-600", lightColor: "bg-blue-200" },
]

function getLifecycleIndex(lifecycle: ProjectLifecycle): number {
  return LIFECYCLE_STAGES.findIndex((s) => s.id === lifecycle)
}

function ProjectLifecycleProgress({ project }: { project: Project }) {
  const currentIndex = getLifecycleIndex(project.lifecycle)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Project Phase</span>
        <span className="font-medium text-foreground">{LIFECYCLE_STAGES[currentIndex]?.label || "Unknown"}</span>
      </div>
      <div className="flex gap-1">
        {LIFECYCLE_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={stage.id} className="flex-1 relative group">
              <div
                className={`h-3 rounded-sm transition-all ${
                  isCompleted ? "bg-blue-600" : isCurrent ? "bg-blue-300 dark:bg-blue-400" : "bg-muted"
                }`}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap border">
                  {stage.label}
                  {isCompleted && " - Completed"}
                  {isCurrent && " - Current"}
                  {isFuture && " - Upcoming"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {LIFECYCLE_STAGES.map((stage, index) => (
          <span
            key={stage.id}
            className={`${
              index === currentIndex ? "text-blue-600 dark:text-blue-400 font-medium" : ""
            } ${index === 0 ? "text-left" : index === 4 ? "text-right" : "text-center"} flex-1`}
          >
            {stage.label.split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProjectHealthBadge({ health }: { health: Project["health"] }) {
  const config = {
    "on-track": { label: "On Track", variant: "default" as const, className: "bg-emerald-600 hover:bg-emerald-700" },
    "at-risk": {
      label: "At Risk",
      variant: "secondary" as const,
      className: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    "critical-risk": { label: "Critical", variant: "destructive" as const, className: "" },
  }
  const { label, variant, className } = config[health] || config["on-track"]

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export default function MilestonesPage() {
  const { milestones, projects, tasks, associates } = useAppStore()
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"by-project" | "timeline">("by-project")

  // Calculate KPIs
  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const inProgressMilestones = milestones.filter((m) => m.status === "in-progress").length
  const blockedMilestones = milestones.filter((m) => m.status === "blocked").length
  const overdueMilestones = milestones.filter(
    (m) => new Date(m.dueDate) < new Date() && m.status !== "completed",
  ).length

  // Filter milestones
  const filteredMilestones = milestones.filter((milestone) => {
    const project = projects.find((p) => p.id === milestone.projectId)
    if (projectFilter !== "all" && milestone.projectId !== projectFilter) return false
    if (lifecycleFilter !== "all" && project?.lifecycle !== lifecycleFilter) return false
    if (statusFilter !== "all" && milestone.status !== statusFilter) return false
    return true
  })

  // Group milestones by project
  const milestonesByProject = filteredMilestones.reduce(
    (acc, milestone) => {
      if (!acc[milestone.projectId]) {
        acc[milestone.projectId] = []
      }
      acc[milestone.projectId].push(milestone)
      return acc
    },
    {} as Record<string, typeof milestones>,
  )

  // Sort milestones within each project by start date
  Object.keys(milestonesByProject).forEach((projectId) => {
    milestonesByProject[projectId].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  })

  // Get projects that have milestones
  const projectsWithMilestones = projects.filter((p) => milestonesByProject[p.id]?.length > 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "blocked":
        return <Ban className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "blocked":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Milestones Tracker</h1>
        <p className="text-muted-foreground">Track project phases and milestone progress across all projects</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMilestones}</div>
            <p className="text-xs text-muted-foreground">Across {projects.length} projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedMilestones}</div>
            <p className="text-xs text-muted-foreground">
              {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressMilestones}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{blockedMilestones}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{overdueMilestones}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                Project Milestones
              </CardTitle>
              <CardDescription>
                {filteredMilestones.length} milestone{filteredMilestones.length !== 1 ? "s" : ""} in{" "}
                {projectsWithMilestones.length} project{projectsWithMilestones.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {LIFECYCLE_STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Project-grouped view */}
          <div className="space-y-6">
            {projectsWithMilestones.map((project) => {
              const projectMilestones = milestonesByProject[project.id] || []
              const completedCount = projectMilestones.filter((m) => m.status === "completed").length
              const totalCount = projectMilestones.length
              const overallProgress =
                totalCount > 0
                  ? Math.round(projectMilestones.reduce((sum, m) => sum + m.completion, 0) / totalCount)
                  : 0

              return (
                <div key={project.id} className="rounded-lg border bg-card">
                  {/* Project Header */}
                  <div className="border-b bg-muted/30 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">
                              {project.name}
                            </Link>
                            <ProjectHealthBadge health={project.health} />
                          </div>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {completedCount}/{totalCount} milestones completed
                            </span>
                            <span>|</span>
                            <span>Overall: {overallProgress}%</span>
                          </div>
                        </div>
                      </div>
                      {/* Lifecycle Progress */}
                      <div className="w-full lg:w-80">
                        <ProjectLifecycleProgress project={project} />
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {projectMilestones.map((milestone, index) => {
                        const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id)
                        const openTasksCount = milestoneTasks.filter((t) => t.status !== "done").length
                        const completedTasksCount = milestoneTasks.filter((t) => t.status === "done").length
                        const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"
                        const assigneeIds = [...new Set(milestoneTasks.map((t) => t.assigneeId))]
                        const assignees = associates.filter((a) => assigneeIds.includes(a.id))

                        return (
                          <div
                            key={milestone.id}
                            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                              isOverdue ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""
                            } ${milestone.status === "blocked" ? "border-destructive/50 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                          >
                            {/* Timeline Connector */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                  milestone.status === "completed"
                                    ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900"
                                    : milestone.status === "in-progress"
                                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                                      : milestone.status === "blocked"
                                        ? "border-destructive bg-red-100 dark:bg-red-900"
                                        : "border-muted-foreground bg-muted"
                                }`}
                              >
                                {getStatusIcon(milestone.status)}
                              </div>
                              {index < projectMilestones.length - 1 && (
                                <div className="absolute top-10 h-[calc(100%+12px)] w-0.5 bg-border" />
                              )}
                            </div>

                            {/* Milestone Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium truncate">{milestone.title}</h4>
                                <Badge className={getStatusBadgeClass(milestone.status)}>
                                  {milestone.status.replace("-", " ")}
                                </Badge>
                                {isOverdue && (
                                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(milestone.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  <ArrowRight className="h-3 w-3" />
                                  {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span>|</span>
                                <span>
                                  {completedTasksCount}/{milestoneTasks.length} tasks
                                </span>
                              </div>
                              {milestone.blockers.length > 0 && (
                                <div className="mt-2 text-sm text-destructive">
                                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                                  {milestone.blockers[0]}
                                </div>
                              )}
                            </div>

                            {/* Progress & Assignees */}
                            <div className="flex items-center gap-4">
                              {assignees.length > 0 && (
                                <div className="hidden sm:flex -space-x-2">
                                  {assignees.slice(0, 3).map((a) => (
                                    <div
                                      key={a.id}
                                      className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium"
                                      title={a.name}
                                    >
                                      {a.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  ))}
                                  {assignees.length > 3 && (
                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                      +{assignees.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="w-32 text-right">
                                <div className="text-sm font-medium">{milestone.completion}%</div>
                                <Progress value={milestone.completion} className="h-2 mt-1" />
                              </div>
                              <Link href={`/projects/${project.id}?tab=milestones`}>
                                <Button variant="ghost" size="icon">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {projectsWithMilestones.length === 0 && (
            <div className="py-12 text-center">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No milestones found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters to see more results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
