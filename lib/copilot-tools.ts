"use client"

import { useAppStore } from "./store"
import { useCopilotStore, type ProposedAction } from "./copilot-store"
import type { Task, Milestone } from "./mock-data"

// Simulated tool functions that interact with app state
export function useCopilotTools() {
  const appStore = useAppStore()
  const copilotStore = useCopilotStore()

  const lookupTaskUpdate = (taskIdOrName: string) => {
    const task = appStore.tasks.find(
      (t) => t.id === taskIdOrName || t.title.toLowerCase().includes(taskIdOrName.toLowerCase()),
    )
    if (!task) return { found: false, message: `Task "${taskIdOrName}" not found.` }

    const assignee = appStore.associates.find((a) => a.id === task.assigneeId)
    return {
      found: true,
      task: {
        title: task.title,
        status: task.status,
        assignee: assignee?.name || "Unassigned",
        dueDate: task.dueDate,
        lastUpdate: task.timeStarted || task.timeCompleted || "No updates yet",
        cycleTime: task.cycleTime,
      },
    }
  }

  const summarizeProject = (projectId: string) => {
    const project = appStore.projects.find((p) => p.id === projectId)
    if (!project) return { found: false, message: "Project not found." }

    const projectTasks = appStore.tasks.filter((t) => t.projectId === projectId)
    const projectMilestones = appStore.milestones.filter((m) => m.projectId === projectId)
    const projectUploads = appStore.uploads.filter((u) => u.projectId === projectId)
    const projectNotes = appStore.notes.filter((n) => n.projectId === projectId)
    const projectAssociates = appStore.associates.filter((a) => project.assignedAssociates.includes(a.id))

    const endDate =
      projectMilestones.length > 0
        ? new Date(Math.max(...projectMilestones.map((m) => new Date(m.dueDate).getTime())))
        : null
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

    const healthLabels: Record<string, string> = {
      "on-track": "On Track",
      "at-risk": "At Risk",
      "critical-risk": "Critical Risk",
    }

    return {
      found: true,
      summary: {
        name: project.name,
        client: project.client,
        health: healthLabels[project.health ?? "on-track"] ?? "Unknown",
        progress: project.milestonesProgress,
        daysRemaining,
        leads: projectAssociates.map((a) => a.name),
        openTasks: projectTasks.filter((t) => t.status !== "done").length,
        completedTasks: projectTasks.filter((t) => t.status === "done").length,
        milestonesCompleted: projectMilestones.filter((m) => m.status === "completed").length,
        totalMilestones: projectMilestones.length,
        pendingUploads: projectUploads.filter((u) => u.status === "Pending Review").length,
        recentNotes: projectNotes.slice(-3),
        blockers: projectMilestones.flatMap((m) => m.blockers).filter(Boolean),
      },
    }
  }

  const getUpcomingDueDates = (projectId: string, days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const tasks = appStore.tasks.filter((t) => {
      if (t.projectId !== projectId || t.status === "done") return false
      const dueDate = new Date(t.dueDate)
      return dueDate >= now && dueDate <= futureDate
    })

    const milestones = appStore.milestones.filter((m) => {
      if (m.projectId !== projectId || m.status === "completed") return false
      const dueDate = new Date(m.dueDate)
      return dueDate >= now && dueDate <= futureDate
    })

    return { tasks, milestones }
  }

  const getBlockers = (projectId: string) => {
    const milestones = appStore.milestones.filter((m) => m.projectId === projectId)
    const blockers = milestones.flatMap((m) => m.blockers.map((b) => ({ milestone: m.title, blocker: b })))
    const overdueTasks = appStore.tasks.filter(
      (t) => t.projectId === projectId && t.status !== "done" && new Date(t.dueDate) < new Date(),
    )
    return { blockers, overdueTasks }
  }

  const summarizeDocument = (docId: string) => {
    const doc = appStore.uploads.find((u) => u.id === docId)
    if (!doc) return { found: false, message: "Document not found." }

    const project = appStore.projects.find((p) => p.id === doc.projectId)
    const milestone = doc.milestoneId ? appStore.milestones.find((m) => m.id === doc.milestoneId) : null

    return {
      found: true,
      document: {
        fileName: doc.fileName,
        type: doc.type,
        vendor: doc.vendor,
        amount: doc.amount,
        currency: doc.currency,
        status: doc.status,
        uploadedBy: doc.uploadedBy,
        date: doc.date,
        project: project?.name,
        milestone: milestone?.title,
        reviewNote: doc.reviewNote,
      },
    }
  }

  // Action generators for "Do" mode
  const generateAssignPersonToProject = (personId: string, projectId: string): ProposedAction => {
    const person = appStore.associates.find((a) => a.id === personId)
    const project = appStore.projects.find((p) => p.id === projectId)
    return {
      id: crypto.randomUUID(),
      title: `Assign ${person?.name} to ${project?.name}`,
      system: "Local",
      target: project?.name || "Project",
      targetType: "project",
      targetId: projectId,
      changes: `Add ${person?.name} to project team`,
      included: true,
      tool: "assignPersonToProject",
      params: { personId, projectId },
    }
  }

  const generateAssignPersonToTask = (personId: string, taskId: string): ProposedAction => {
    const person = appStore.associates.find((a) => a.id === personId)
    const task = appStore.tasks.find((t) => t.id === taskId)
    return {
      id: crypto.randomUUID(),
      title: `Assign ${person?.name} to task`,
      system: "Local",
      target: task?.title || "Task",
      targetType: "task",
      targetId: taskId,
      changes: `Change assignee to ${person?.name}`,
      included: true,
      tool: "assignPersonToTask",
      params: { personId, taskId },
    }
  }

  const generateLinkDocumentToMilestone = (docId: string, milestoneId: string): ProposedAction => {
    const doc = appStore.uploads.find((u) => u.id === docId)
    const milestone = appStore.milestones.find((m) => m.id === milestoneId)
    return {
      id: crypto.randomUUID(),
      title: `Link document to milestone`,
      system: "Local",
      target: doc?.fileName || "Document",
      targetType: "document",
      targetId: docId,
      changes: `Link to ${milestone?.title}`,
      included: true,
      tool: "linkDocumentToMilestone",
      params: { docId, milestoneId },
    }
  }

  const generateCreateMilestone = (projectId: string, name: string, dueDate: string): ProposedAction => {
    const project = appStore.projects.find((p) => p.id === projectId)
    return {
      id: crypto.randomUUID(),
      title: `Create milestone "${name}"`,
      system: "Local",
      target: project?.name || "Project",
      targetType: "milestone",
      targetId: projectId,
      changes: `New milestone due ${dueDate}`,
      included: true,
      tool: "createMilestone",
      params: { projectId, name, dueDate },
    }
  }

  const generateCreateTask = (
    projectId: string,
    milestoneId: string,
    title: string,
    assigneeId: string,
    dueDate: string,
  ): ProposedAction => {
    const assignee = appStore.associates.find((a) => a.id === assigneeId)
    return {
      id: crypto.randomUUID(),
      title: `Create task "${title}"`,
      system: "Local",
      target: title,
      targetType: "task",
      targetId: projectId,
      changes: `Assigned to ${assignee?.name}, due ${dueDate}`,
      included: true,
      tool: "createTask",
      params: { projectId, milestoneId, title, assigneeId, dueDate },
    }
  }

  const generateApproveDocument = (docId: string): ProposedAction => {
    const doc = appStore.uploads.find((u) => u.id === docId)
    return {
      id: crypto.randomUUID(),
      title: `Approve document`,
      system: "Local",
      target: doc?.fileName || "Document",
      targetType: "document",
      targetId: docId,
      changes: `Change status to Approved`,
      included: true,
      tool: "approveDocument",
      params: { docId },
    }
  }

  const generateRequestChanges = (docId: string, note: string): ProposedAction => {
    const doc = appStore.uploads.find((u) => u.id === docId)
    return {
      id: crypto.randomUUID(),
      title: `Request changes on document`,
      system: "Local",
      target: doc?.fileName || "Document",
      targetType: "document",
      targetId: docId,
      changes: `Add review note: "${note}"`,
      included: true,
      tool: "requestChanges",
      params: { docId, note },
    }
  }

  // Execute confirmed actions
  const executeAction = (action: ProposedAction) => {
    switch (action.tool) {
      case "assignPersonToProject":
        appStore.assignAssociateToProject(action.params.personId as string, action.params.projectId as string)
        break
      case "assignPersonToTask":
        appStore.updateTask(action.params.taskId as string, { assigneeId: action.params.personId as string })
        break
      case "linkDocumentToMilestone":
        appStore.updateUpload(action.params.docId as string, { milestoneId: action.params.milestoneId as string })
        break
      case "createMilestone": {
        const newMilestone: Milestone = {
          id: `m${Date.now()}`,
          title: action.params.name as string,
          projectId: action.params.projectId as string,
          startDate: new Date().toISOString().split("T")[0],
          dueDate: action.params.dueDate as string,
          status: "not-started",
          completion: 0,
          blockers: [],
          tasks: [],
        }
        appStore.addMilestone(newMilestone)
        break
      }
      case "createTask": {
        const newTask: Task = {
          id: `t${Date.now()}`,
          title: action.params.title as string,
          projectId: action.params.projectId as string,
          milestoneId: action.params.milestoneId as string,
          assigneeId: action.params.assigneeId as string,
          status: "todo",
          priority: "medium",
          dueDate: action.params.dueDate as string,
        }
        appStore.addTask(newTask)
        break
      }
      case "approveDocument":
        appStore.updateUpload(action.params.docId as string, { status: "Approved" })
        break
      case "requestChanges":
        appStore.updateUpload(action.params.docId as string, {
          status: "Rejected",
          reviewNote: action.params.note as string,
        })
        break
    }
  }

  return {
    lookupTaskUpdate,
    summarizeProject,
    getUpcomingDueDates,
    getBlockers,
    summarizeDocument,
    generateAssignPersonToProject,
    generateAssignPersonToTask,
    generateLinkDocumentToMilestone,
    generateCreateMilestone,
    generateCreateTask,
    generateApproveDocument,
    generateRequestChanges,
    executeAction,
  }
}
