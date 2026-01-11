"use client"

import { create } from "zustand"
import {
  projects as initialProjects,
  associates as initialAssociates,
  tasks as initialTasks,
  milestones as initialMilestones,
  uploads as initialUploads,
  notes as initialNotes,
  costingRequests as initialCostingRequests,
  clients as initialClients,
  type Project,
  type Associate,
  type Task,
  type Milestone,
  type Upload,
  type Note,
  type CostingRequest,
  type ProjectHealth,
  type Client,
} from "./mock-data"

interface AppState {
  projects: Project[]
  associates: Associate[]
  tasks: Task[]
  milestones: Milestone[]
  uploads: Upload[]
  notes: Note[]
  costingRequests: CostingRequest[]
  clients: Client[]
  mondayConnected: boolean
  lastSyncTime: string | null
  currentUser: { id: string; name: string }

  // Actions
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  updateProjectLifecycle: (id: string, lifecycle: Project["lifecycle"]) => void
  updateProjectOnboardingStep: (id: string, step: number) => void
  updateProjectHealth: (id: string, health: ProjectHealth) => void
  toggleFinanceAutomation: (id: string) => void
  addRiskNote: (projectId: string, note: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, newStatus: Task["status"]) => void
  deleteTask: (id: string) => void
  addMilestone: (milestone: Milestone) => void
  addMilestoneWithTasks: (milestone: Omit<Milestone, "tasks">, tasks: Omit<Task, "id" | "milestoneId">[]) => void
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  addUpload: (upload: Upload) => void
  updateUpload: (id: string, updates: Partial<Upload>) => void
  addNote: (note: Note) => void
  addCostingRequest: (request: CostingRequest) => void
  updateCostingRequest: (id: string, updates: Partial<CostingRequest>) => void
  assignAssociateToProject: (associateId: string, projectId: string) => void
  toggleMondayConnection: () => void
  syncWithMonday: () => void
  addClient: (client: Client) => void
  updateClient: (id: string, updates: Partial<Client>) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: initialProjects,
  associates: initialAssociates,
  tasks: initialTasks,
  milestones: initialMilestones,
  uploads: initialUploads,
  notes: initialNotes,
  costingRequests: initialCostingRequests,
  clients: initialClients,
  mondayConnected: false,
  lastSyncTime: null,
  currentUser: { id: "a1", name: "Sarah Chen" },

  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  updateProjectLifecycle: (id, lifecycle) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString().split("T")[0]
      const lifecycleLabels: Record<string, string> = {
        "new-business": "New Business",
        onboarding: "Onboarding",
        execution: "Execution",
        closure: "Closure",
        learnings: "Learnings",
      }
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                lifecycle,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  { action: `Moved to ${lifecycleLabels[lifecycle]}`, user: currentUser.name, date: now },
                  ...(p.auditLog || []),
                ],
              }
            : p,
        ),
      }
    }),

  updateProjectOnboardingStep: (id, step) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString().split("T")[0]
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                onboardingStep: step,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  { action: `Onboarding step changed to ${step}`, user: currentUser.name, date: now },
                  ...p.auditLog,
                ],
              }
            : p,
        ),
      }
    }),

  updateProjectHealth: (id, health) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString().split("T")[0]
      const healthLabels: Record<ProjectHealth, string> = {
        "on-track": "On Track",
        "at-risk": "At Risk",
        "critical-risk": "Critical Risk",
      }
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                health,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  { action: `Health changed to ${healthLabels[health]}`, user: currentUser.name, date: now },
                  ...p.auditLog,
                ],
              }
            : p,
        ),
      }
    }),

  toggleFinanceAutomation: (id) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString().split("T")[0]
      const project = state.projects.find((p) => p.id === id)
      const newBlocked = !project?.financeAutomationBlocked
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                financeAutomationBlocked: newBlocked,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  {
                    action: newBlocked ? "Finance automation blocked" : "Finance automation unblocked",
                    user: currentUser.name,
                    date: now,
                  },
                  ...p.auditLog,
                ],
              }
            : p,
        ),
      }
    }),

  addRiskNote: (projectId, noteContent) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString()
      const newNote: Note = {
        id: `n${Date.now()}`,
        content: noteContent,
        type: "Risk",
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: now,
        projectId,
      }
      return {
        notes: [...state.notes, newNote],
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                lastUpdate: { date: now.split("T")[0], user: currentUser.name },
                auditLog: [
                  { action: "Risk/Issue note added", user: currentUser.name, date: now.split("T")[0] },
                  ...p.auditLog,
                ],
              }
            : p,
        ),
      }
    }),

  addTask: (task) =>
    set((state) => {
      const newTasks = [...state.tasks, task]
      // Update milestone progress
      const milestone = state.milestones.find((m) => m.id === task.milestoneId)
      if (milestone) {
        const milestoneTasks = newTasks.filter((t) => t.milestoneId === task.milestoneId)
        const completedTasks = milestoneTasks.filter((t) => t.status === "done").length
        const completion = Math.round((completedTasks / milestoneTasks.length) * 100)
        return {
          tasks: newTasks,
          milestones: state.milestones.map((m) => (m.id === task.milestoneId ? { ...m, completion } : m)),
        }
      }
      return { tasks: newTasks }
    }),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  moveTask: (taskId, newStatus) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId)
      if (!task) return state

      const now = new Date().toISOString()
      const updates: Partial<Task> = { status: newStatus }

      if (newStatus === "in-progress" && !task.timeStarted) {
        updates.timeStarted = now
      } else if (newStatus === "done" && !task.timeCompleted) {
        updates.timeCompleted = now
        if (task.timeStarted) {
          const start = new Date(task.timeStarted)
          const end = new Date(now)
          updates.cycleTime = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        }
      }

      const newTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))

      // Update milestone progress
      const milestoneTasks = newTasks.filter((t) => t.milestoneId === task.milestoneId)
      const completedTasks = milestoneTasks.filter((t) => t.status === "done").length
      const completion = milestoneTasks.length > 0 ? Math.round((completedTasks / milestoneTasks.length) * 100) : 0

      return {
        tasks: newTasks,
        milestones: state.milestones.map((m) => (m.id === task.milestoneId ? { ...m, completion } : m)),
      }
    }),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  addMilestone: (milestone) =>
    set((state) => ({
      milestones: [...state.milestones, milestone],
    })),

  addMilestoneWithTasks: (milestone, tasksToAdd) =>
    set((state) => {
      const milestoneId = milestone.id
      const newTasks: Task[] = tasksToAdd.map((task, index) => ({
        ...task,
        id: `t${Date.now()}-${index}`,
        milestoneId,
      }))

      const newMilestone: Milestone = {
        ...milestone,
        tasks: newTasks,
        completion: 0,
      }

      return {
        milestones: [...state.milestones, newMilestone],
        tasks: [...state.tasks, ...newTasks],
      }
    }),

  updateMilestone: (id, updates) =>
    set((state) => ({
      milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  deleteMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
      tasks: state.tasks.filter((t) => t.milestoneId !== id),
    })),

  addUpload: (upload) => set((state) => ({ uploads: [...state.uploads, upload] })),

  updateUpload: (id, updates) =>
    set((state) => ({
      uploads: state.uploads.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),

  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),

  addCostingRequest: (request) =>
    set((state) => ({
      costingRequests: [...state.costingRequests, request],
    })),

  updateCostingRequest: (id, updates) =>
    set((state) => ({
      costingRequests: state.costingRequests.map((cr) => (cr.id === id ? { ...cr, ...updates } : cr)),
    })),

  assignAssociateToProject: (associateId, projectId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId && !p.assignedAssociates.includes(associateId)
          ? { ...p, assignedAssociates: [...p.assignedAssociates, associateId] }
          : p,
      ),
      associates: state.associates.map((a) =>
        a.id === associateId ? { ...a, activeProjects: a.activeProjects + 1 } : a,
      ),
    })),

  toggleMondayConnection: () => set((state) => ({ mondayConnected: !state.mondayConnected })),

  syncWithMonday: () => set(() => ({ lastSyncTime: new Date().toISOString() })),

  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),

  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
}))
