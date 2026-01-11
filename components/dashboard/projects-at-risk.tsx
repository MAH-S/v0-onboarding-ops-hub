"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export function ProjectsAtRisk() {
  const { projects, milestones, tasks } = useAppStore()

  const riskyProjects = projects.filter((p) => {
    const projectMilestones = milestones.filter((m) => m.projectId === p.id)
    const hasOverdueMilestones = projectMilestones.some(
      (m) => new Date(m.dueDate) < new Date() && m.status !== "completed",
    )
    const projectTasks = tasks.filter((t) => t.projectId === p.id)
    const pendingTasks = projectTasks.filter((t) => t.status !== "done").length
    return p.status !== "Closed" && (hasOverdueMilestones || pendingTasks > 10 || p.status === "Blocked")
  })

  if (riskyProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Projects at Risk
          </CardTitle>
          <CardDescription>Projects with overdue milestones or high pending tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">No projects at risk</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Projects at Risk
        </CardTitle>
        <CardDescription>Projects with overdue milestones or high pending tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Open Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskyProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.client}</TableCell>
                <TableCell>
                  <Badge variant={project.status === "Blocked" ? "destructive" : "secondary"}>{project.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.milestonesProgress} className="h-2 w-20" />
                    <span className="text-xs text-muted-foreground">{project.milestonesProgress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{project.openTasks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
