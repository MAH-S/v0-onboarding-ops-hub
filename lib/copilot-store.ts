"use client"

import { create } from "zustand"
import type { Project, Task, Upload, Milestone } from "./mock-data"

export type CopilotScope = "global" | "project" | "task" | "document"

export interface CopilotContext {
  scope: CopilotScope
  project?: Project
  task?: Task
  document?: Upload
  milestone?: Milestone
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  mode?: "ask" | "do"
  sources?: CopilotSource[]
}

export interface CopilotSource {
  type: "monday" | "document" | "note"
  id: string
  label: string
}

export interface ProposedAction {
  id: string
  title: string
  system: "Local" | "monday"
  target: string
  targetType: "project" | "task" | "milestone" | "document"
  targetId: string
  changes: string
  included: boolean
  tool: string
  params: Record<string, unknown>
}

interface CopilotState {
  isOpen: boolean
  isPinned: boolean
  activeTab: "chat" | "actions" | "sources"
  context: CopilotContext
  messages: ChatMessage[]
  proposedActions: ProposedAction[]
  isThinking: boolean
  sources: CopilotSource[]

  // Actions
  openCopilot: () => void
  closeCopilot: () => void
  togglePinned: () => void
  setActiveTab: (tab: "chat" | "actions" | "sources") => void
  setContext: (context: CopilotContext) => void
  setScope: (scope: CopilotScope) => void
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  clearMessages: () => void
  setProposedActions: (actions: ProposedAction[]) => void
  toggleActionIncluded: (actionId: string) => void
  clearActions: () => void
  setIsThinking: (thinking: boolean) => void
  setSources: (sources: CopilotSource[]) => void
}

export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: false,
  isPinned: false,
  activeTab: "chat",
  context: { scope: "global" },
  messages: [],
  proposedActions: [],
  isThinking: false,
  sources: [],

  openCopilot: () => set({ isOpen: true }),
  closeCopilot: () => set((state) => (state.isPinned ? state : { isOpen: false })),
  togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setContext: (context) => set({ context }),
  setScope: (scope) => set((state) => ({ context: { ...state.context, scope } })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: crypto.randomUUID(), timestamp: new Date() }],
    })),
  clearMessages: () => set({ messages: [] }),
  setProposedActions: (actions) => set({ proposedActions: actions, activeTab: "actions" }),
  toggleActionIncluded: (actionId) =>
    set((state) => ({
      proposedActions: state.proposedActions.map((a) => (a.id === actionId ? { ...a, included: !a.included } : a)),
    })),
  clearActions: () => set({ proposedActions: [] }),
  setIsThinking: (thinking) => set({ isThinking: thinking }),
  setSources: (sources) => set({ sources }),
}))
