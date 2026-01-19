// Revenue Tracker Types and Calculation Helpers

export interface ProjectAssignment {
  id: string
  projectId: string
  associateId: string
  role: string // e.g., "BA", "PM", "Analyst", "Developer"
  hourlyRate: number
  hoursPerDay: number // default 8
  startDate: string
  endDate: string
  // Overhead ramp-down model
  initialOverheadPerDay: number // default 200
  finalOverheadPerDay: number // default 50
  rampDays: number // default 20
}

export interface ProjectRevenue {
  id: string
  projectId: string
  contractValue: number
  startDate: string
  endDate: string
  status: "active" | "closed"
}

export interface AssociateSettings {
  associateId: string
  defaultHourlyRate: number
}

// Calculation helpers

export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // inclusive
}

export function calculateLaborCost(assignment: ProjectAssignment): number {
  const days = calculateDaysBetween(assignment.startDate, assignment.endDate)
  return assignment.hourlyRate * assignment.hoursPerDay * days
}

export function calculateDailyOverhead(
  day: number, // 1-indexed day of assignment
  initialOverhead: number,
  finalOverhead: number,
  rampDays: number,
): number {
  if (day >= rampDays) {
    return finalOverhead
  }
  // Linear decrease from initial to final over rampDays
  const decrease = ((initialOverhead - finalOverhead) / rampDays) * day
  return initialOverhead - decrease
}

export function calculateOverheadCost(assignment: ProjectAssignment): number {
  const days = calculateDaysBetween(assignment.startDate, assignment.endDate)
  let totalOverhead = 0

  for (let day = 1; day <= days; day++) {
    totalOverhead += calculateDailyOverhead(
      day,
      assignment.initialOverheadPerDay,
      assignment.finalOverheadPerDay,
      assignment.rampDays,
    )
  }

  return Math.round(totalOverhead * 100) / 100
}

export function calculateAssignmentTotalCost(assignment: ProjectAssignment): {
  laborCost: number
  overheadCost: number
  totalCost: number
  days: number
  totalHours: number
} {
  const days = calculateDaysBetween(assignment.startDate, assignment.endDate)
  const laborCost = calculateLaborCost(assignment)
  const overheadCost = calculateOverheadCost(assignment)
  const totalCost = laborCost + overheadCost
  const totalHours = assignment.hoursPerDay * days

  return {
    laborCost: Math.round(laborCost * 100) / 100,
    overheadCost: Math.round(overheadCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    days,
    totalHours,
  }
}

export interface ProjectRevenueCalculation {
  projectId: string
  revenue: number
  laborCost: number
  overheadCost: number
  totalCost: number
  grossMargin: number
  marginPercent: number
  assignmentCount: number
}

export function calculateProjectRevenue(
  projectRevenue: ProjectRevenue,
  assignments: ProjectAssignment[],
): ProjectRevenueCalculation {
  const projectAssignments = assignments.filter((a) => a.projectId === projectRevenue.projectId)

  let totalLaborCost = 0
  let totalOverheadCost = 0

  projectAssignments.forEach((assignment) => {
    const costs = calculateAssignmentTotalCost(assignment)
    totalLaborCost += costs.laborCost
    totalOverheadCost += costs.overheadCost
  })

  const totalCost = totalLaborCost + totalOverheadCost
  const grossMargin = projectRevenue.contractValue - totalCost
  const marginPercent = projectRevenue.contractValue > 0 ? (grossMargin / projectRevenue.contractValue) * 100 : 0

  return {
    projectId: projectRevenue.projectId,
    revenue: projectRevenue.contractValue,
    laborCost: Math.round(totalLaborCost * 100) / 100,
    overheadCost: Math.round(totalOverheadCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
    assignmentCount: projectAssignments.length,
  }
}

export interface AssociateRevenueCalculation {
  associateId: string
  projectsCount: number
  totalDays: number
  totalHours: number
  totalLaborCost: number
  totalOverheadCost: number
  totalCost: number
  avgCostPerDay: number
}

export function calculateAssociateRevenue(
  associateId: string,
  assignments: ProjectAssignment[],
): AssociateRevenueCalculation {
  const associateAssignments = assignments.filter((a) => a.associateId === associateId)

  let totalDays = 0
  let totalHours = 0
  let totalLaborCost = 0
  let totalOverheadCost = 0
  const projectIds = new Set<string>()

  associateAssignments.forEach((assignment) => {
    const costs = calculateAssignmentTotalCost(assignment)
    totalDays += costs.days
    totalHours += costs.totalHours
    totalLaborCost += costs.laborCost
    totalOverheadCost += costs.overheadCost
    projectIds.add(assignment.projectId)
  })

  const totalCost = totalLaborCost + totalOverheadCost
  const avgCostPerDay = totalDays > 0 ? totalCost / totalDays : 0

  return {
    associateId,
    projectsCount: projectIds.size,
    totalDays,
    totalHours,
    totalLaborCost: Math.round(totalLaborCost * 100) / 100,
    totalOverheadCost: Math.round(totalOverheadCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    avgCostPerDay: Math.round(avgCostPerDay * 100) / 100,
  }
}
