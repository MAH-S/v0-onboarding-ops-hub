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
  getFinanceBadge,
  getExecutionStepLabel,
  SortableHeader,
  ControlsButton,
  createSortHandler,
  healthOrder,
  financeOrder,
} from "../shared/project-table-utils"

interface ExecutionTableProps {
  projects: Project[]
  onOpenControls: (e: React.MouseEvent, project: Project) => void
}

export function ExecutionTable({ projects, onOpenControls }: ExecutionTableProps) {
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
          case "health":
            comparison = healthOrder[a.health] - healthOrder[b.health]
            break
          case "owner":
            comparison = (a.owner || "").localeCompare(b.owner || "")
            break
          case "dueDate":
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            break
          case "executionStep":
            comparison = (a.executionStep || 0) - (b.executionStep || 0)
            break
          case "progress":
            comparison = a.milestonesProgress - b.milestonesProgress
            break
          case "finance":
            comparison = financeOrder[a.financeReadiness || "paid"] - financeOrder[b.financeReadiness || "paid"]
            break
          case "alerts":
            comparison = a.alerts.length - b.alerts.length
            break
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
    } else {
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
              column="executionStep"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Execution Step
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
            <SortableHeader column="progress" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Progress
            </SortableHeader>
            <SortableHeader column="finance" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Finance
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
              <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                No projects in Execution
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
                  <span className="text-sm">{getExecutionStepLabel(project.executionStep)}</span>
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
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${project.milestonesProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{project.milestonesProgress}%</span>
                  </div>
                </TableCell>
                <TableCell>{getFinanceBadge(project.financeReadiness)}</TableCell>
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
