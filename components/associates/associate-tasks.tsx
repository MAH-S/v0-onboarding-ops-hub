"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { ListTodo, Calendar, Clock } from "lucide-react"
import type { Task } from "@/lib/mock-data"
import Link from "next/link"

interface AssociateTasksProps {
  tasks: Task[]
}

export function AssociateTasks({ tasks }: AssociateTasksProps) {
  const { milestones, projects } = useAppStore()

  // Group tasks by milestone
  const tasksByMilestone = tasks.reduce(
    (acc, task) => {
      const milestoneId = task.milestoneId
      if (!acc[milestoneId]) {
        acc[milestoneId] = []
      }
      acc[milestoneId].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  const remainingTasks = tasks.filter((t) => t.status !== "done").length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive"
      case "medium":
        return "bg-warning/10 text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "done":
        return "default"
      case "in-progress":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          Tasks
        </CardTitle>
        <CardDescription>
          {remainingTasks} task{remainingTasks !== 1 ? "s" : ""} remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(tasksByMilestone).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(tasksByMilestone).map(([milestoneId, milestoneTasks]) => {
              const milestone = milestones.find((m) => m.id === milestoneId)
              const project = projects.find((p) => p.id === milestone?.projectId)
              const completedCount = milestoneTasks.filter((t) => t.status === "done").length

              return (
                <div key={milestoneId} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{milestone?.title || "Unknown Milestone"}</h4>
                      {project && (
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {project.name}
                        </Link>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {completedCount}/{milestoneTasks.length} done
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {milestoneTasks.map((task) => {
                      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done"

                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </span>
                            <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                            >
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.cycleTime && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {task.cycleTime}d
                              </span>
                            )}
                            <Badge variant={getStatusVariant(task.status)} className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No tasks assigned</div>
        )}
      </CardContent>
    </Card>
  )
}
