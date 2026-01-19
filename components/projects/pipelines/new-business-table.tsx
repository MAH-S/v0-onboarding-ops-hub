"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "@/lib/mock-data"
import {
  type SortColumn,
  type SortDirection,
  getHealthBadge,
  getNewBusinessStepLabel,
  SortableHeader,
  ControlsButton,
  createSortHandler,
  healthOrder,
} from "../shared/project-table-utils"

interface NewBusinessTableProps {
  projects: Project[]
  onOpenControls: (e: React.MouseEvent, project: Project) => void
}

export function NewBusinessTable({ projects, onOpenControls }: NewBusinessTableProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = createSortHandler(sortColumn, sortDirection, setSortColumn, setSortDirection)

  const sortedProjects = useMemo(() => {
    const filtered = [...projects]

    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
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
          case "newBusinessStep":
            comparison = (a.newBusinessStep || 0) - (b.newBusinessStep || 0)
            break
          case "lastUpdate":
            comparison = new Date(a.lastUpdate.date).getTime() - new Date(b.lastUpdate.date).getTime()
            break
          case "alerts":
            comparison = a.alerts.length - b.alerts.length
            break
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
    } else {
      // Default sort by health
      filtered.sort((a, b) => healthOrder[a.health] - healthOrder[b.health])
    }

    return filtered
  }, [projects, sortColumn, sortDirection])

  const handleRowClick = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <SortableHeader column="name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Project / Client
            </SortableHeader>
            <SortableHeader
              column="newBusinessStep"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Acquisition Step
            </SortableHeader>
            <SortableHeader column="health" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Health
            </SortableHeader>
            <SortableHeader column="owner" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Owner
            </SortableHeader>
            <TableHead className="font-semibold">Next Action</TableHead>
            <SortableHeader column="dueDate" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Due Date
            </SortableHeader>
            <SortableHeader
              column="lastUpdate"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Last Update
            </SortableHeader>
            <SortableHeader column="alerts" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Alerts
            </SortableHeader>
            <TableHead className="font-semibold w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                No projects in New Business Acquisition
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
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
                  <span className="text-sm">{getNewBusinessStepLabel(project.newBusinessStep)}</span>
                </TableCell>
                <TableCell>{getHealthBadge(project.health)}</TableCell>
                <TableCell>
                  <span className="text-sm">{project.owner}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{project.nextAction}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm ${new Date(project.dueDate) < new Date() ? "text-red-600 font-medium" : ""}`}
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
                  <ControlsButton onClick={(e) => onOpenControls(e, project)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
