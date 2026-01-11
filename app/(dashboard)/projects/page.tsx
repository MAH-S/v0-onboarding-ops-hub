"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import { ONBOARDING_STEPS, type Project, type ProjectHealth, type ProjectLifecycle } from "@/lib/mock-data"
import {
  FolderKanban,
  AlertTriangle,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Bell,
  CheckCircle2,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const LIFECYCLE_TABS: { value: ProjectLifecycle; label: string }[] = [
  { value: "new-business", label: "New Business Acquisition" },
  { value: "onboarding", label: "Project Onboarding" },
  { value: "execution", label: "Project Execution" },
  { value: "closure", label: "Project Closure" },
  { value: "learnings", label: "Project Learnings" },
]

type SortColumn =
  | "name"
  | "client"
  | "health"
  | "owner"
  | "dueDate"
  | "onboardingStep"
  | "lastUpdate"
  | "finance"
  | "alerts"
  | "progress"

type SortDirection = "asc" | "desc" | null

export default function ProjectsPage() {
  const {
    projects,
    currentUser,
    updateProjectOnboardingStep,
    updateProjectHealth,
    toggleFinanceAutomation,
    addRiskNote,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<ProjectLifecycle>("onboarding")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [controlsOpen, setControlsOpen] = useState(false)

  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Local state for onboarding controls form
  const [editOnboardingStep, setEditOnboardingStep] = useState<number | undefined>()
  const [editHealth, setEditHealth] = useState<ProjectHealth>("on-track")
  const [editFinanceBlocked, setEditFinanceBlocked] = useState(false)
  const [riskNote, setRiskNote] = useState("")

  // Count projects per lifecycle tab
  const lifecycleCounts = useMemo(() => {
    const counts: Record<ProjectLifecycle, number> = {
      "new-business": 0,
      onboarding: 0,
      execution: 0,
      closure: 0,
      learnings: 0,
    }
    projects.forEach((p) => {
      counts[p.lifecycle]++
    })
    return counts
  }, [projects])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
  }

  const filteredProjects = useMemo(() => {
    const healthOrder: Record<ProjectHealth, number> = {
      "critical-risk": 0,
      "at-risk": 1,
      "on-track": 2,
    }

    const financeOrder: Record<string, number> = {
      overdue: 0,
      quote: 1,
      invoice: 2,
      paid: 3,
    }

    let filtered = projects.filter((p) => p.lifecycle === activeTab)

    // Apply custom sorting if set
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0

        switch (sortColumn) {
          case "name":
            comparison = a.name.localeCompare(b.name)
            break
          case "client":
            comparison = a.client.localeCompare(b.client)
            break
          case "health":
            comparison = healthOrder[a.health] - healthOrder[b.health]
            break
          case "owner":
            comparison = (a.owner || "").localeCompare(b.owner || "")
            break
          case "dueDate":
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            break
          case "onboardingStep":
            comparison = (a.onboardingStep || 0) - (b.onboardingStep || 0)
            break
          case "lastUpdate":
            comparison = new Date(a.lastUpdate.date).getTime() - new Date(b.lastUpdate.date).getTime()
            break
          case "finance":
            comparison = financeOrder[a.financeReadiness || "paid"] - financeOrder[b.financeReadiness || "paid"]
            break
          case "alerts":
            comparison = a.alerts.length - b.alerts.length
            break
          case "progress":
            comparison = a.milestonesProgress - b.milestonesProgress
            break
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
    } else {
      // Default sort: Critical Risk first
      filtered = filtered.sort((a, b) => healthOrder[a.health] - healthOrder[b.health])
    }

    return filtered
  }, [projects, activeTab, sortColumn, sortDirection])

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProjectLifecycle)
    setSortColumn(null)
    setSortDirection(null)
  }

  const router = useRouter()

  const handleRowClick = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const handleOpenControls = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setSelectedProject(project)
    setEditOnboardingStep(project.onboardingStep)
    setEditHealth(project.health)
    setEditFinanceBlocked(project.financeAutomationBlocked)
    setRiskNote("")
    setControlsOpen(true)
  }

  const handleSaveControls = () => {
    if (!selectedProject) return

    // Update onboarding step if changed
    if (editOnboardingStep !== undefined && editOnboardingStep !== selectedProject.onboardingStep) {
      updateProjectOnboardingStep(selectedProject.id, editOnboardingStep)
    }

    // Update health if changed
    if (editHealth !== selectedProject.health) {
      updateProjectHealth(selectedProject.id, editHealth)
    }

    // Toggle finance automation if changed
    if (editFinanceBlocked !== selectedProject.financeAutomationBlocked) {
      toggleFinanceAutomation(selectedProject.id)
    }

    // Add risk note if provided
    if (riskNote.trim()) {
      addRiskNote(selectedProject.id, riskNote.trim())
    }

    toast.success("Project updated successfully")
    setControlsOpen(false)
  }

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case "on-track":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            On Track
          </Badge>
        )
      case "at-risk":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-0">
            <AlertTriangle className="mr-1 h-3 w-3" />
            At Risk
          </Badge>
        )
      case "critical-risk":
        return (
          <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-0">
            <AlertCircle className="mr-1 h-3 w-3" />
            Critical Risk
          </Badge>
        )
    }
  }

  const getFinanceBadge = (status: Project["financeReadiness"]) => {
    switch (status) {
      case "quote":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <FileText className="mr-1 h-3 w-3" />
            Quote
          </Badge>
        )
      case "invoice":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <DollarSign className="mr-1 h-3 w-3" />
            Invoice
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-0">
            <Clock className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
    }
  }

  const getOnboardingStepLabel = (step?: number) => {
    if (!step) return "—"
    const found = ONBOARDING_STEPS.find((s) => s.step === step)
    return found ? `${step}: ${found.label}` : `Step ${step}`
  }

  // Check if we're on the onboarding tab (show optimized table)
  const isOnboardingTab = activeTab === "onboarding"

  const SortableHeader = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => (
    <TableHead
      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Manage and track all onboarding projects</p>
      </div>

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
                {sortColumn && sortDirection && (
                  <span className="ml-2 text-xs">
                    • Sorted by {sortColumn} ({sortDirection === "asc" ? "ascending" : "descending"})
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isOnboardingTab ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <SortableHeader column="name">Project / Client</SortableHeader>
                    <SortableHeader column="onboardingStep">Onboarding Step</SortableHeader>
                    <SortableHeader column="health">Health</SortableHeader>
                    <SortableHeader column="owner">Owner</SortableHeader>
                    <TableHead className="font-semibold">Next Action</TableHead>
                    <SortableHeader column="dueDate">Due Date</SortableHeader>
                    <SortableHeader column="lastUpdate">Last Update</SortableHeader>
                    <SortableHeader column="finance">Finance</SortableHeader>
                    <SortableHeader column="alerts">Alerts</SortableHeader>
                    <TableHead className="font-semibold w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                        No projects in this stage
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(project)}
                      >
                        <TableCell>
                          <div>
                            <span className="font-medium text-foreground">{project.name}</span>
                            <p className="text-sm text-muted-foreground">{project.client}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getOnboardingStepLabel(project.onboardingStep)}</span>
                        </TableCell>
                        <TableCell>{getHealthBadge(project.health)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{project.owner}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {project.nextAction}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm ${
                              new Date(project.dueDate) < new Date() ? "text-red-600 font-medium" : ""
                            }`}
                          >
                            {format(new Date(project.dueDate), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span>{format(new Date(project.lastUpdate.date), "MMM d")}</span>
                            <p className="text-xs text-muted-foreground">{project.lastUpdate.user}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getFinanceBadge(project.financeReadiness)}</TableCell>
                        <TableCell className="text-center">
                          {project.alerts.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Bell className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">{project.alerts.length}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleOpenControls(e, project)}
                          >
                            <Settings2 className="h-4 w-4" />
                            <span className="sr-only">Onboarding controls</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Standard table for other lifecycle stages
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <SortableHeader column="name">Project / Client</SortableHeader>
                    <SortableHeader column="health">Health</SortableHeader>
                    <SortableHeader column="owner">Owner</SortableHeader>
                    <TableHead className="font-semibold">Next Action</TableHead>
                    <SortableHeader column="dueDate">Due Date</SortableHeader>
                    <SortableHeader column="progress">Progress</SortableHeader>
                    <SortableHeader column="finance">Finance</SortableHeader>
                    <SortableHeader column="alerts">Alerts</SortableHeader>
                    <TableHead className="font-semibold w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        No projects in this stage
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(project)}
                      >
                        <TableCell>
                          <div>
                            <span className="font-medium text-foreground">{project.name}</span>
                            <p className="text-sm text-muted-foreground">{project.client}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getHealthBadge(project.health)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{project.owner}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {project.nextAction}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm ${
                              new Date(project.dueDate) < new Date() ? "text-red-600 font-medium" : ""
                            }`}
                          >
                            {format(new Date(project.dueDate), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${project.milestonesProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{project.milestonesProgress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getFinanceBadge(project.financeReadiness)}</TableCell>
                        <TableCell className="text-center">
                          {project.alerts.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Bell className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">{project.alerts.length}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleOpenControls(e, project)}
                          >
                            <Settings2 className="h-4 w-4" />
                            <span className="sr-only">Onboarding controls</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={controlsOpen} onOpenChange={setControlsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Onboarding Controls</SheetTitle>
            <SheetDescription>
              {selectedProject?.name} — {selectedProject?.client}
            </SheetDescription>
          </SheetHeader>

          {selectedProject && (
            <div className="mt-6 space-y-6">
              {/* Alerts section */}
              {selectedProject.alerts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Alerts</Label>
                  <div className="space-y-2">
                    {selectedProject.alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                          alert.type === "blocker"
                            ? "bg-red-500/10 text-red-700"
                            : alert.type === "overdue"
                              ? "bg-amber-500/10 text-amber-700"
                              : alert.type === "risk"
                                ? "bg-orange-500/10 text-orange-700"
                                : "bg-blue-500/10 text-blue-700"
                        }`}
                      >
                        {alert.type === "blocker" && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                        {alert.type === "overdue" && <Clock className="h-4 w-4 mt-0.5 shrink-0" />}
                        {alert.type === "risk" && <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                        {alert.type === "pending" && <Bell className="h-4 w-4 mt-0.5 shrink-0" />}
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Change Onboarding Step */}
              <div className="space-y-2">
                <Label htmlFor="onboarding-step">Change Onboarding Step</Label>
                <Select value={editOnboardingStep?.toString()} onValueChange={(v) => setEditOnboardingStep(Number(v))}>
                  <SelectTrigger id="onboarding-step">
                    <SelectValue placeholder="Select step" />
                  </SelectTrigger>
                  <SelectContent>
                    {ONBOARDING_STEPS.map((stepObj) => (
                      <SelectItem key={stepObj.step} value={stepObj.step.toString()}>
                        {stepObj.step}: {stepObj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Update Project Health */}
              <div className="space-y-2">
                <Label>Update Project Health</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={editHealth === "on-track" ? "default" : "outline"}
                    size="sm"
                    className={editHealth === "on-track" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => setEditHealth("on-track")}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    On Track
                  </Button>
                  <Button
                    type="button"
                    variant={editHealth === "at-risk" ? "default" : "outline"}
                    size="sm"
                    className={editHealth === "at-risk" ? "bg-amber-600 hover:bg-amber-700" : ""}
                    onClick={() => setEditHealth("at-risk")}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    At Risk
                  </Button>
                  <Button
                    type="button"
                    variant={editHealth === "critical-risk" ? "default" : "outline"}
                    size="sm"
                    className={editHealth === "critical-risk" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setEditHealth("critical-risk")}
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Critical
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Block Finance Automation */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="finance-block">Block Finance Automation</Label>
                  <p className="text-xs text-muted-foreground">Prevents automatic invoice/quote generation</p>
                </div>
                <Switch id="finance-block" checked={editFinanceBlocked} onCheckedChange={setEditFinanceBlocked} />
              </div>

              <Separator />

              {/* Add Risk/Issue Note */}
              <div className="space-y-2">
                <Label htmlFor="risk-note">Add Risk/Issue Note</Label>
                <Textarea
                  id="risk-note"
                  placeholder="Document any risks, issues, or important updates..."
                  value={riskNote}
                  onChange={(e) => setRiskNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Audit Log */}
              {selectedProject.auditLog && selectedProject.auditLog.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recent Changes</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedProject.auditLog.slice(0, 5).map((entry, idx) => (
                        <div key={idx} className="text-xs p-2 bg-muted rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-muted-foreground">
                              {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1">by {entry.user}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Save Button */}
              <Button className="w-full" onClick={handleSaveControls}>
                Save Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
