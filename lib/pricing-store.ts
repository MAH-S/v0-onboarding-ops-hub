import { create } from 'zustand'
import { 
  ProjectPricing, 
  PricingPhase, 
  PricingWorkstream, 
  PricingLineItem,
  AssociateRate,
  ExpenseItem,
  LineItemAssignee,
  Currency,
  TimeUnit,
  generateId,
  calculateMarkedUpRate 
} from './pricing-types'

interface PricingStore {
  projectPricings: ProjectPricing[]
  
  // Get pricing for a project
  getProjectPricing: (projectId: string) => ProjectPricing | undefined
  
  // Initialize pricing for a project
  initProjectPricing: (projectId: string) => void
  
  // Phase actions
  addPhase: (projectId: string, phaseName: string) => void
  updatePhase: (projectId: string, phaseId: string, name: string) => void
  deletePhase: (projectId: string, phaseId: string) => void
  
  // Workstream actions
  addWorkstream: (projectId: string, phaseId: string) => void
  updateWorkstream: (projectId: string, phaseId: string, workstreamId: string, name: string) => void
  deleteWorkstream: (projectId: string, phaseId: string, workstreamId: string) => void
  
  // Line item actions
  addLineItem: (projectId: string, phaseId: string, workstreamId: string) => void
  updateLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, updates: Partial<PricingLineItem>) => void
  deleteLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string) => void
  
  // Assignee actions
  addAssigneeToLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, associateId: string) => void
  updateAssigneeDays: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, associateId: string, days: number) => void
  updateAssigneeTimeUnit: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, associateId: string, updates: { timeUnit?: TimeUnit, daysPerPeriod?: number, numberOfPeriods?: number }) => void
  removeAssigneeFromLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, associateId: string) => void
  
  // Milestone pricing actions (linked to project)
  addTaskAssignee: (projectId: string, milestoneId: string, taskId: string, associateId: string) => void
  updateTaskAssignee: (projectId: string, milestoneId: string, taskId: string, associateId: string, updates: { days?: number, daysPerPeriod?: number }) => void
  updateTaskSettings: (projectId: string, milestoneId: string, taskId: string, settings: { timeUnit?: TimeUnit, numberOfPeriods?: number }) => void
  removeTaskAssignee: (projectId: string, milestoneId: string, taskId: string, associateId: string) => void
  
  // Associate rate actions
  setAssociateRate: (projectId: string, associateId: string, baseRate: number) => void
  setAssociateMarkedUpRate: (projectId: string, associateId: string, markedUpRate: number) => void
  removeAssociateRate: (projectId: string, associateId: string) => void
  
  // Expense actions
  updateExpense: (projectId: string, associateId: string, updates: Partial<ExpenseItem>) => void
  addAssociateExpense: (projectId: string, associateId: string) => void
  removeAssociateExpense: (projectId: string, associateId: string) => void
  
  // Settings
  updatePricingSettings: (projectId: string, settings: { currency?: Currency, markupPercentage?: number, withholdingTaxPercentage?: number, defaultAccommodation?: number, defaultPerDiem?: number }) => void
  
  // Update pricing status
  updatePricingStatus: (projectId: string, status: ProjectPricing['status']) => void
}

