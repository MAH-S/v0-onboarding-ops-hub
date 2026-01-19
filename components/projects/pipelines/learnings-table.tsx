"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import type { Project } from "@/lib/mock-data"
import {
  type SortColumn,
  type SortDirection,
  getLearningsStepLabel,
  SortableHeader,
  ControlsButton,
  createSortHandler,
  healthOrder,
} from "../shared/project-table-utils"

interface LearningsTableProps {
  projects: Project[]
  onOpenControls: (e: React.MouseEvent, project: Project) => void
}

export function LearningsTable({ projects, onOpenControls }: LearningsTableProps) {
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
          case "owner":
            comparison = (a.owner || "").localeCompare(b.owner || "")
            break
          case "dueDate":
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            break
          case "learningsStep":
            comparison = (a.learningsStep || 0) - (b.learningsStep || 0)
            break
          case "lastUpdate":
            comparison = new Date(a.lastUpdate.date).getTime() - new Date(b.lastUpdate.date).getTime()
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
              column="learningsStep"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Learnings Step
            </SortableHeader>
            <SortableHeader column="owner" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Owner
            </SortableHeader>
            <SortableHeader column="dueDate" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
              Completion Date
            </SortableHeader>
            <TableHead className="font-semibold">Key Learnings</TableHead>
            <SortableHeader
              column="lastUpdate"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Last Update
            </SortableHeader>
            <TableHead className="font-semibold w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No projects in Learnings
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
                  <span className="text-sm">{getLearningsStepLabel(project.learningsStep)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{project.owner}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
                    {project.notes && project.notes.length > 0
                      ? project.notes[0].content.substring(0, 50) + "..."
                      : "No learnings documented yet"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span>{format(new Date(project.lastUpdate.date), "MMM d")}</span>
                    <p className="text-xs text-muted-foreground">{project.lastUpdate.user}</p>
                  </div>
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
