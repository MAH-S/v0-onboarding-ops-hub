"use client"

import { create } from "zustand"
import {
  type ProjectAssignment,
  type ProjectRevenue,
  type AssociateSettings,
  calculateProjectRevenue,
  calculateAssociateRevenue,
  type ProjectRevenueCalculation,
  type AssociateRevenueCalculation,
} from "./revenue-types"

// Mock data for project revenue
const initialProjectRevenue: ProjectRevenue[] = [
  {
    id: "pr1",
    projectId: "p1",
    contractValue: 150000,
    startDate: "2025-11-01",
    endDate: "2026-03-31",
    status: "active",
  },
  {
    id: "pr2",
    projectId: "p2",
    contractValue: 85000,
    startDate: "2025-12-15",
    endDate: "2026-02-28",
    status: "active",
  },
  {
    id: "pr3",
    projectId: "p3",
    contractValue: 220000,
    startDate: "2025-10-01",
    endDate: "2026-04-30",
    status: "active",
  },
  {
    id: "pr4",
    projectId: "p4",
    contractValue: 65000,
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    status: "closed",
  },
]

// Mock data for assignments
const initialAssignments: ProjectAssignment[] = [
  // Project 1 assignments
  {
    id: "assign1",
    projectId: "p1",
    associateId: "a1",
    role: "Project Manager",
    hourlyRate: 150,
    hoursPerDay: 8,
    startDate: "2025-11-01",
    endDate: "2026-03-31",
    initialOverheadPerDay: 200,
    finalOverheadPerDay: 50,
    rampDays: 20,
  },
  {
    id: "assign2",
    projectId: "p1",
    associateId: "a2",
    role: "Business Analyst",
    hourlyRate: 120,
    hoursPerDay: 8,
    startDate: "2025-11-15",
    endDate: "2026-02-28",
    initialOverheadPerDay: 180,
    finalOverheadPerDay: 40,
    rampDays: 15,
  },
  // Project 2 assignments
  {
    id: "assign3",
    projectId: "p2",
    associateId: "a4",
    role: "Tech Lead",
    hourlyRate: 175,
    hoursPerDay: 6,
    startDate: "2025-12-15",
    endDate: "2026-02-28",
    initialOverheadPerDay: 200,
    finalOverheadPerDay: 50,
    rampDays: 20,
  },
  {
    id: "assign4",
    projectId: "p2",
    associateId: "a3",
    role: "Analyst",
    hourlyRate: 95,
    hoursPerDay: 8,
    startDate: "2026-01-01",
    endDate: "2026-02-28",
    initialOverheadPerDay: 150,
    finalOverheadPerDay: 30,
    rampDays: 10,
  },
  // Project 3 assignments
  {
    id: "assign5",
    projectId: "p3",
    associateId: "a1",
    role: "Engagement Lead",
    hourlyRate: 150,
    hoursPerDay: 4,
    startDate: "2025-10-01",
    endDate: "2026-04-30",
    initialOverheadPerDay: 200,
    finalOverheadPerDay: 50,
    rampDays: 20,
  },
  {
    id: "assign6",
    projectId: "p3",
    associateId: "a4",
    role: "Senior Consultant",
    hourlyRate: 175,
    hoursPerDay: 8,
    startDate: "2025-10-15",
    endDate: "2026-03-31",
    initialOverheadPerDay: 200,
    finalOverheadPerDay: 50,
    rampDays: 20,
  },
  {
    id: "assign7",
    projectId: "p3",
    associateId: "a2",
    role: "Developer",
    hourlyRate: 120,
    hoursPerDay: 8,
    startDate: "2025-11-01",
    endDate: "2026-02-28",
    initialOverheadPerDay: 180,
    finalOverheadPerDay: 40,
    rampDays: 15,
  },
  // Project 4 assignments (closed)
  {
    id: "assign8",
    projectId: "p4",
    associateId: "a3",
    role: "Analyst",
    hourlyRate: 95,
    hoursPerDay: 8,
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    initialOverheadPerDay: 150,
    finalOverheadPerDay: 30,
    rampDays: 10,
  },
]

