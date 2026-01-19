"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import type { Project, Milestone, Task } from "@/lib/mock-data"
import {
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  Target,
  CalendarDays,
  FolderPlus,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface MilestoneInput {
  id: string
  title: string
  startDate: string
  dueDate: string
  tasks: TaskInput[]
}

interface TaskInput {
  id: string
  title: string
  assigneeId: string
  priority: "low" | "medium" | "high"
  dueDate: string
}

const STEPS = [
  { id: 1, title: "Project Info", icon: Target },
  { id: 2, title: "Client", icon: Building2 },
  { id: 3, title: "Team", icon: Users },
  { id: 4, title: "Milestones", icon: CalendarDays },
  { id: 5, title: "Review", icon: CheckCircle2 },
]

export function AddProjectDialog() {
  const { clients, associates, addProject, addMilestoneWithTasks } = useAppStore()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [projectName, setProjectName] = useState("")
  const [problemStatement, setProblemStatement] = useState("")
  const [objectives, setObjectives] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [leadId, setLeadId] = useState<string>("")
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState("")
  const [milestones, setMilestones] = useState<MilestoneInput[]>([])

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const selectedLead = associates.find((a) => a.id === leadId)

  const resetForm = () => {
    setCurrentStep(1)
    setProjectName("")
    setProblemStatement("")
    setObjectives("")
    setSelectedClientId("")
    setLeadId("")
    setTeamMemberIds([])
    setDueDate("")
    setMilestones([])
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectName.trim() && problemStatement.trim()
      case 2:
        return selectedClientId !== ""
      case 3:
        return leadId !== ""
      case 4:
        return true // Milestones are optional
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addMilestoneInput = () => {
    const newMilestone: MilestoneInput = {
      id: `temp-m-${Date.now()}`,
      title: "",
      startDate: "",
      dueDate: "",
      tasks: [],
    }
    setMilestones([...milestones, newMilestone])
  }

  const updateMilestone = (id: string, updates: Partial<MilestoneInput>) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id))
  }

  const addTaskToMilestone = (milestoneId: string) => {
    const newTask: TaskInput = {
      id: `temp-t-${Date.now()}`,
      title: "",
      assigneeId: "",
      priority: "medium",
      dueDate: "",
    }
    setMilestones(milestones.map((m) => (m.id === milestoneId ? { ...m, tasks: [...m.tasks, newTask] } : m)))
  }

  const updateTaskInMilestone = (milestoneId: string, taskId: string, updates: Partial<TaskInput>) => {
    setMilestones(
      milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            }
          : m,
      ),
    )
  }

  const removeTaskFromMilestone = (milestoneId: string, taskId: string) => {
    setMilestones(
      milestones.map((m) => (m.id === milestoneId ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) } : m)),
    )
  }

  const toggleTeamMember = (associateId: string) => {
    if (associateId === leadId) return // Can't remove lead from team
    if (teamMemberIds.includes(associateId)) {
      setTeamMemberIds(teamMemberIds.filter((id) => id !== associateId))
    } else {
      setTeamMemberIds([...teamMemberIds, associateId])
    }
  }

  const handleSubmit = () => {
    const projectId = `p${Date.now()}`
    const now = new Date().toISOString()
    const today = now.split("T")[0]

    // Create the project
    const newProject: Project = {
      id: projectId,
      name: projectName.trim(),
      client: selectedClient?.name || "",
      status: "Onboarding",
      lifecycle: "new-business",
      health: "on-track",
      onboardingStep: 1,
      owner: selectedLead?.name || "",
      ownerId: leadId,
      nextAction: "Complete win communication",
      dueDate: dueDate || today,
      lastUpdate: { date: today, user: selectedLead?.name || "System" },
      financeReadiness: "quote",
      alerts: [],
      financeAutomationBlocked: false,
      auditLog: [{ action: "Project created", user: selectedLead?.name || "System", date: today }],
      assignedAssociates: [leadId, ...teamMemberIds].filter(Boolean),
      milestonesProgress: 0,
      openTasks: milestones.reduce((sum, m) => sum + m.tasks.length, 0),
      avgCycleTime: 0,
      createdAt: now,
      notes: [],
      uploads: [],
      milestones: [],
      costingRequests: [],
    }

    addProject(newProject)

    // Create milestones with tasks
    milestones.forEach((milestoneInput) => {
      if (milestoneInput.title.trim()) {
        const milestone: Omit<Milestone, "tasks"> = {
          id: `m${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: milestoneInput.title.trim(),
          projectId,
          startDate: milestoneInput.startDate || today,
          dueDate: milestoneInput.dueDate || today,
          status: "not-started",
          completion: 0,
          blockers: [],
        }

        const tasks: Omit<Task, "id" | "milestoneId">[] = milestoneInput.tasks
          .filter((t) => t.title.trim())
          .map((t) => ({
            title: t.title.trim(),
            projectId,
            assigneeId: t.assigneeId || leadId,
            status: "todo" as const,
            priority: t.priority,
            dueDate: t.dueDate || milestoneInput.dueDate || today,
          }))

        addMilestoneWithTasks(milestone, tasks)
      }
    })

    toast.success(`Project "${projectName}" created successfully!`, {
      description: "The project has been added to New Business stage.",
    })

    handleClose()
  }

  const allTeamMembers = [leadId, ...teamMemberIds].filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project with client, team, and milestones. The project will start in the New Business stage.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {/* Step 1: Project Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Enterprise Platform Migration"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  placeholder="Describe the business problem or opportunity this project addresses..."
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  What challenge is the client facing? Why is this project important?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Key Objectives (Optional)</Label>
                <Textarea
                  id="objectives"
                  placeholder="List the main goals and success criteria..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Target Completion Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Client Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Client *</Label>
                <p className="text-sm text-muted-foreground">
                  Link this project to an existing client or create a new one.
                </p>
              </div>

              <div className="grid gap-3">
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className={`cursor-pointer transition-all ${
                      selectedClientId === client.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{client.name}</h4>
                            <p className="text-sm text-muted-foreground">{client.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
                          <Badge variant="outline">{client.tier}</Badge>
                        </div>
                      </div>
                      {selectedClientId === client.id && (
                        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                          <p>{client.description}</p>
                          {client.contacts.find((c) => c.isPrimary) && (
                            <p className="mt-2">
                              <span className="font-medium text-foreground">Primary Contact:</span>{" "}
                              {client.contacts.find((c) => c.isPrimary)?.name}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedClientId && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Selected: <strong>{selectedClient?.name}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Team Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Project Lead *</Label>
                <p className="text-sm text-muted-foreground">Select the primary owner responsible for this project.</p>
                <Select
                  value={leadId}
                  onValueChange={(v) => {
                    setLeadId(v)
                    if (!teamMemberIds.includes(v)) {
                      setTeamMemberIds([...teamMemberIds.filter((id) => id !== v)])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {associates.map((associate) => (
                      <SelectItem key={associate.id} value={associate.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{associate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{associate.name}</span>
                          <span className="text-muted-foreground">- {associate.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Team Members (Optional)</Label>
                <p className="text-sm text-muted-foreground">Add additional team members to this project.</p>
                <div className="grid gap-2">
                  {associates
                    .filter((a) => a.id !== leadId)
                    .map((associate) => (
                      <div
                        key={associate.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          teamMemberIds.includes(associate.id) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleTeamMember(associate.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={teamMemberIds.includes(associate.id)} />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{associate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{associate.name}</p>
                            <p className="text-sm text-muted-foreground">{associate.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              associate.availability === "available"
                                ? "default"
                                : associate.availability === "partially-available"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {associate.availability === "available"
                              ? "Available"
                              : associate.availability === "partially-available"
                                ? "Partial"
                                : "Busy"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {associate.activeProjects}/{associate.maxCapacity} projects
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {allTeamMembers.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="mb-2 block">Selected Team ({allTeamMembers.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {allTeamMembers.map((id) => {
                        const member = associates.find((a) => a.id === id)
                        if (!member) return null
                        return (
                          <Badge key={id} variant="secondary" className="gap-1 py-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {member.name}
                            {id === leadId && <span className="text-xs text-primary ml-1">(Lead)</span>}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Milestones */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Project Milestones</Label>
                  <p className="text-sm text-muted-foreground">
                    Define key milestones and their tasks. You can add more later.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addMilestoneInput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              {milestones.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No milestones added yet</p>
                    <p className="text-sm text-muted-foreground">Click "Add Milestone" to define project phases</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, mIndex) => (
                    <Card key={milestone.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Milestone title"
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">Start Date</Label>
                                <Input
                                  type="date"
                                  value={milestone.startDate}
                                  onChange={(e) => updateMilestone(milestone.id, { startDate: e.target.value })}
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">Due Date</Label>
                                <Input
                                  type="date"
                                  value={milestone.dueDate}
                                  onChange={(e) => updateMilestone(milestone.id, { dueDate: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMilestone(milestone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Tasks</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => addTaskToMilestone(milestone.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Task
                            </Button>
                          </div>
                          {milestone.tasks.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2">No tasks added</p>
                          ) : (
                            <div className="space-y-2">
                              {milestone.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                  <Input
                                    className="flex-1 h-8 text-sm"
                                    placeholder="Task title"
                                    value={task.title}
                                    onChange={(e) =>
                                      updateTaskInMilestone(milestone.id, task.id, {
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                  <Select
                                    value={task.assigneeId}
                                    onValueChange={(v) =>
                                      updateTaskInMilestone(milestone.id, task.id, {
                                        assigneeId: v,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue placeholder="Assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {allTeamMembers.map((id) => {
                                        const member = associates.find((a) => a.id === id)
                                        if (!member) return null
                                        return (
                                          <SelectItem key={id} value={id}>
                                            {member.name}
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={task.priority}
                                    onValueChange={(v: "low" | "medium" | "high") =>
                                      updateTaskInMilestone(milestone.id, task.id, { priority: v })
                                    }
                                  >
                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => removeTaskFromMilestone(milestone.id, task.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Project Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">PROJECT NAME</Label>
                    <p className="font-medium text-lg">{projectName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">PROBLEM STATEMENT</Label>
                    <p className="text-sm">{problemStatement}</p>
                  </div>
                  {objectives && (
                    <div>
                      <Label className="text-muted-foreground text-xs">OBJECTIVES</Label>
                      <p className="text-sm">{objectives}</p>
                    </div>
                  )}
                  {dueDate && (
                    <div>
                      <Label className="text-muted-foreground text-xs">TARGET COMPLETION</Label>
                      <p className="text-sm">{format(new Date(dueDate), "MMMM d, yyyy")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedClient?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient?.industry}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Team ({allTeamMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {allTeamMembers.slice(0, 3).map((id) => {
                        const member = associates.find((a) => a.id === id)
                        return (
                          <Avatar key={id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member?.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )
                      })}
                      {allTeamMembers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          +{allTeamMembers.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Lead: {selectedLead?.name}</p>
                  </CardContent>
                </Card>
              </div>

              {milestones.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Milestones ({milestones.filter((m) => m.title.trim()).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {milestones
                        .filter((m) => m.title.trim())
                        .map((m, i) => (
                          <div key={m.id} className="flex items-center justify-between text-sm">
                            <span>
                              {i + 1}. {m.title}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {m.tasks.filter((t) => t.title.trim()).length} tasks
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm">
                  This project will be created in the <strong>New Business</strong> stage with <strong>On Track</strong>{" "}
                  health status.
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="shrink-0" />

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-background">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Create Project
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
