"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import {
  Kanban,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Filter,
  User,
  Flag,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/lib/mock-data"
import { useCopilotStore } from "@/lib/copilot-store"
import { toast } from "sonner"

interface ProjectTasksProps {
  projectId: string
}

function TaskCard({
  task,
  associates,
  onEdit,
  onDelete,
}: {
  task: Task
  associates: ReturnType<typeof useAppStore>["associates"]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const assignee = associates.find((a) => a.id === task.assigneeId)
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done"
  const { milestones } = useAppStore()
  const { setContext, openCopilot } = useCopilotStore()
  const milestone = milestones.find((m) => m.id === task.milestoneId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive"
      case "medium":
        return "bg-amber-500/10 text-amber-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleCopilotClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setContext({ scope: "task", task, milestone })
    openCopilot()
  }

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm group relative">
      <div className="mb-2 flex items-start justify-between">
        <p className="text-sm font-medium flex-1 pr-2">{task.title}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopilotClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
            title="Ask Copilot about this task"
          >
            <Sparkles className="h-3 w-3 text-muted-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </Badge>
        {milestone && (
          <Badge variant="outline" className="text-xs">
            {milestone.title}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
              <AvatarFallback className="text-xs">
                {assignee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span
            className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
          >
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
        {task.cycleTime && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {task.cycleTime}d
          </span>
        )}
      </div>
    </div>
  )
}

function SortableTaskCard({
  task,
  associates,
  onEdit,
  onDelete,
}: {
  task: Task
  associates: ReturnType<typeof useAppStore>["associates"]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab">
      <TaskCard task={task} associates={associates} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function DroppableColumn({
  id,
  title,
  tasks,
  associates,
  onEdit,
  onDelete,
}: {
  id: string
  title: string
  tasks: Task[]
  associates: ReturnType<typeof useAppStore>["associates"]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const visibleTasks = tasks.filter((t) => !t.title.startsWith("[DELETED]"))

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg bg-muted/50 p-4 transition-colors ${isOver ? "bg-primary/10 ring-2 ring-primary/50" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <Badge variant="secondary">{visibleTasks.length}</Badge>
      </div>
      <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[200px] space-y-2">
          {visibleTasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} associates={associates} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {visibleTasks.length === 0 && (
            <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { tasks, associates, milestones, moveTask, addTask, updateTask } = useAppStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterMilestone, setFilterMilestone] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    milestoneId: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
    status: "todo" as Task["status"],
  })

  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const projectMilestones = milestones.filter((m) => m.projectId === projectId)
  const projectAssociateIds = [...new Set(projectTasks.map((t) => t.assigneeId))]
  const projectAssociates = associates.filter((a) => projectAssociateIds.includes(a.id))

  const filteredTasks = projectTasks.filter((t) => {
    if (filterMilestone !== "all" && t.milestoneId !== filterMilestone) return false
    if (filterAssignee !== "all" && t.assigneeId !== filterAssignee) return false
    return true
  })

  const columns = [
    { id: "todo", title: "To Do", tasks: filteredTasks.filter((t) => t.status === "todo") },
    { id: "in-progress", title: "In Progress", tasks: filteredTasks.filter((t) => t.status === "in-progress") },
    { id: "done", title: "Done", tasks: filteredTasks.filter((t) => t.status === "done") },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped directly on a column
    const columnIds = ["todo", "in-progress", "done"]
    if (columnIds.includes(overId)) {
      const currentTask = projectTasks.find((t) => t.id === taskId)
      if (currentTask && currentTask.status !== overId) {
        moveTask(taskId, overId as Task["status"])
        const columnTitle = columns.find((c) => c.id === overId)?.title
        toast.success(`Task moved to ${columnTitle}`)
      }
      return
    }

    // Check if dropped on another task - move to that task's column
    const overTask = projectTasks.find((t) => t.id === overId)
    if (overTask) {
      const currentTask = projectTasks.find((t) => t.id === taskId)
      if (currentTask && currentTask.status !== overTask.status) {
        moveTask(taskId, overTask.status)
        const columnTitle = columns.find((c) => c.id === overTask.status)?.title
        toast.success(`Task moved to ${columnTitle}`)
      }
    }
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required")
      return
    }

    const task: Task = {
      id: `t${Date.now()}`,
      projectId,
      milestoneId: newTask.milestoneId || projectMilestones[0]?.id || "",
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId,
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
    }

    addTask(task)
    toast.success("Task created successfully")
    setAddDialogOpen(false)
    setNewTask({
      title: "",
      description: "",
      assigneeId: "",
      milestoneId: "",
      priority: "medium",
      dueDate: "",
      status: "todo",
    })
  }

  const handleEditTask = () => {
    if (!editingTask) return

    updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      assigneeId: editingTask.assigneeId,
      milestoneId: editingTask.milestoneId,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
    })

    toast.success("Task updated successfully")
    setEditDialogOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    // Remove from tasks by updating with empty (store doesn't have delete, so we'll use updateTask to mark it somehow)
    // For now, let's add a deleteTask action or just filter it out visually
    // Since store doesn't have deleteTask, we'll add it
    const taskToDelete = tasks.find((t) => t.id === taskId)
    if (taskToDelete) {
      // Move to a "deleted" status or just remove from view
      updateTask(taskId, { status: "done", title: `[DELETED] ${taskToDelete.title}` })
      toast.success("Task deleted")
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task })
    setEditDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Kanban className="h-5 w-5 text-primary" />
              Task Tracker
            </CardTitle>
            <CardDescription>Drag tasks between columns to update status</CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task for this project</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Milestone</Label>
                    <Select
                      value={newTask.milestoneId}
                      onValueChange={(value) => setNewTask({ ...newTask, milestoneId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select milestone" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectMilestones.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select
                      value={newTask.assigneeId}
                      onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {associates.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={a.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {a.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {a.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-muted-foreground" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-amber-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-destructive" />
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) => setNewTask({ ...newTask, status: value as Task["status"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <Select value={filterMilestone} onValueChange={setFilterMilestone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Milestones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Milestones</SelectItem>
              {projectMilestones.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {associates.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {a.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterMilestone !== "all" || filterAssignee !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterMilestone("all")
                setFilterAssignee("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                associates={associates}
                onEdit={openEditDialog}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} associates={associates} onEdit={() => {}} onDelete={() => {}} />}
          </DragOverlay>
        </DndContext>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Milestone</Label>
                  <Select
                    value={editingTask.milestoneId}
                    onValueChange={(value) => setEditingTask({ ...editingTask, milestoneId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select milestone" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectMilestones.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select
                    value={editingTask.assigneeId}
                    onValueChange={(value) => setEditingTask({ ...editingTask, assigneeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {associates.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={a.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {a.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {a.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Task["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-muted-foreground" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-amber-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-destructive" />
                          High
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