// Sample pricing data for p1 (Acme Corp Onboarding)
const samplePricingData: ProjectPricing = {
  projectId: 'p1',
  status: 'priced',
  currency: 'USD',
  markupPercentage: 50,
  withholdingTaxPercentage: 5,
  defaultAccommodation: 275,
  defaultPerDiem: 80,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-18T00:00:00.000Z',
  // Milestone pricing - linked to actual project milestones/tasks
  milestonePricing: [
    {
      milestoneId: 'm1-p1', // Phase 1: Discovery & Planning
      tasks: [
        { taskId: 't1-m1', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a1', days: 4, daysPerPeriod: 2 }, { associateId: 'a4', days: 2, daysPerPeriod: 1 }] },
        { taskId: 't2-m1', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a2', days: 8, daysPerPeriod: 4 }, { associateId: 'a5', days: 4, daysPerPeriod: 2 }] },
        { taskId: 't3-m1', timeUnit: 'full', assignees: [{ associateId: 'a1', days: 4 }, { associateId: 'a3', days: 6 }] },
        { taskId: 't4-m1', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a6', days: 10, daysPerPeriod: 5 }, { associateId: 'a9', days: 8, daysPerPeriod: 4 }] },
        { taskId: 't5-m1', timeUnit: 'full', assignees: [{ associateId: 'a6', days: 6 }, { associateId: 'a12', days: 10 }] },
      ]
    },
    {
      milestoneId: 'm2-p1', // Phase 2: Implementation
      tasks: [
        { taskId: 't1-m2', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a6', days: 8, daysPerPeriod: 4 }, { associateId: 'a9', days: 10, daysPerPeriod: 5 }] },
        { taskId: 't2-m2', timeUnit: 'month', numberOfPeriods: 1, assignees: [{ associateId: 'a9', days: 15, daysPerPeriod: 15 }, { associateId: 'a12', days: 12, daysPerPeriod: 12 }] },
        { taskId: 't3-m2', timeUnit: 'month', numberOfPeriods: 1, assignees: [{ associateId: 'a6', days: 20, daysPerPeriod: 20 }, { associateId: 'a14', days: 15, daysPerPeriod: 15 }] },
        { taskId: 't4-m2', timeUnit: 'full', assignees: [{ associateId: 'a2', days: 8 }, { associateId: 'a8', days: 6 }] },
        { taskId: 't5-m2', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a2', days: 8, daysPerPeriod: 4 }, { associateId: 'a5', days: 6, daysPerPeriod: 3 }, { associateId: 'a8', days: 8, daysPerPeriod: 4 }] },
      ]
    },
    {
      milestoneId: 'm3-p1', // Phase 3: Go-Live & Support
      tasks: [
        { taskId: 't1-m3', timeUnit: 'week', numberOfPeriods: 2, assignees: [{ associateId: 'a1', days: 8, daysPerPeriod: 4 }, { associateId: 'a6', days: 10, daysPerPeriod: 5 }, { associateId: 'a9', days: 8, daysPerPeriod: 4 }] },
        { taskId: 't2-m3', timeUnit: 'full', assignees: [{ associateId: 'a4', days: 5 }, { associateId: 'a6', days: 5 }, { associateId: 'a12', days: 5 }] },
        { taskId: 't3-m3', timeUnit: 'month', numberOfPeriods: 1, assignees: [{ associateId: 'a3', days: 10, daysPerPeriod: 10 }, { associateId: 'a5', days: 8, daysPerPeriod: 8 }, { associateId: 'a8', days: 12, daysPerPeriod: 12 }] },
        { taskId: 't4-m3', timeUnit: 'full', assignees: [{ associateId: 'a2', days: 8 }, { associateId: 'a4', days: 4 }] },
      ]
    }
  ],
  phases: [
    {
      id: 'phase-1',
      name: 'Phase 1: Discovery & Planning',
      workstreams: [
        {
          id: 'ws-1-1',
          number: 1,
          name: 'Stakeholder Analysis',
          lineItems: [
            {
              id: 'li-1-1-1',
              number: '1.1',
              name: 'Executive Interviews',
              startDate: '2026-01-20',
              endDate: '2026-01-31',
              assignees: [
                { associateId: 'a1', days: 5 },
                { associateId: 'a4', days: 3 }
              ]
            },
            {
              id: 'li-1-1-2',
              number: '1.2',
              name: 'Requirements Documentation',
              startDate: '2026-02-01',
              endDate: '2026-02-10',
              assignees: [
                { associateId: 'a2', days: 8 },
                { associateId: 'a5', days: 4 }
              ]
            },
            {
              id: 'li-1-1-3',
              number: '1.3',
              name: 'Gap Analysis Report',
              startDate: '2026-02-11',
              endDate: '2026-02-18',
              assignees: [
                { associateId: 'a1', days: 4 },
                { associateId: 'a3', days: 6 }
              ]
            }
          ]
        },
        {
          id: 'ws-1-2',
          number: 2,
          name: 'Technical Assessment',
          lineItems: [
            {
              id: 'li-1-2-1',
              number: '2.1',
              name: 'Infrastructure Review',
              startDate: '2026-02-03',
              endDate: '2026-02-14',
              assignees: [
                { associateId: 'a6', days: 10 },
                { associateId: 'a9', days: 8 }
              ]
            },
            {
              id: 'li-1-2-2',
              number: '2.2',
              name: 'Integration Mapping',
              startDate: '2026-02-10',
              endDate: '2026-02-21',
              assignees: [
                { associateId: 'a6', days: 6 },
                { associateId: 'a12', days: 10 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'Phase 2: Implementation',
      workstreams: [
        {
          id: 'ws-2-1',
          number: 1,
          name: 'Core System Setup',
          lineItems: [
            {
              id: 'li-2-1-1',
              number: '1.1',
              name: 'Environment Configuration',
              startDate: '2026-02-24',
              endDate: '2026-03-07',
              assignees: [
                { associateId: 'a6', days: 8 },
                { associateId: 'a9', days: 10 }
              ]
            },
            {
              id: 'li-2-1-2',
              number: '1.2',
              name: 'Data Migration - Phase 1',
              startDate: '2026-03-03',
              endDate: '2026-03-21',
              assignees: [
                { associateId: 'a9', days: 15 },
                { associateId: 'a12', days: 12 }
              ]
            },
            {
              id: 'li-2-1-3',
              number: '1.3',
              name: 'Custom Module Development',
              startDate: '2026-03-10',
              endDate: '2026-04-04',
              assignees: [
                { associateId: 'a6', days: 20 },
                { associateId: 'a14', days: 15 }
              ]
            }
          ]
        },
        {
          id: 'ws-2-2',
          number: 2,
          name: 'User Training',
          lineItems: [
            {
              id: 'li-2-2-1',
              number: '2.1',
              name: 'Training Material Development',
              startDate: '2026-03-17',
              endDate: '2026-03-28',
              assignees: [
                { associateId: 'a2', days: 8 },
                { associateId: 'a8', days: 6 }
              ]
            },
            {
              id: 'li-2-2-2',
              number: '2.2',
              name: 'End User Training Sessions',
              startDate: '2026-04-01',
              endDate: '2026-04-11',
              assignees: [
                { associateId: 'a2', days: 8 },
                { associateId: 'a5', days: 6 },
                { associateId: 'a8', days: 8 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Phase 3: Go-Live & Support',
      workstreams: [
        {
          id: 'ws-3-1',
          number: 1,
          name: 'Production Deployment',
          lineItems: [
            {
              id: 'li-3-1-1',
              number: '1.1',
              name: 'UAT Support',
              startDate: '2026-04-14',
              endDate: '2026-04-25',
              assignees: [
                { associateId: 'a1', days: 8 },
                { associateId: 'a6', days: 10 },
                { associateId: 'a9', days: 8 }
              ]
            },
            {
              id: 'li-3-1-2',
              number: '1.2',
              name: 'Go-Live Execution',
              startDate: '2026-04-28',
              endDate: '2026-05-02',
              assignees: [
                { associateId: 'a4', days: 5 },
                { associateId: 'a6', days: 5 },
                { associateId: 'a12', days: 5 }
              ]
            }
          ]
        },
        {
          id: 'ws-3-2',
          number: 2,
          name: 'Hypercare',
          lineItems: [
            {
              id: 'li-3-2-1',
              number: '2.1',
              name: 'Post Go-Live Support',
              startDate: '2026-05-05',
              endDate: '2026-05-23',
              assignees: [
                { associateId: 'a3', days: 10 },
                { associateId: 'a5', days: 8 },
                { associateId: 'a8', days: 12 }
              ]
            },
            {
              id: 'li-3-2-2',
              number: '2.2',
              name: 'Documentation & Handover',
              startDate: '2026-05-19',
              endDate: '2026-05-30',
              assignees: [
                { associateId: 'a2', days: 8 },
                { associateId: 'a4', days: 4 }
              ]
            }
          ]
        }
      ]
    }
  ],
  associateRates: [
    { associateId: 'a1', baseRate: 1200, markedUpRate: 1800 },
    { associateId: 'a2', baseRate: 900, markedUpRate: 1350 },
    { associateId: 'a3', baseRate: 850, markedUpRate: 1275 },
    { associateId: 'a4', baseRate: 1100, markedUpRate: 1650 },
    { associateId: 'a5', baseRate: 750, markedUpRate: 1125 },
    { associateId: 'a6', baseRate: 1000, markedUpRate: 1500 },
    { associateId: 'a8', baseRate: 700, markedUpRate: 1050 },
    { associateId: 'a9', baseRate: 950, markedUpRate: 1425 },
    { associateId: 'a12', baseRate: 1050, markedUpRate: 1575 },
    { associateId: 'a14', baseRate: 800, markedUpRate: 1200 }
  ],
  expenses: [
    { associateId: 'a1', numberOfFlights: 2, avgFlightCost: 850, daysOnsite: 8, accommodationPerDay: 275, perDiemPerDay: 80 },
    { associateId: 'a2', numberOfFlights: 3, avgFlightCost: 750, daysOnsite: 12, accommodationPerDay: 275, perDiemPerDay: 80 },
    { associateId: 'a4', numberOfFlights: 2, avgFlightCost: 900, daysOnsite: 6, accommodationPerDay: 275, perDiemPerDay: 80 },
    { associateId: 'a6', numberOfFlights: 4, avgFlightCost: 800, daysOnsite: 20, accommodationPerDay: 275, perDiemPerDay: 80 },
    { associateId: 'a9', numberOfFlights: 3, avgFlightCost: 1200, daysOnsite: 15, accommodationPerDay: 275, perDiemPerDay: 80 },
    { associateId: 'a12', numberOfFlights: 2, avgFlightCost: 950, daysOnsite: 10, accommodationPerDay: 275, perDiemPerDay: 80 }
  ]
}

export const usePricingStore = create<PricingStore>((set, get) => ({
  projectPricings: [samplePricingData],
  
  getProjectPricing: (projectId: string) => {
    return get().projectPricings.find(p => p.projectId === projectId)
  },
  
  initProjectPricing: (projectId: string) => {
    const existing = get().projectPricings.find(p => p.projectId === projectId)
    if (existing) return
    
    const newPricing: ProjectPricing = {
      projectId,
      status: 'not-priced',
      milestonePricing: [],
      phases: [],
      associateRates: [],
      expenses: [],
      currency: 'USD',
      markupPercentage: 50,
      withholdingTaxPercentage: 5,
      defaultAccommodation: 275,
      defaultPerDiem: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set(state => ({
      projectPricings: [...state.projectPricings, newPricing]
    }))
  },
  
  addPhase: (projectId: string, phaseName: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        const phaseId = generateId()
        const newPhase: PricingPhase = {
          id: phaseId,
          name: phaseName,
          workstreams: [{
            id: generateId(),
            number: 1,
            name: 'Workstream 1',
            lineItems: []
          }]
        }
        
        return {
          ...p,
          status: 'in-progress' as const,
          phases: [...p.phases, newPhase],
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updatePhase: (projectId: string, phaseId: string, name: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => 
            phase.id === phaseId ? { ...phase, name } : phase
          ),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  deletePhase: (projectId: string, phaseId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        const newPhases = p.phases.filter(phase => phase.id !== phaseId)
        return {
          ...p,
          status: newPhases.length === 0 ? 'not-priced' : p.status,
          phases: newPhases,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  addWorkstream: (projectId: string, phaseId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            const nextNumber = phase.workstreams.length + 1
            const newWorkstream: PricingWorkstream = {
              id: generateId(),
              number: nextNumber,
              name: `Workstream ${nextNumber}`,
              lineItems: []
            }
            return {
              ...phase,
              workstreams: [...phase.workstreams, newWorkstream]
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updateWorkstream: (projectId: string, phaseId: string, workstreamId: string, name: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws =>
                ws.id === workstreamId ? { ...ws, name } : ws
              )
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  deleteWorkstream: (projectId: string, phaseId: string, workstreamId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            const filtered = phase.workstreams.filter(ws => ws.id !== workstreamId)
            const renumbered = filtered.map((ws, idx) => ({
              ...ws,
              number: idx + 1
            }))
            return {
              ...phase,
              workstreams: renumbered
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  addLineItem: (projectId: string, phaseId: string, workstreamId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                const nextNumber = ws.lineItems.length + 1
                const newLineItem: PricingLineItem = {
                  id: generateId(),
                  number: `${ws.number}.${nextNumber}`,
                  name: '',
                  assignees: []
                }
                return {
                  ...ws,
                  lineItems: [...ws.lineItems, newLineItem]
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updateLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string, updates: Partial<PricingLineItem>) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                return {
                  ...ws,
                  lineItems: ws.lineItems.map(item =>
                    item.id === lineItemId ? { ...item, ...updates } : item
                  )
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  deleteLineItem: (projectId: string, phaseId: string, workstreamId: string, lineItemId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                const filtered = ws.lineItems.filter(item => item.id !== lineItemId)
                const renumbered = filtered.map((item, idx) => ({
                  ...item,
                  number: `${ws.number}.${idx + 1}`
                }))
                return {
                  ...ws,
                  lineItems: renumbered
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  // Assignee actions
  addAssigneeToLineItem: (projectId, phaseId, workstreamId, lineItemId, associateId) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        // Ensure associate has a rate entry
        let associateRates = p.associateRates
        if (!associateRates.find(ar => ar.associateId === associateId)) {
          associateRates = [...associateRates, {
            associateId,
            baseRate: 0,
            markedUpRate: 0
          }]
        }
        
        return {
          ...p,
          associateRates,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                return {
                  ...ws,
                  lineItems: ws.lineItems.map(item => {
                    if (item.id !== lineItemId) return item
                    // Check if already assigned
                    if (item.assignees.find(a => a.associateId === associateId)) return item
                    return {
                      ...item,
                      assignees: [...item.assignees, { 
                        associateId, 
                        days: 0,
                        timeUnit: 'full' as const, // Default to full project mode
                        daysPerPeriod: 0,
                        numberOfPeriods: 0
                      }]
                    }
                  })
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updateAssigneeDays: (projectId, phaseId, workstreamId, lineItemId, associateId, days) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                return {
                  ...ws,
                  lineItems: ws.lineItems.map(item => {
                    if (item.id !== lineItemId) return item
                    return {
                      ...item,
                      assignees: item.assignees.map(a =>
                        a.associateId === associateId ? { ...a, days } : a
                      )
                    }
                  })
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  updateAssigneeTimeUnit: (projectId, phaseId, workstreamId, lineItemId, associateId, updates) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                return {
                  ...ws,
                  lineItems: ws.lineItems.map(item => {
                    if (item.id !== lineItemId) return item
                    return {
                      ...item,
                      assignees: item.assignees.map(a => {
                        if (a.associateId !== associateId) return a
                        const updated = { ...a, ...updates }
                        // Auto-calculate days when timeUnit is week or month
                        if (updated.timeUnit !== 'full') {
                          updated.days = (updated.daysPerPeriod || 0) * (updated.numberOfPeriods || 0)
                        }
                        return updated
                      })
                    }
                  })
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  removeAssigneeFromLineItem: (projectId, phaseId, workstreamId, lineItemId, associateId) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          phases: p.phases.map(phase => {
            if (phase.id !== phaseId) return phase
            return {
              ...phase,
              workstreams: phase.workstreams.map(ws => {
                if (ws.id !== workstreamId) return ws
                return {
                  ...ws,
                  lineItems: ws.lineItems.map(item => {
                    if (item.id !== lineItemId) return item
                    return {
                      ...item,
                      assignees: item.assignees.filter(a => a.associateId !== associateId)
                    }
                  })
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  // Associate rate actions
  setAssociateRate: (projectId, associateId, baseRate) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        const existing = p.associateRates.find(ar => ar.associateId === associateId)
        const markedUpRate = calculateMarkedUpRate(baseRate, p.markupPercentage)
        
        if (existing) {
          return {
            ...p,
            associateRates: p.associateRates.map(ar =>
              ar.associateId === associateId ? { ...ar, baseRate, markedUpRate } : ar
            ),
            updatedAt: new Date().toISOString()
          }
        }
        
        return {
          ...p,
          associateRates: [...p.associateRates, { associateId, baseRate, markedUpRate }],
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  removeAssociateRate: (projectId, associateId) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          associateRates: p.associateRates.filter(ar => ar.associateId !== associateId),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  setAssociateMarkedUpRate: (projectId, associateId, markedUpRate) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        const existing = p.associateRates.find(ar => ar.associateId === associateId)
        
        if (existing) {
          return {
            ...p,
            associateRates: p.associateRates.map(ar =>
              ar.associateId === associateId ? { ...ar, markedUpRate } : ar
            ),
            updatedAt: new Date().toISOString()
          }
        }
        
        return {
          ...p,
          associateRates: [...p.associateRates, { associateId, baseRate: 0, markedUpRate }],
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  // Expense actions
  updateExpense: (projectId: string, associateId: string, updates: Partial<ExpenseItem>) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          expenses: p.expenses.map(exp =>
            exp.associateId === associateId ? { ...exp, ...updates } : exp
          ),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  addAssociateExpense: (projectId: string, associateId: string) => {
    const pricing = get().getProjectPricing(projectId)
    if (!pricing) return
    
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        // Check if already exists
        if (p.expenses.some(e => e.associateId === associateId)) return p
        const newExpense: ExpenseItem = {
          associateId,
          numberOfFlights: 0,
          avgFlightCost: 0,
          daysOnsite: 0,
          accommodationPerDay: p.defaultAccommodation,
          perDiemPerDay: p.defaultPerDiem,
          expenseBuffer: 0
        }
        return {
          ...p,
          expenses: [...p.expenses, newExpense],
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  removeAssociateExpense: (projectId: string, associateId: string) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          expenses: p.expenses.filter(e => e.associateId !== associateId),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updatePricingSettings: (projectId: string, settings) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        const updated = { ...p, ...settings }
        // Recalculate marked up rates if markup changed
        if (settings.markupPercentage !== undefined) {
          updated.associateRates = p.associateRates.map(ar => ({
            ...ar,
            markedUpRate: calculateMarkedUpRate(ar.baseRate, settings.markupPercentage!)
          }))
        }
        return {
          ...updated,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  // Milestone pricing actions
  addTaskAssignee: (projectId, milestoneId, taskId, associateId) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        const milestonePricing = p.milestonePricing || []
        let milestoneEntry = milestonePricing.find(m => m.milestoneId === milestoneId)
        
        if (!milestoneEntry) {
          // Create new milestone pricing entry
          milestoneEntry = { milestoneId, tasks: [] }
          milestonePricing.push(milestoneEntry)
        }
        
        let taskEntry = milestoneEntry.tasks.find(t => t.taskId === taskId)
        if (!taskEntry) {
          // Create new task pricing entry with timeUnit at task level
          taskEntry = { taskId, timeUnit: 'full', numberOfPeriods: 0, assignees: [] }
          milestoneEntry.tasks.push(taskEntry)
        }
        
        // Check if assignee already exists
        if (taskEntry.assignees.some(a => a.associateId === associateId)) {
          return p
        }
        
        // Add new assignee (simpler structure - days only, timeUnit is at task level)
        taskEntry.assignees.push({
          associateId,
          days: 0,
          daysPerPeriod: 0
        })
        
        return {
          ...p,
          milestonePricing: [...milestonePricing],
          status: 'in-progress' as const,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  updateTaskAssignee: (projectId, milestoneId, taskId, associateId, updates) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        let milestonePricing = [...(p.milestonePricing || [])]
        
        // Find or create milestone pricing entry
        let mpIndex = milestonePricing.findIndex(m => m.milestoneId === milestoneId)
        if (mpIndex === -1) {
          milestonePricing.push({ milestoneId, tasks: [] })
          mpIndex = milestonePricing.length - 1
        }
        
        const mp = { ...milestonePricing[mpIndex], tasks: [...milestonePricing[mpIndex].tasks] }
        
        // Find or create task pricing entry
        let tpIndex = mp.tasks.findIndex(t => t.taskId === taskId)
        if (tpIndex === -1) {
          mp.tasks.push({ taskId, timeUnit: 'full', numberOfPeriods: 0, assignees: [] })
          tpIndex = mp.tasks.length - 1
        }
        
        const tp = { ...mp.tasks[tpIndex], assignees: [...mp.tasks[tpIndex].assignees] }
        const timeUnit = tp.timeUnit || 'full'
        
        // Find assignee
        const aIndex = tp.assignees.findIndex(a => a.associateId === associateId)
        if (aIndex === -1) return p // Assignee not found, don't update
        
        const updated = { ...tp.assignees[aIndex], ...updates }
        // Auto-calculate days when timeUnit is week or month
        if (timeUnit !== 'full' && updates.daysPerPeriod !== undefined) {
          updated.days = (updated.daysPerPeriod || 0) * (tp.numberOfPeriods || 0)
        }
        tp.assignees[aIndex] = updated
        
        mp.tasks[tpIndex] = tp
        milestonePricing[mpIndex] = mp
        
        return {
          ...p,
          milestonePricing,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  updateTaskSettings: (projectId, milestoneId, taskId, settings) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        let milestonePricing = [...(p.milestonePricing || [])]
        
        // Find or create milestone pricing entry
        let mpIndex = milestonePricing.findIndex(m => m.milestoneId === milestoneId)
        if (mpIndex === -1) {
          milestonePricing.push({ milestoneId, tasks: [] })
          mpIndex = milestonePricing.length - 1
        }
        
        const mp = { ...milestonePricing[mpIndex], tasks: [...milestonePricing[mpIndex].tasks] }
        
        // Find or create task pricing entry
        let tpIndex = mp.tasks.findIndex(t => t.taskId === taskId)
        if (tpIndex === -1) {
          mp.tasks.push({ taskId, timeUnit: 'full', numberOfPeriods: 0, assignees: [] })
          tpIndex = mp.tasks.length - 1
        }
        
        const tp = mp.tasks[tpIndex]
        const newTimeUnit = settings.timeUnit ?? tp.timeUnit
        const newPeriods = settings.numberOfPeriods ?? tp.numberOfPeriods ?? 0
        
        // Update task settings and recalculate all assignee days if needed
        mp.tasks[tpIndex] = {
          ...tp,
          timeUnit: newTimeUnit,
          numberOfPeriods: newPeriods,
          assignees: tp.assignees.map(a => {
            // Recalculate days for all assignees when periods change
            if (newTimeUnit !== 'full') {
              return { ...a, days: (a.daysPerPeriod || 0) * newPeriods }
            }
            return a
          })
        }
        
        milestonePricing[mpIndex] = mp
        
        return {
          ...p,
          milestonePricing,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },
  
  removeTaskAssignee: (projectId, milestoneId, taskId, associateId) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        
        return {
          ...p,
          milestonePricing: (p.milestonePricing || []).map(mp => {
            if (mp.milestoneId !== milestoneId) return mp
            return {
              ...mp,
              tasks: mp.tasks.map(tp => {
                if (tp.taskId !== taskId) return tp
                return {
                  ...tp,
                  assignees: tp.assignees.filter(a => a.associateId !== associateId)
                }
              })
            }
          }),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  updatePricingStatus: (projectId: string, status: ProjectPricing['status']) => {
    set(state => ({
      projectPricings: state.projectPricings.map(p => {
        if (p.projectId !== projectId) return p
        return {
          ...p,
          status,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  }
}))
