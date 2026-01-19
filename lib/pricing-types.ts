// Time unit types for calculating days
export type TimeUnit = 'week' | 'month' | 'full'

// Task Assignee (person assigned to a task with their days for pricing)
export interface TaskAssignee {
  associateId: string
  days: number // Total days for this assignee (manual input or calculated)
  daysPerPeriod?: number // e.g., 2 days per week (used when task has timeUnit week/month)
}

// Task Pricing - links to actual project task
export interface TaskPricing {
  taskId: string // Links to Task.id from project
  // Time unit at task level - applies to all assignees on this task
  timeUnit: TimeUnit // 'week', 'month', or 'full'
  numberOfPeriods?: number // e.g., 8 weeks or 3 months (shared across all assignees)
  assignees: TaskAssignee[] // Multiple people can be assigned with days
}

// Milestone Pricing - links to actual project milestone
export interface MilestonePricing {
  milestoneId: string // Links to Milestone.id from project
  tasks: TaskPricing[]
}

// Legacy types for backward compatibility
export interface LineItemAssignee extends TaskAssignee {}

// Pricing Line Item (e.g., 1.1 Test, 1.2 Work)
export interface PricingLineItem {
  id: string
  number: string // e.g., "1.1", "1.2"
  name: string
  description?: string
  assignees: LineItemAssignee[] // Multiple people can be assigned
  startDate?: string
  endDate?: string
}

// Workstream (e.g., Workstream 1)
export interface PricingWorkstream {
  id: string
  number: number // e.g., 1, 2, 3
  name: string // e.g., "Workstream 1" - editable
  lineItems: PricingLineItem[]
}

// Phase (collection of workstreams)
export interface PricingPhase {
  id: string
  name: string
  workstreams: PricingWorkstream[]
}

// Associate Rate for pricing
export interface AssociateRate {
  associateId: string
  baseRate: number
  markedUpRate: number
}

// Expense Item
export interface ExpenseItem {
  associateId: string
  numberOfFlights?: number
  avgFlightCost?: number
  daysOnsite?: number
  accommodationPerDay?: number
  perDiemPerDay?: number
  expenseBuffer?: number
}

// Currency type
export type Currency = 'USD' | 'SAR' | 'AED'

export const CURRENCY_CONFIG: Record<Currency, { symbol: string, name: string, rate: number }> = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal', rate: 3.75 },
  AED: { symbol: 'AED', name: 'UAE Dirham', rate: 3.67 },
}

// Project Pricing
export interface ProjectPricing {
  projectId: string
  status: 'not-priced' | 'in-progress' | 'priced'
  // Linked to project milestones/tasks
  milestonePricing: MilestonePricing[]
  // Legacy phases support (for backwards compatibility)
  phases: PricingPhase[]
  // Associate rates
  associateRates: AssociateRate[]
  expenses: ExpenseItem[]
  // Global settings
  currency: Currency // USD, SAR, AED
  markupPercentage: number // e.g., 50 for 50%
  withholdingTaxPercentage: number // e.g., 5 for 5%
  defaultAccommodation: number // default per day
  defaultPerDiem: number // default per day
  createdAt: string
  updatedAt: string
}

// Helper to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// Calculate marked up rate
export function calculateMarkedUpRate(baseRate: number, markupPercentage: number): number {
  return baseRate * (1 + markupPercentage / 100)
}

// Calculate expense cost for an associate
export function calculateExpenseCost(expense: ExpenseItem): number {
  const flightCost = (expense.numberOfFlights || 0) * (expense.avgFlightCost || 0)
  const accommodationCost = (expense.daysOnsite || 0) * (expense.accommodationPerDay || 0)
  const perDiemCost = (expense.daysOnsite || 0) * (expense.perDiemPerDay || 0)
  return flightCost + accommodationCost + perDiemCost + (expense.expenseBuffer || 0)
}

// Calculate days for an assignee (legacy - for LineItemAssignee compatibility)
export function calculateAssigneeDays(assignee: LineItemAssignee): number {
  // Days are now calculated at task level and stored directly on assignee
  return assignee.days || 0
}

// Get total days for an associate across all phases/tasks (includes both legacy phases and milestone pricing)
export function getAssociateTotalDays(pricing: ProjectPricing, associateId: string): number {
  let totalDays = 0
  // From legacy phases
  pricing.phases.forEach(phase => {
    phase.workstreams.forEach(ws => {
      ws.lineItems.forEach(item => {
        const assignee = item.assignees.find(a => a.associateId === associateId)
        if (assignee) {
          totalDays += calculateAssigneeDays(assignee)
        }
      })
    })
  })
  // From milestone pricing (new structure)
  pricing.milestonePricing?.forEach(mp => {
    mp.tasks.forEach(tp => {
      const assignee = tp.assignees.find(a => a.associateId === associateId)
      if (assignee) {
        totalDays += assignee.days || 0
      }
    })
  })
  return totalDays
}

// Get all unique associates from all tasks
export function getAllAssignedAssociates(pricing: ProjectPricing): string[] {
  const associateIds = new Set<string>()
  // From legacy phases
  pricing.phases.forEach(phase => {
    phase.workstreams.forEach(ws => {
      ws.lineItems.forEach(item => {
        item.assignees.forEach(a => associateIds.add(a.associateId))
      })
    })
  })
  // From milestone pricing
  pricing.milestonePricing?.forEach(mp => {
    mp.tasks.forEach(tp => {
      tp.assignees.forEach(a => associateIds.add(a.associateId))
    })
  })
  return Array.from(associateIds)
}

// Get total days for milestone pricing
export function getMilestoneTotalDays(pricing: ProjectPricing, associateId: string): number {
  let totalDays = 0
  pricing.milestonePricing?.forEach(mp => {
    mp.tasks.forEach(tp => {
      const assignee = tp.assignees.find(a => a.associateId === associateId)
      if (assignee) {
        totalDays += calculateAssigneeDays(assignee)
      }
    })
  })
  return totalDays
}

// Get task pricing for a specific task
export function getTaskPricing(pricing: ProjectPricing, milestoneId: string, taskId: string): TaskPricing | undefined {
  const mp = pricing.milestonePricing?.find(m => m.milestoneId === milestoneId)
  return mp?.tasks.find(t => t.taskId === taskId)
}

// Get assignee from task pricing
export function getTaskAssignee(pricing: ProjectPricing, milestoneId: string, taskId: string, associateId: string): TaskAssignee | undefined {
  const taskPricing = getTaskPricing(pricing, milestoneId, taskId)
  return taskPricing?.assignees.find(a => a.associateId === associateId)
}
