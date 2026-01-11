"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderKanban } from "lucide-react"
import type { Project } from "@/lib/mock-data"
import Link from "next/link"

interface AssociateProjectsProps {
  projects: Project[]
}

export function AssociateProjects({ projects }: AssociateProjectsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Onboarding":
        return "secondary"
      case "Execution":
        return "default"
      case "Blocked":
        return "destructive"
      case "Closed":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          Assigned Projects
        </CardTitle>
        <CardDescription>{projects.length} projects assigned</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
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
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.client}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
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
        ) : (
          <div className="py-8 text-center text-muted-foreground">No projects assigned</div>
        )}
      </CardContent>
    </Card>
  )
}
