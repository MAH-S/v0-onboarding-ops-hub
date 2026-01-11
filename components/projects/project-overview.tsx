"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Info } from "lucide-react"
import type { Project, Associate, Milestone, Task } from "@/lib/mock-data"
import Link from "next/link"

interface ProjectOverviewProps {
  project: Project
  associates: Associate[]
  milestones: Milestone[]
  tasks: Task[]
}

export function ProjectOverview({ project, associates, milestones, tasks }: ProjectOverviewProps) {
  const upcomingMilestones = milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Project Summary
          </CardTitle>
          <CardDescription>Overview of project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{project.client}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary" className="mt-1">
                {project.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Cycle Time</p>
              <p className="font-medium">{project.avgCycleTime} days</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Overall Progress</p>
            <div className="flex items-center gap-3">
              <Progress value={project.milestonesProgress} className="h-2 flex-1" />
              <span className="text-sm font-medium">{project.milestonesProgress}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Team</CardTitle>
          <CardDescription>{associates.length} team members assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {associates.map((associate) => {
              const associateTasks = tasks.filter((t) => t.assigneeId === associate.id)
              const openTasks = associateTasks.filter((t) => t.status !== "done").length
              return (
                <Link
                  key={associate.id}
                  href={`/associates/${associate.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                      <AvatarFallback>
                        {associate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{associate.name}</p>
                      <p className="text-xs text-muted-foreground">{associate.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{openTasks} tasks</p>
                    <p className="text-xs text-muted-foreground">remaining</p>
                  </div>
                </Link>
              )
            })}
            {associates.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No team members assigned yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Milestones
          </CardTitle>
          <CardDescription>Next milestones in timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMilestones.map((milestone) => {
              const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"
              return (
                <div key={milestone.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      {isOverdue && " (Overdue)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={milestone.completion} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">{milestone.completion}%</span>
                  </div>
                </div>
              )
            })}
            {upcomingMilestones.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No upcoming milestones</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Linked monday.com Board
          </CardTitle>
          <CardDescription>External project board integration</CardDescription>
        </CardHeader>
        <CardContent>
          {project.mondayBoardLink ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Board URL</p>
                <p className="truncate font-mono text-sm">{project.mondayBoardLink}</p>
              </div>
              <Button asChild className="w-full">
                <a href={project.mondayBoardLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in monday.com
                </a>
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No monday.com board linked</p>
              <Button variant="outline" className="mt-4 bg-transparent" disabled>
                Link Board (Prototype)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
