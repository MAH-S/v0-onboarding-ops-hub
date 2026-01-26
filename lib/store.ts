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
  type ClientHealthFactor,
  type ClientHealthHistoryEntry,
} from "./mock-data"

function calculateProjectProgress(projectId: string, milestones: Milestone[]): number {
  const projectMilestones = milestones.filter((m) => m.projectId === projectId)
  if (projectMilestones.length === 0) return 0
  const totalCompletion = projectMilestones.reduce((sum, m) => sum + m.completion, 0)
  return Math.round(totalCompletion / projectMilestones.length)
}

function updateProjectProgress(projects: Project[], projectId: string, milestones: Milestone[]): Project[] {
  const newProgress = calculateProjectProgress(projectId, milestones)
  return projects.map((p) => (p.id === projectId ? { ...p, milestonesProgress: newProgress } : p))
}

function calculateClientHealth(
  clientName: string,
  projects: Project[],
  tasks: Task[],
  milestones: Milestone[],
  uploads: Upload[],
  client: Client,
): { score: number; factors: ClientHealthFactor[] } {
  const clientProjects = projects.filter((p) => p.client === clientName)

  if (clientProjects.length === 0) {
    return {
      score: client.status === "prospect" ? 0 : 75,
      factors: [{ factor: "No Projects", score: 75, weight: 1, description: "No active projects to evaluate" }],
    }
  }

  const factors: ClientHealthFactor[] = []

  // Factor 1: Project Health (30% weight)
  const projectHealthScores = clientProjects.map((p) => {
    if (p.health === "on-track") return 100
    if (p.health === "at-risk") return 50
    return 20
  })
  const avgProjectHealth = projectHealthScores.reduce((a, b) => a + b, 0) / projectHealthScores.length
  factors.push({
    factor: "Project Health",
    score: Math.round(avgProjectHealth),
    weight: 0.3,
    description: `${clientProjects.filter((p) => p.health === "on-track").length}/${clientProjects.length} projects on track`,
  })

  // Factor 2: Task Completion Rate (20% weight)
  const clientTasks = tasks.filter((t) => clientProjects.some((p) => p.id === t.projectId))
  const completedTasks = clientTasks.filter((t) => t.status === "done").length
  const taskCompletionRate = clientTasks.length > 0 ? (completedTasks / clientTasks.length) * 100 : 100
  factors.push({
    factor: "Task Completion",
    score: Math.round(taskCompletionRate),
    weight: 0.2,
    description: `${completedTasks}/${clientTasks.length} tasks completed`,
  })

  // Factor 3: Milestone Progress (20% weight)
  const clientMilestones = milestones.filter((m) => clientProjects.some((p) => p.id === m.projectId))
  const avgMilestoneProgress =
    clientMilestones.length > 0
      ? clientMilestones.reduce((sum, m) => sum + m.completion, 0) / clientMilestones.length
      : 100
  factors.push({
    factor: "Milestone Progress",
    score: Math.round(avgMilestoneProgress),
    weight: 0.2,
    description: `${Math.round(avgMilestoneProgress)}% average milestone completion`,
  })

  // Factor 4: Financial Health (15% weight)
  const outstandingRatio = client.totalRevenue > 0 ? (1 - client.outstandingBalance / client.totalRevenue) * 100 : 100
  factors.push({
    factor: "Financial Health",
    score: Math.round(Math.max(0, outstandingRatio)),
    weight: 0.15,
    description:
      client.outstandingBalance > 0
        ? `$${client.outstandingBalance.toLocaleString()} outstanding`
        : "No outstanding balance",
  })

  // Factor 5: Document Approval Rate (15% weight)
  const clientUploads = uploads.filter((u) => clientProjects.some((p) => p.id === u.projectId))
  const approvedUploads = clientUploads.filter((u) => u.status === "approved").length
  const approvalRate = clientUploads.length > 0 ? (approvedUploads / clientUploads.length) * 100 : 100
  factors.push({
    factor: "Document Approval",
    score: Math.round(approvalRate),
    weight: 0.15,
    description: `${approvedUploads}/${clientUploads.length} documents approved`,
  })

  // Calculate weighted score
  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0))

  return { score, factors }
}

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
  updateProjectNewBusinessStep: (id: string, step: number) => void
  updateProjectHealth: (id: string, health: ProjectHealth) => void
  toggleFinanceAutomation: (id: string) => void
  addRiskNote: (projectId: string, note: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, newStatus: Task["status"]) => void
  deleteTask: (id: string) => void
  addMilestone: (milestone: Milestone) => void
  addMilestoneWithTasks: (milestone: Omit<Milestone, "tasks">, tasks: Omit<Task, "id" | "milestoneId">[]) => void
  addMilestoneToProject: (projectId: string, milestone: { id: string, title: string, startDate?: string, dueDate?: string }) => void
  addTaskToMilestone: (projectId: string, milestoneId: string, task: { id: string, title: string, startDate?: string, dueDate?: string }) => void
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  deleteMilestoneFromProject: (projectId: string, milestoneId: string) => void
  addUpload: (upload: Upload) => void
  updateUpload: (id: string, updates: Partial<Upload>) => void
  addNote: (note: Note) => void
  addCostingRequest: (request: CostingRequest) => void
  updateCostingRequest: (id: string, updates: Partial<CostingRequest>) => void
  assignAssociateToProject: (associateId: string, projectId: string) => void
  removeAssociateFromProject: (associateId: string, projectId: string) => void
  addAssociate: (associate: Associate) => void
  updateAssociate: (id: string, updates: Partial<Associate>) => void
  toggleMondayConnection: () => void
  syncWithMonday: () => void
  addClient: (client: Client) => void
  updateClient: (id: string, updates: Partial<Client>) => void

  calculateClientHealthScore: (clientId: string) => { score: number; factors: ClientHealthFactor[] }
  updateClientHealthOverride: (clientId: string, override: number | null, note?: string) => void
  addClientHealthNote: (clientId: string, note: string) => void
  addClientHealthAlert: (clientId: string, alert: string) => void
  removeClientHealthAlert: (clientId: string, alert: string) => void
  refreshAllClientHealth: () => void
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
        completed: "Completed",
      }
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                lifecycle,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  { action: `Moved to ${lifecycleLabels[lifecycle] || lifecycle}`, user: currentUser.name, date: now },
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

  updateProjectNewBusinessStep: (id, step) =>
    set((state) => {
      const { currentUser } = get()
      const now = new Date().toISOString().split("T")[0]
      return {
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                newBusinessStep: step,
                lastUpdate: { date: now, user: currentUser.name },
                auditLog: [
                  { action: `New Business step changed to ${step}`, user: currentUser.name, date: now },
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
        const newMilestones = state.milestones.map((m) => (m.id === task.milestoneId ? { ...m, completion } : m))
        const newProjects = updateProjectProgress(state.projects, milestone.projectId, newMilestones)
        return {
          tasks: newTasks,
          milestones: newMilestones,
          projects: newProjects,
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

      const newMilestones = state.milestones.map((m) => (m.id === task.milestoneId ? { ...m, completion } : m))

      const milestone = state.milestones.find((m) => m.id === task.milestoneId)
      const newProjects = milestone
        ? updateProjectProgress(state.projects, milestone.projectId, newMilestones)
        : state.projects

      return {
        tasks: newTasks,
        milestones: newMilestones,
        projects: newProjects,
      }
    }),

  deleteTask: (id) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return { tasks: state.tasks.filter((t) => t.id !== id) }

      const newTasks = state.tasks.filter((t) => t.id !== id)

      const milestoneTasks = newTasks.filter((t) => t.milestoneId === task.milestoneId)
      const completedTasks = milestoneTasks.filter((t) => t.status === "done").length
      const completion = milestoneTasks.length > 0 ? Math.round((completedTasks / milestoneTasks.length) * 100) : 0

      const newMilestones = state.milestones.map((m) => (m.id === task.milestoneId ? { ...m, completion } : m))

      const milestone = state.milestones.find((m) => m.id === task.milestoneId)
      const newProjects = milestone
        ? updateProjectProgress(state.projects, milestone.projectId, newMilestones)
        : state.projects

      return {
        tasks: newTasks,
        milestones: newMilestones,
        projects: newProjects,
      }
    }),

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

      const newMilestones = [...state.milestones, newMilestone]
      const newProjects = updateProjectProgress(state.projects, milestone.projectId, newMilestones)

      return {
        milestones: newMilestones,
        tasks: [...state.tasks, ...newTasks],
        projects: newProjects,
      }
    }),

  updateMilestone: (id, updates) =>
    set((state) => {
      const newMilestones = state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m))
      const milestone = state.milestones.find((m) => m.id === id)
      if (milestone && updates.completion !== undefined) {
        const newProjects = updateProjectProgress(state.projects, milestone.projectId, newMilestones)
        return { milestones: newMilestones, projects: newProjects }
      }
      return { milestones: newMilestones }
    }),

  deleteMilestone: (id) =>
    set((state) => {
      const milestone = state.milestones.find((m) => m.id === id)
      const newMilestones = state.milestones.filter((m) => m.id !== id)
      const newProjects = milestone
        ? updateProjectProgress(state.projects, milestone.projectId, newMilestones)
        : state.projects
      return {
        milestones: newMilestones,
        tasks: state.tasks.filter((t) => t.milestoneId !== id),
        projects: newProjects,
      }
    }),

  // Add a milestone/phase directly to a project's milestones array
  addMilestoneToProject: (projectId, milestone) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p
        const newMilestone = {
          id: milestone.id,
          title: milestone.title,
          startDate: milestone.startDate || new Date().toISOString().split('T')[0],
          dueDate: milestone.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completion: 0,
          tasks: [],
        }
        return {
          ...p,
          milestones: [...(p.milestones || []), newMilestone],
        }
      }),
    })),

  // Add a task to a milestone within a project
  addTaskToMilestone: (projectId, milestoneId, task) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          milestones: (p.milestones || []).map((m) => {
            if (m.id !== milestoneId) return m
            const newTask = {
              id: task.id,
              title: task.title,
              status: 'todo' as const,
              startDate: task.startDate || m.startDate,
              dueDate: task.dueDate || m.dueDate,
              assignee: '',
            }
            return {
              ...m,
              tasks: [...m.tasks, newTask],
            }
          }),
        }
      }),
    })),

  // Delete a milestone from a project
  deleteMilestoneFromProject: (projectId, milestoneId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          milestones: (p.milestones || []).filter((m) => m.id !== milestoneId),
        }
      }),
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

  removeAssociateFromProject: (associateId, projectId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, assignedAssociates: p.assignedAssociates.filter((id) => id !== associateId) } : p,
      ),
      associates: state.associates.map((a) =>
        a.id === associateId ? { ...a, activeProjects: Math.max(0, a.activeProjects - 1) } : a,
      ),
    })),

  addAssociate: (associate) =>
    set((state) => ({
      associates: [...state.associates, associate],
    })),

  updateAssociate: (id, updates) =>
    set((state) => ({
      associates: state.associates.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  toggleMondayConnection: () => set((state) => ({ mondayConnected: !state.mondayConnected })),

  syncWithMonday: () => set(() => ({ lastSyncTime: new Date().toISOString() })),

  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),

  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  calculateClientHealthScore: (clientId) => {
    const { clients, projects, tasks, milestones, uploads } = get()
    const client = clients.find((c) => c.id === clientId)
    if (!client) return { score: 0, factors: [] }

    return calculateClientHealth(client.name, projects, tasks, milestones, uploads, client)
  },

  updateClientHealthOverride: (clientId, override, note) =>
    set((state) => {
      const { currentUser, projects, tasks, milestones, uploads } = get()
      const now = new Date().toISOString().split("T")[0]
      const client = state.clients.find((c) => c.id === clientId)
      if (!client) return state

      const { score: calculatedScore, factors } = calculateClientHealth(
        client.name,
        projects,
        tasks,
        milestones,
        uploads,
        client,
      )

      const finalScore = override !== null ? override : calculatedScore

      const historyEntry: ClientHealthHistoryEntry = {
        date: now,
        score: finalScore,
        factors,
        note: note || (override !== null ? `Manual override to ${override}%` : "Auto-calculated"),
        updatedBy: currentUser.name,
        isManualOverride: override !== null,
      }

      return {
        clients: state.clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                healthScore: finalScore,
                healthOverride: override,
                healthFactors: factors,
                healthHistory: [historyEntry, ...(c.healthHistory || [])].slice(0, 30),
              }
            : c,
        ),
      }
    }),

  addClientHealthNote: (clientId, note) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, healthNotes: note } : c)),
    })),

  addClientHealthAlert: (clientId, alert) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, healthAlerts: [...(c.healthAlerts || []), alert] } : c,
      ),
    })),

  removeClientHealthAlert: (clientId, alert) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, healthAlerts: (c.healthAlerts || []).filter((a) => a !== alert) } : c,
      ),
    })),

  refreshAllClientHealth: () =>
    set((state) => {
      const { projects, tasks, milestones, uploads } = get()
      const now = new Date().toISOString().split("T")[0]

      return {
        clients: state.clients.map((client) => {
          if (client.healthOverride !== null && client.healthOverride !== undefined) {
            return client // Keep manual override
          }

          const { score, factors } = calculateClientHealth(client.name, projects, tasks, milestones, uploads, client)

          return {
            ...client,
            healthScore: score,
            healthFactors: factors,
          }
        }),
      }
    }),
}))

// Alias for backwards compatibility
export const useStore = useAppStore
