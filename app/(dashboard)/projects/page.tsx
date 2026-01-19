"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import type { Project, ProjectHealth, ProjectLifecycle } from "@/lib/mock-data"
import { AddProjectDialog } from "@/components/projects/add-project-dialog"
import { FolderKanban, Info } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/auth-store"

import { NewBusinessTable } from "@/components/projects/pipelines/new-business-table"
import { OnboardingTable } from "@/components/projects/pipelines/onboarding-table"
import { ExecutionTable } from "@/components/projects/pipelines/execution-table"
import { ClosureTable } from "@/components/projects/pipelines/closure-table"
import { LearningsTable } from "@/components/projects/pipelines/learnings-table"
import { ProjectControlsSheet } from "@/components/projects/shared/project-controls-sheet"

const LIFECYCLE_TABS: { value: ProjectLifecycle; label: string }[] = [
  { value: "new-business", label: "New Business Acquisition" },
  { value: "onboarding", label: "Project Onboarding" },
  { value: "execution", label: "Project Execution" },
  { value: "closure", label: "Project Closure" },
  { value: "learnings", label: "Project Learnings" },
]

export default function ProjectsPage() {
  const {
    projects,
    updateProjectOnboardingStep,
    updateProjectNewBusinessStep,
    updateProjectHealth,
    toggleFinanceAutomation,
    addRiskNote,
  } = useAppStore()

  const { user, hasPermission, canAccessProject } = useAuthStore()

  const [activeTab, setActiveTab] = useState<ProjectLifecycle>("new-business")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [controlsOpen, setControlsOpen] = useState(false)

  // Local state for controls form
  const [editOnboardingStep, setEditOnboardingStep] = useState<number | undefined>()
  const [editNewBusinessStep, setEditNewBusinessStep] = useState<number | undefined>()
  const [editHealth, setEditHealth] = useState<ProjectHealth>("on-track")
  const [editFinanceBlocked, setEditFinanceBlocked] = useState(false)
  const [riskNote, setRiskNote] = useState("")

  const accessibleProjects = useMemo(() => {
    return projects.filter((p) => canAccessProject(p.ownerId, p.assignedAssociates))
  }, [projects, canAccessProject])

  // Count projects per lifecycle tab (from accessible projects)
  const lifecycleCounts = useMemo(() => {
    const counts: Record<ProjectLifecycle, number> = {
      "new-business": 0,
      onboarding: 0,
      execution: 0,
      closure: 0,
      learnings: 0,
      completed: 0,
    }
    accessibleProjects.forEach((p) => {
      if (counts[p.lifecycle] !== undefined) {
        counts[p.lifecycle]++
      }
    })
    return counts
  }, [accessibleProjects])

  // Filter projects by active tab (from accessible projects)
  const filteredProjects = useMemo(() => {
    return accessibleProjects.filter((p) => p.lifecycle === activeTab)
  }, [accessibleProjects, activeTab])

  const canEditProject = (project: Project) => {
    if (!hasPermission("editProject")) return false
    // Engagement leads can only edit projects they own
    if (user?.role === "engagement-lead") {
      return user.associateId === project.ownerId
    }
    return true
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProjectLifecycle)
  }

  const handleOpenControls = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (!canEditProject(project)) {
      toast.error("You don't have permission to edit this project")
      return
    }
    setSelectedProject(project)
    setEditOnboardingStep(project.onboardingStep)
    setEditNewBusinessStep(project.newBusinessStep)
    setEditHealth(project.health)
    setEditFinanceBlocked(project.financeAutomationBlocked)
    setRiskNote("")
    setControlsOpen(true)
  }

  const handleSaveControls = () => {
    if (!selectedProject) return

    if (
      activeTab === "new-business" &&
      editNewBusinessStep !== undefined &&
      editNewBusinessStep !== selectedProject.newBusinessStep
    ) {
      updateProjectNewBusinessStep(selectedProject.id, editNewBusinessStep)
    } else if (
      activeTab === "onboarding" &&
      editOnboardingStep !== undefined &&
      editOnboardingStep !== selectedProject.onboardingStep
    ) {
      updateProjectOnboardingStep(selectedProject.id, editOnboardingStep)
    }

    if (editHealth !== selectedProject.health) {
      updateProjectHealth(selectedProject.id, editHealth)
    }

    if (editFinanceBlocked !== selectedProject.financeAutomationBlocked) {
      toggleFinanceAutomation(selectedProject.id)
    }

    if (riskNote.trim()) {
      addRiskNote(selectedProject.id, riskNote.trim())
    }

    toast.success("Project updated successfully")
    setControlsOpen(false)
  }

  const renderTable = () => {
    const tableProps = {
      projects: filteredProjects,
      onOpenControls: handleOpenControls,
      canEdit: canEditProject,
    }

    switch (activeTab) {
      case "new-business":
        return <NewBusinessTable {...tableProps} />
      case "onboarding":
        return <OnboardingTable {...tableProps} />
      case "execution":
        return <ExecutionTable {...tableProps} />
      case "closure":
        return <ClosureTable {...tableProps} />
      case "learnings":
        return <LearningsTable {...tableProps} />
      default:
        return <ExecutionTable {...tableProps} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all projects through their lifecycle</p>
        </div>
        {hasPermission("createProject") && <AddProjectDialog />}
      </div>

      {(user?.role === "engagement-lead" || user?.role === "associate") && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {user.role === "engagement-lead"
              ? "You are viewing projects where you are the lead. You can manage all aspects of these projects."
              : "You are viewing projects assigned to you. Navigate to individual projects to see your tasks."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5 h-auto">
          {LIFECYCLE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {lifecycleCounts[tab.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                {LIFECYCLE_TABS.find((t) => t.value === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} in this stage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderTable()}</CardContent>
      </Card>

      <ProjectControlsSheet
        open={controlsOpen}
        onOpenChange={setControlsOpen}
        project={selectedProject}
        activeTab={activeTab}
        editNewBusinessStep={editNewBusinessStep}
        setEditNewBusinessStep={setEditNewBusinessStep}
        editOnboardingStep={editOnboardingStep}
        setEditOnboardingStep={setEditOnboardingStep}
        editHealth={editHealth}
        setEditHealth={setEditHealth}
        editFinanceBlocked={editFinanceBlocked}
        setEditFinanceBlocked={setEditFinanceBlocked}
        riskNote={riskNote}
        setRiskNote={setRiskNote}
        onSave={handleSaveControls}
      />
    </div>
  )
}