// Default hourly rates per associate
const initialAssociateSettings: AssociateSettings[] = [
  { associateId: "a1", defaultHourlyRate: 150 },
  { associateId: "a2", defaultHourlyRate: 120 },
  { associateId: "a3", defaultHourlyRate: 95 },
  { associateId: "a4", defaultHourlyRate: 175 },
]

interface RevenueState {
  projectRevenue: ProjectRevenue[]
  assignments: ProjectAssignment[]
  associateSettings: AssociateSettings[]

  // Actions
  addProjectRevenue: (revenue: ProjectRevenue) => void
  updateProjectRevenue: (id: string, updates: Partial<ProjectRevenue>) => void
  deleteProjectRevenue: (id: string) => void

  addAssignment: (assignment: ProjectAssignment) => void
  updateAssignment: (id: string, updates: Partial<ProjectAssignment>) => void
  deleteAssignment: (id: string) => void

  updateAssociateSettings: (associateId: string, hourlyRate: number) => void

  // Calculations
  getProjectRevenueCalculation: (projectId: string) => ProjectRevenueCalculation | null
  getAllProjectRevenueCalculations: () => ProjectRevenueCalculation[]
  getAssociateRevenueCalculation: (associateId: string) => AssociateRevenueCalculation
  getAllAssociateRevenueCalculations: () => AssociateRevenueCalculation[]
  getAssociateDefaultRate: (associateId: string) => number
}

export const useRevenueStore = create<RevenueState>((set, get) => ({
  projectRevenue: initialProjectRevenue,
  assignments: initialAssignments,
  associateSettings: initialAssociateSettings,

  addProjectRevenue: (revenue) => set((state) => ({ projectRevenue: [...state.projectRevenue, revenue] })),

  updateProjectRevenue: (id, updates) =>
    set((state) => ({
      projectRevenue: state.projectRevenue.map((pr) => (pr.id === id ? { ...pr, ...updates } : pr)),
    })),

  deleteProjectRevenue: (id) =>
    set((state) => ({
      projectRevenue: state.projectRevenue.filter((pr) => pr.id !== id),
    })),

  addAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),

  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    })),

  updateAssociateSettings: (associateId, hourlyRate) =>
    set((state) => {
      const existing = state.associateSettings.find((s) => s.associateId === associateId)
      if (existing) {
        return {
          associateSettings: state.associateSettings.map((s) =>
            s.associateId === associateId ? { ...s, defaultHourlyRate: hourlyRate } : s,
          ),
        }
      }
      return {
        associateSettings: [...state.associateSettings, { associateId, defaultHourlyRate: hourlyRate }],
      }
    }),

  getProjectRevenueCalculation: (projectId) => {
    const { projectRevenue, assignments } = get()
    const pr = projectRevenue.find((p) => p.projectId === projectId)
    if (!pr) return null
    return calculateProjectRevenue(pr, assignments)
  },

  getAllProjectRevenueCalculations: () => {
    const { projectRevenue, assignments } = get()
    return projectRevenue.map((pr) => calculateProjectRevenue(pr, assignments))
  },

  getAssociateRevenueCalculation: (associateId) => {
    const { assignments } = get()
    return calculateAssociateRevenue(associateId, assignments)
  },

  getAllAssociateRevenueCalculations: () => {
    const { assignments, associateSettings } = get()
    const associateIds = new Set(assignments.map((a) => a.associateId))
    associateSettings.forEach((s) => associateIds.add(s.associateId))
    return Array.from(associateIds).map((id) => calculateAssociateRevenue(id, assignments))
  },

  getAssociateDefaultRate: (associateId) => {
    const { associateSettings } = get()
    const setting = associateSettings.find((s) => s.associateId === associateId)
    return setting?.defaultHourlyRate ?? 100
  },
}))
