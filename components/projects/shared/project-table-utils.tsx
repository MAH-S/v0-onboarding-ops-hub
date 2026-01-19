"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
} from "lucide-react"
import {
  ONBOARDING_STEPS,
  NEW_BUSINESS_STEPS,
  EXECUTION_STEPS,
  CLOSURE_STEPS,
  LEARNINGS_STEPS,
  type Project,
  type ProjectHealth,
} from "@/lib/mock-data"

// Types
export type SortColumn =
  | "name"
  | "client"
  | "health"
  | "owner"
  | "dueDate"
  | "onboardingStep"
  | "newBusinessStep"
  | "executionStep"
  | "closureStep"
  | "learningsStep"
  | "lastUpdate"
  | "finance"
  | "alerts"
  | "progress"

export type SortDirection = "asc" | "desc" | null

// Health badge component
export const getHealthBadge = (health: ProjectHealth) => {
  switch (health) {
    case "on-track":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          On Track
        </Badge>
      )
    case "at-risk":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-0">
          <AlertTriangle className="mr-1 h-3 w-3" />
          At Risk
        </Badge>
      )
    case "critical-risk":
      return (
        <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-0">
          <AlertCircle className="mr-1 h-3 w-3" />
          Critical Risk
        </Badge>
      )
  }
}

// Finance badge component
export const getFinanceBadge = (status: Project["financeReadiness"]) => {
  switch (status) {
    case "quote":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          <FileText className="mr-1 h-3 w-3" />
          Quote
        </Badge>
      )
    case "invoice":
      return (
        <Badge variant="outline" className="text-purple-600 border-purple-300">
          <DollarSign className="mr-1 h-3 w-3" />
          Invoice
        </Badge>
      )
    case "overdue":
      return (
        <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-0">
          <Clock className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      )
    case "paid":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      )
  }
}

// Step label helpers
export const getOnboardingStepLabel = (step?: number) => {
  if (!step) return "—"
  const found = ONBOARDING_STEPS.find((s) => s.step === step)
  return found ? `${step}: ${found.label}` : `Step ${step}`
}

export const getNewBusinessStepLabel = (step?: number) => {
  if (!step) return "—"
  const found = NEW_BUSINESS_STEPS.find((s) => s.step === step)
  return found ? `${step}: ${found.label}` : `Step ${step}`
}

export const getExecutionStepLabel = (step?: number) => {
  if (!step) return "—"
  const found = EXECUTION_STEPS.find((s) => s.step === step)
  return found ? `${step}: ${found.label}` : `Step ${step}`
}

export const getClosureStepLabel = (step?: number) => {
  if (!step) return "—"
  const found = CLOSURE_STEPS.find((s) => s.step === step)
  return found ? `${step}: ${found.label}` : `Step ${step}`
}

export const getLearningsStepLabel = (step?: number) => {
  if (!step) return "—"
  const found = LEARNINGS_STEPS.find((s) => s.step === step)
  return found ? `${step}: ${found.label}` : `Step ${step}`
}

// Sort icon helper
export const getSortIcon = (column: SortColumn, sortColumn: SortColumn | null, sortDirection: SortDirection) => {
  if (sortColumn !== column) {
    return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
  }
  if (sortDirection === "asc") {
    return <ArrowUp className="ml-1 h-3 w-3 text-primary" />
  }
  if (sortDirection === "desc") {
    return <ArrowDown className="ml-1 h-3 w-3 text-primary" />
  }
  return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
}

// Sortable header component
export const SortableHeader = ({
  column,
  children,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: SortColumn
  children: React.ReactNode
  sortColumn: SortColumn | null
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
}) => (
  <TableHead
    className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors select-none"
    onClick={() => onSort(column)}
  >
    <div className="flex items-center">
      {children}
      {getSortIcon(column, sortColumn, sortDirection)}
    </div>
  </TableHead>
)

// Controls button component
export const ControlsButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void
}) => (
  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}>
    <Settings2 className="h-4 w-4" />
    <span className="sr-only">Controls</span>
  </Button>
)

// Sort handler helper
export const createSortHandler = (
  sortColumn: SortColumn | null,
  sortDirection: SortDirection,
  setSortColumn: (column: SortColumn | null) => void,
  setSortDirection: (direction: SortDirection) => void,
) => {
  return (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }
}

// Health order for sorting
export const healthOrder: Record<ProjectHealth, number> = {
  "critical-risk": 0,
  "at-risk": 1,
  "on-track": 2,
}

// Finance order for sorting
export const financeOrder: Record<string, number> = {
  overdue: 0,
  quote: 1,
  invoice: 2,
  paid: 3,
}
