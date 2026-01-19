"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Calendar, Info, UserPlus, UserMinus, Users, Check } from "lucide-react"
import type { Project, Associate, Milestone, Task } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import { toast } from "sonner"

interface ProjectOverviewProps {
  project: Project
  associates: Associate[]
  milestones: Milestone[]
  tasks: Task[]
  canEdit?: boolean
}

export function ProjectOverview({ project, associates, milestones, tasks, canEdit = true }: ProjectOverviewProps) {
  const [manageTeamOpen, setManageTeamOpen] = useState(false)
  const allAssociates = useAppStore((state) => state.associates)
  const assignAssociateToProject = useAppStore((state) => state.assignAssociateToProject)
  const removeAssociateFromProject = useAppStore((state) => state.removeAssociateFromProject)

  const upcomingMilestones = milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  const assignedIds = project.assignedAssociates
  const unassignedAssociates = allAssociates.filter((a) => !assignedIds.includes(a.id))

  const handleAddMember = (associateId: string) => {
    const associate = allAssociates.find((a) => a.id === associateId)
    assignAssociateToProject(associateId, project.id)
    toast.success(`${associate?.name} added to the team`)
  }

  const handleRemoveMember = (associateId: string) => {
    const associate = allAssociates.find((a) => a.id === associateId)
    removeAssociateFromProject(associateId, project.id)
    toast.success(`${associate?.name} removed from the team`)
  }

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Assigned Team
            </CardTitle>
            <CardDescription>{associates.length} team members assigned</CardDescription>
          </div>
          {canEdit && (
            <Dialog open={manageTeamOpen} onOpenChange={setManageTeamOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle>Manage Project Team</DialogTitle>
                  <DialogDescription>Add or remove team members from {project.name}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-2 mt-4">
                  {/* Current Team */}
                  <div className="flex flex-col">
                    <h4 className="mb-3 font-medium flex items-center gap-2 text-base">
                      <Check className="h-5 w-5 text-green-500" />
                      Current Team ({associates.length})
                    </h4>
                    <ScrollArea className="h-[400px] rounded-md border p-3 flex-1">
                      {associates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No team members assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {associates.map((associate) => {
                            const associateTasks = tasks.filter((t) => t.assigneeId === associate.id)
                            const openTasks = associateTasks.filter((t) => t.status !== "done").length
                            return (
                              <div key={associate.id} className="rounded-lg border p-3 bg-muted/30 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                                    <AvatarFallback>
                                      {associate.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{associate.name}</p>
                                    <p className="text-sm text-muted-foreground">{associate.role}</p>
                                    <p className="text-xs text-muted-foreground">{openTasks} open tasks</p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 bg-transparent"
                                  onClick={() => handleRemoveMember(associate.id)}
                                >
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Remove from Team
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Available to Add */}
                  <div className="flex flex-col">
                    <h4 className="mb-3 font-medium flex items-center gap-2 text-base">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      Available to Add ({unassignedAssociates.length})
                    </h4>
                    <ScrollArea className="h-[400px] rounded-md border p-3 flex-1">
                      {unassignedAssociates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">All associates are assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {unassignedAssociates.map((associate) => (
                            <div
                              key={associate.id}
                              className="rounded-lg border p-3 hover:bg-muted/50 transition-colors space-y-3"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                                  <AvatarFallback>
                                    {associate.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{associate.name}</p>
                                  <p className="text-sm text-muted-foreground">{associate.role}</p>
                                  <Badge
                                    variant={
                                      associate.availability === "available"
                                        ? "default"
                                        : associate.availability === "busy"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className="text-xs mt-1"
                                  >
                                    {associate.availability || "available"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => handleAddMember(associate.id)}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add to Team
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
              {canEdit && (
                <Button variant="outline" className="mt-4 bg-transparent" disabled>
                  Link Board (Prototype)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
