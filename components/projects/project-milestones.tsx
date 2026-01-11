"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import {
  Flag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Plus,
  Trash2,
  ListTodo,
  Users,
  ChevronDown,
  MoreHorizontal,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

interface ProjectMilestonesProps {
  projectId: string
}

interface NewTask {
  title: string
  assigneeId: string
  priority: "low" | "medium" | "high"
  dueDate: string
}

export function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  const { milestones, tasks, associates, addMilestoneWithTasks, updateMilestone, deleteMilestone } = useAppStore()
  const [open, setOpen] = useState(false)
  const [milestoneTitle, setMilestoneTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [milestoneTasks, setMilestoneTasks] = useState<NewTask[]>([])
  const [assignedTeam, setAssignedTeam] = useState<string[]>([])
  const [teamPopoverOpen, setTeamPopoverOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editStartDate, setEditStartDate] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editStatus, setEditStatus] = useState<"not-started" | "in-progress" | "completed" | "blocked">("not-started")
  const [editBlockers, setEditBlockers] = useState("")
  const [editAssignedTeam, setEditAssignedTeam] = useState<string[]>([])
  const [editTeamPopoverOpen, setEditTeamPopoverOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null)

  const projectMilestones = milestones.filter((m) => m.projectId === projectId)
  const projectAssociates = associates

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-chart-1" />
      case "blocked":
        return <Ban className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "blocked":
        return "destructive"
      default:
        return "outline"
    }
  }

  const toggleTeamMember = (associateId: string) => {
    setAssignedTeam((prev) =>
      prev.includes(associateId) ? prev.filter((id) => id !== associateId) : [...prev, associateId],
    )
  }

  const toggleEditTeamMember = (associateId: string) => {
    setEditAssignedTeam((prev) =>
      prev.includes(associateId) ? prev.filter((id) => id !== associateId) : [...prev, associateId],
    )
  }

  const addNewTask = () => {
    setMilestoneTasks([
      ...milestoneTasks,
      {
        title: "",
        assigneeId: "",
        priority: "medium",
        dueDate: dueDate,
      },
    ])
  }

  const updateTask = (index: number, updates: Partial<NewTask>) => {
    const updated = [...milestoneTasks]
    updated[index] = { ...updated[index], ...updates }
    setMilestoneTasks(updated)
  }

  const removeTask = (index: number) => {
    setMilestoneTasks(milestoneTasks.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!milestoneTitle || !startDate || !dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const validTasks = milestoneTasks.filter((t) => t.title && t.assigneeId)

    const milestoneId = `m${Date.now()}`

    addMilestoneWithTasks(
      {
        id: milestoneId,
        title: milestoneTitle,
        projectId,
        startDate,
        dueDate,
        status: "not-started",
        completion: 0,
        blockers: [],
        assignedTeam: assignedTeam,
      },
      validTasks.map((t) => ({
        title: t.title,
        projectId,
        assigneeId: t.assigneeId,
        status: "todo" as const,
        priority: t.priority,
        dueDate: t.dueDate || dueDate,
      })),
    )

    const teamCount = assignedTeam.length
    toast.success(
      `Milestone "${milestoneTitle}" created with ${validTasks.length} task(s)${teamCount > 0 ? ` and ${teamCount} team member(s)` : ""}`,
    )

    // Reset form
    setMilestoneTitle("")
    setStartDate("")
    setDueDate("")
    setMilestoneTasks([])
    setAssignedTeam([])
    setOpen(false)
  }

  const openEditDialog = (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId)
    if (!milestone) return

    setEditingMilestone(milestoneId)
    setEditTitle(milestone.title)
    setEditStartDate(milestone.startDate)
    setEditDueDate(milestone.dueDate)
    setEditStatus(milestone.status)
    setEditBlockers(milestone.blockers.join("\n"))
    setEditAssignedTeam((milestone as any).assignedTeam || [])
    setEditOpen(true)
  }

  const handleEditSubmit = () => {
    if (!editingMilestone || !editTitle || !editStartDate || !editDueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    updateMilestone(editingMilestone, {
      title: editTitle,
      startDate: editStartDate,
      dueDate: editDueDate,
      status: editStatus,
      blockers: editBlockers.split("\n").filter((b) => b.trim()),
      assignedTeam: editAssignedTeam,
    } as any)

    toast.success(`Milestone "${editTitle}" updated`)
    setEditOpen(false)
    setEditingMilestone(null)
  }

  const handleDeleteMilestone = () => {
    if (!milestoneToDelete) return

    const milestone = milestones.find((m) => m.id === milestoneToDelete)
    deleteMilestone(milestoneToDelete)
    toast.success(`Milestone "${milestone?.title}" deleted`)
    setDeleteDialogOpen(false)
    setMilestoneToDelete(null)
  }

  const getSelectedTeamMembers = () => {
    return associates.filter((a) => assignedTeam.includes(a.id))
  }

  const getEditSelectedTeamMembers = () => {
    return associates.filter((a) => editAssignedTeam.includes(a.id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Milestones
            </CardTitle>
            <CardDescription>Track project milestones and sub-tasks</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Milestone</DialogTitle>
                <DialogDescription>Add a milestone with optional tasks to track progress</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="milestone-title">Milestone Title *</Label>
                  <Input
                    id="milestone-title"
                    placeholder="e.g., Phase 1: Discovery"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due-date">Due Date *</Label>
                    <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assigned Team
                  </Label>
                  <Popover open={teamPopoverOpen} onOpenChange={setTeamPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={teamPopoverOpen}
                        className="justify-between h-auto min-h-10 bg-transparent"
                      >
                        {assignedTeam.length === 0 ? (
                          <span className="text-muted-foreground">Select team members...</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {getSelectedTeamMembers().map((member) => (
                              <Badge key={member.id} variant="secondary" className="text-xs">
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="max-h-60 overflow-y-auto p-2">
                        {projectAssociates.map((associate) => (
                          <div
                            key={associate.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => toggleTeamMember(associate.id)}
                          >
                            <Checkbox
                              checked={assignedTeam.includes(associate.id)}
                              onCheckedChange={() => toggleTeamMember(associate.id)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {associate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{associate.name}</p>
                              <p className="text-xs text-muted-foreground">{associate.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {assignedTeam.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {assignedTeam.length} team member{assignedTeam.length !== 1 ? "s" : ""} assigned
                    </p>
                  )}
                </div>

                {/* Tasks Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-base font-medium">Tasks</Label>
                      <span className="text-sm text-muted-foreground">
                        ({milestoneTasks.length} task{milestoneTasks.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addNewTask}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Task
                    </Button>
                  </div>

                  {milestoneTasks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                      <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks added yet</p>
                      <p className="text-xs">Click "Add Task" to add tasks to this milestone</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestoneTasks.map((task, index) => (
                        <div key={index} className="grid gap-3 p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Task title"
                                value={task.title}
                                onChange={(e) => updateTask(index, { title: e.target.value })}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeTask(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Select
                              value={task.assigneeId}
                              onValueChange={(value) => updateTask(index, { assigneeId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Assignee" />
                              </SelectTrigger>
                              <SelectContent>
                                {assignedTeam.length > 0 && (
                                  <>
                                    {projectAssociates
                                      .filter((a) => assignedTeam.includes(a.id))
                                      .map((associate) => (
                                        <SelectItem key={associate.id} value={associate.id}>
                                          <span className="flex items-center gap-2">
                                            {associate.name}
                                            <Badge variant="outline" className="text-[10px] px-1">
                                              Team
                                            </Badge>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    <div className="border-t my-1" />
                                  </>
                                )}
                                {projectAssociates
                                  .filter((a) => !assignedTeam.includes(a.id))
                                  .map((associate) => (
                                    <SelectItem key={associate.id} value={associate.id}>
                                      {associate.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={task.priority}
                              onValueChange={(value: "low" | "medium" | "high") =>
                                updateTask(index, { priority: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={task.dueDate}
                              onChange={(e) => updateTask(index, { dueDate: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Create Milestone</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectMilestones.map((milestone) => {
            const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id)
            const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"
            const milestoneTeam = (milestone as any).assignedTeam || []
            const teamMembers = associates.filter((a) => milestoneTeam.includes(a.id))

            return (
              <div key={milestone.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {new Date(milestone.startDate).toLocaleDateString()} -{" "}
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      {teamMembers.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <div className="flex -space-x-2">
                            {teamMembers.slice(0, 4).map((member) => (
                              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-[10px]">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {teamMembers.length > 4 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-[10px] font-medium">+{teamMembers.length - 4}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{teamMembers.length} assigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(milestone.status)}>{milestone.status.replace("-", " ")}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(milestone.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Milestone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setMilestoneToDelete(milestone.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Milestone
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <Progress value={milestone.completion} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{milestone.completion}%</span>
                </div>

                {milestone.blockers.length > 0 && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Blockers
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-destructive">
                      {milestone.blockers.map((blocker, i) => (
                        <li key={i}>• {blocker}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {milestoneTasks.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ListTodo className="h-4 w-4" />
                      <span>
                        {milestoneTasks.filter((t) => t.status === "done").length} of {milestoneTasks.length} tasks
                        completed
                      </span>
                    </div>
                    <div className="space-y-2">
                      {milestoneTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {task.status === "done" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                          </div>
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={associates.find((a) => a.id === task.assigneeId)?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-[8px]">
                              {associates
                                .find((a) => a.id === task.assigneeId)
                                ?.name.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                      {milestoneTasks.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{milestoneTasks.length - 3} more tasks</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {projectMilestones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No milestones defined yet</p>
              <p className="text-sm">Click "Add Milestone" to create one</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone details, status, and team assignments</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-milestone-title">Milestone Title *</Label>
              <Input
                id="edit-milestone-title"
                placeholder="e.g., Phase 1: Discovery"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-date">Start Date *</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-due-date">Due Date *</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assigned Team
              </Label>
              <Popover open={editTeamPopoverOpen} onOpenChange={setEditTeamPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={editTeamPopoverOpen}
                    className="justify-between h-auto min-h-10 bg-transparent"
                  >
                    {editAssignedTeam.length === 0 ? (
                      <span className="text-muted-foreground">Select team members...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {getEditSelectedTeamMembers().map((member) => (
                          <Badge key={member.id} variant="secondary" className="text-xs">
                            {member.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-2">
                    {projectAssociates.map((associate) => (
                      <div
                        key={associate.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => toggleEditTeamMember(associate.id)}
                      >
                        <Checkbox
                          checked={editAssignedTeam.includes(associate.id)}
                          onCheckedChange={() => toggleEditTeamMember(associate.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {associate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{associate.name}</p>
                          <p className="text-xs text-muted-foreground">{associate.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {editAssignedTeam.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {editAssignedTeam.length} team member{editAssignedTeam.length !== 1 ? "s" : ""} assigned
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-blockers" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Blockers
              </Label>
              <Textarea
                id="edit-blockers"
                placeholder="Enter blockers, one per line..."
                value={editBlockers}
                onChange={(e) => setEditBlockers(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Enter each blocker on a new line</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milestone? This will also delete all tasks associated with it. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMilestone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
