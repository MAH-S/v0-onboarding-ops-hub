"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCopilotStore, type CopilotScope } from "@/lib/copilot-store"
import { useAppStore } from "@/lib/store"
import { FolderKanban, ListTodo, FileText, Globe, Calendar, Users } from "lucide-react"

export function CopilotContextCard() {
  const { context, setScope } = useCopilotStore()
  const { associates } = useAppStore()

  const getIcon = () => {
    switch (context.scope) {
      case "project":
        return <FolderKanban className="h-4 w-4" />
      case "task":
        return <ListTodo className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getScopeLabel = () => {
    switch (context.scope) {
      case "project":
        return "This Project"
      case "task":
        return "This Task"
      case "document":
        return "This Document"
      default:
        return "Global"
    }
  }

  const getHealthBadgeVariant = (health?: string) => {
    switch (health) {
      case "critical-risk":
        return "destructive"
      case "at-risk":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getHealthLabel = (health?: string) => {
    switch (health) {
      case "on-track":
        return "On Track"
      case "at-risk":
        return "At Risk"
      case "critical-risk":
        return "Critical Risk"
      default:
        return "Unknown"
    }
  }

  const renderContextDetails = () => {
    if (context.scope === "project" && context.project) {
      const project = context.project
      const projectAssociates = associates.filter((a) => project.assignedAssociates.includes(a.id))
      const endDate = new Date("2026-02-28") // Mock end date
      const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{project.name}</span>
            <Badge variant={getHealthBadgeVariant(project.health)}>{getHealthLabel(project.health)}</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining}d remaining
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {projectAssociates.length} associates
            </span>
          </div>
          <div className="flex items-center gap-1">
            {projectAssociates.slice(0, 3).map((a) => (
              <Avatar key={a.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={a.avatar || "/placeholder.svg"} alt={a.name} />
                <AvatarFallback className="text-xs">
                  {a.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {projectAssociates.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">+{projectAssociates.length - 3}</span>
            )}
          </div>
        </div>
      )
    }

    if (context.scope === "task" && context.task) {
      const task = context.task
      const assignee = associates.find((a) => a.id === task.assigneeId)
      const milestone = context.milestone

      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{task.title}</span>
            <Badge
              variant={task.status === "done" ? "default" : task.status === "in-progress" ? "secondary" : "outline"}
            >
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {assignee && (
              <span className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                  <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                </Avatar>
                {assignee.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
          {milestone && <p className="text-xs text-muted-foreground">Milestone: {milestone.title}</p>}
        </div>
      )
    }

    if (context.scope === "document" && context.document) {
      const doc = context.document

      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate max-w-[200px]">{doc.fileName}</span>
            <Badge
              variant={doc.status === "Approved" ? "default" : doc.status === "Rejected" ? "destructive" : "secondary"}
            >
              {doc.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Type: {doc.type}</span>
            <span>Vendor: {doc.vendor}</span>
            <span>Amount: ${doc.amount.toLocaleString()}</span>
            <span>Uploaded: {new Date(doc.date).toLocaleDateString()}</span>
          </div>
        </div>
      )
    }

    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Copilot is looking at all projects, tasks, and documents across the platform.
      </p>
    )
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Context</span>
          <Select value={context.scope} onValueChange={(v) => setScope(v as CopilotScope)}>
            <SelectTrigger className="w-[140px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <span className="flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Global
                </span>
              </SelectItem>
              {context.project && (
                <SelectItem value="project">
                  <span className="flex items-center gap-2">
                    <FolderKanban className="h-3 w-3" /> This Project
                  </span>
                </SelectItem>
              )}
              {context.task && (
                <SelectItem value="task">
                  <span className="flex items-center gap-2">
                    <ListTodo className="h-3 w-3" /> This Task
                  </span>
                </SelectItem>
              )}
              {context.document && (
                <SelectItem value="document">
                  <span className="flex items-center gap-2">
                    <FileText className="h-3 w-3" /> This Document
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {renderContextDetails()}
      </CardContent>
    </Card>
  )
}
