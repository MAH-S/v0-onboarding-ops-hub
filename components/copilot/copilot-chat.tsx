"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCopilotStore } from "@/lib/copilot-store"
import { useCopilotTools } from "@/lib/copilot-tools"
import { useAppStore } from "@/lib/store"
import { Send, Loader2, Sparkles, MessageSquare, Zap } from "lucide-react"

export function CopilotChat() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<"ask" | "do">("ask")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { context, messages, isThinking, addMessage, setIsThinking, setProposedActions, setSources } = useCopilotStore()
  const tools = useCopilotTools()
  const { projects, tasks, milestones, uploads, associates } = useAppStore()

  const getSuggestedPrompts = () => {
    if (context.scope === "project" && context.project) {
      return ["Summarize this project", "What's blocking progress?", "What's due in the next 7 days?"]
    }
    if (context.scope === "task" && context.task) {
      return ["What's the last update?", "Who should be assigned?", "Draft a status update"]
    }
    if (context.scope === "document" && context.document) {
      return ["Summarize this invoice", "Is anything missing?", "Link this to a milestone"]
    }
    return ["Show projects at risk", "Who has the most open tasks?", "What needs my attention today?"]
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const handleSend = async () => {
    if (!input.trim()) return

    addMessage({ role: "user", content: input, mode })
    const userQuery = input.toLowerCase()
    setInput("")
    setIsThinking(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    let response = ""
    const sources: { type: "monday" | "document" | "note"; id: string; label: string }[] = []

    // Handle different query types based on context and mode
    if (mode === "do") {
      // Generate proposed actions for "Do" mode
      const actions = []

      if (userQuery.includes("assign") && context.project) {
        // Find person mentioned
        const personMatch = associates.find((a) => userQuery.includes(a.name.toLowerCase().split(" ")[0].toLowerCase()))
        if (personMatch) {
          actions.push(tools.generateAssignPersonToProject(personMatch.id, context.project.id))
          response = `I'll assign ${personMatch.name} to ${context.project.name}. Please review and confirm the action.`
        }
      } else if (userQuery.includes("approve") && context.document) {
        actions.push(tools.generateApproveDocument(context.document.id))
        response = `I'll approve ${context.document.fileName}. Please review and confirm the action.`
      } else if (userQuery.includes("link") && context.document) {
        const milestone = milestones.find((m) => m.projectId === context.document?.projectId)
        if (milestone) {
          actions.push(tools.generateLinkDocumentToMilestone(context.document.id, milestone.id))
          response = `I'll link ${context.document.fileName} to ${milestone.title}. Please review and confirm.`
        }
      } else if (userQuery.includes("request changes") && context.document) {
        actions.push(tools.generateRequestChanges(context.document.id, "Please provide additional details"))
        response = `I'll request changes on ${context.document.fileName}. Please review and confirm.`
      } else {
        response =
          "I couldn't determine what action to take. Try being more specific, like 'Assign Sarah to this project' or 'Approve this document'."
      }

      if (actions.length > 0) {
        setProposedActions(actions)
      }
    } else {
      // Handle "Ask" mode queries
      if (userQuery.includes("summarize") && context.scope === "project" && context.project) {
        const result = tools.summarizeProject(context.project.id)
        if (result.found && result.summary) {
          const s = result.summary
          response =
            `**${s.name}** (${s.client})\n\n` +
            `**Health:** ${s.health} | **Progress:** ${s.progress}%\n` +
            `**Days Remaining:** ${s.daysRemaining}\n\n` +
            `**Team:** ${s.leads.join(", ")}\n` +
            `**Tasks:** ${s.completedTasks} completed, ${s.openTasks} open\n` +
            `**Milestones:** ${s.milestonesCompleted}/${s.totalMilestones} completed\n` +
            `**Pending Documents:** ${s.pendingUploads}\n` +
            (s.blockers.length > 0 ? `\n**Blockers:**\n${s.blockers.map((b) => `- ${b}`).join("\n")}` : "")

          sources.push({ type: "monday", id: context.project.id, label: `Project: ${s.name}` })
        }
      } else if (userQuery.includes("blocking") || userQuery.includes("blockers")) {
        if (context.scope === "project" && context.project) {
          const result = tools.getBlockers(context.project.id)
          if (result.blockers.length > 0 || result.overdueTasks.length > 0) {
            response = "**Blockers Found:**\n\n"
            if (result.blockers.length > 0) {
              response += result.blockers.map((b) => `- **${b.milestone}:** ${b.blocker}`).join("\n")
            }
            if (result.overdueTasks.length > 0) {
              response += `\n\n**Overdue Tasks (${result.overdueTasks.length}):**\n`
              response += result.overdueTasks
                .map((t) => `- ${t.title} (due ${new Date(t.dueDate).toLocaleDateString()})`)
                .join("\n")
            }
            result.overdueTasks.forEach((t) => sources.push({ type: "monday", id: t.id, label: `Task: ${t.title}` }))
          } else {
            response = "No blockers found for this project."
          }
        }
      } else if (userQuery.includes("due") && userQuery.includes("7 days")) {
        if (context.scope === "project" && context.project) {
          const result = tools.getUpcomingDueDates(context.project.id, 7)
          response = "**Due in the next 7 days:**\n\n"
          if (result.tasks.length > 0) {
            response +=
              "**Tasks:**\n" +
              result.tasks.map((t) => `- ${t.title} (${new Date(t.dueDate).toLocaleDateString()})`).join("\n")
            result.tasks.forEach((t) => sources.push({ type: "monday", id: t.id, label: `Task: ${t.title}` }))
          }
          if (result.milestones.length > 0) {
            response +=
              "\n\n**Milestones:**\n" +
              result.milestones.map((m) => `- ${m.title} (${new Date(m.dueDate).toLocaleDateString()})`).join("\n")
            result.milestones.forEach((m) => sources.push({ type: "monday", id: m.id, label: `Milestone: ${m.title}` }))
          }
          if (result.tasks.length === 0 && result.milestones.length === 0) {
            response = "Nothing due in the next 7 days."
          }
        }
      } else if (userQuery.includes("summarize") && context.scope === "document" && context.document) {
        const result = tools.summarizeDocument(context.document.id)
        if (result.found && result.document) {
          const d = result.document
          response =
            `**${d.fileName}**\n\n` +
            `**Type:** ${d.type} | **Status:** ${d.status}\n` +
            `**Vendor:** ${d.vendor}\n` +
            `**Amount:** $${d.amount.toLocaleString()} ${d.currency}\n` +
            `**Uploaded by:** ${d.uploadedBy} on ${new Date(d.date).toLocaleDateString()}\n` +
            `**Project:** ${d.project}\n` +
            (d.milestone ? `**Milestone:** ${d.milestone}\n` : "") +
            (d.reviewNote ? `\n**Review Note:** ${d.reviewNote}` : "")
          sources.push({ type: "document", id: context.document.id, label: d.fileName })
        }
      } else if (userQuery.includes("last update") && context.scope === "task" && context.task) {
        const result = tools.lookupTaskUpdate(context.task.id)
        if (result.found && result.task) {
          const t = result.task
          response =
            `**${t.title}**\n\n` +
            `**Status:** ${t.status}\n` +
            `**Assignee:** ${t.assignee}\n` +
            `**Due:** ${new Date(t.dueDate).toLocaleDateString()}\n` +
            `**Last Activity:** ${t.lastUpdate !== "No updates yet" ? new Date(t.lastUpdate).toLocaleString() : t.lastUpdate}\n` +
            (t.cycleTime ? `**Cycle Time:** ${t.cycleTime} days` : "")
          sources.push({ type: "monday", id: context.task.id, label: `Task: ${t.title}` })
        }
      } else if (userQuery.includes("at risk") || userQuery.includes("attention")) {
        const riskyProjects = projects.filter(
          (p) => p.health === "at-risk" || p.health === "critical-risk" || p.avgCycleTime > 3,
        )
        const overdueTasks = tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date())

        response = "**Items Needing Attention:**\n\n"
        if (riskyProjects.length > 0) {
          response +=
            "**Projects at Risk:**\n" + riskyProjects.map((p) => `- ${p.name} (${p.health ?? "unknown"})`).join("\n")
          riskyProjects.forEach((p) => sources.push({ type: "monday", id: p.id, label: `Project: ${p.name}` }))
        }
        if (overdueTasks.length > 0) {
          response +=
            "\n\n**Overdue Tasks:**\n" +
            overdueTasks
              .slice(0, 5)
              .map((t) => `- ${t.title}`)
              .join("\n")
          overdueTasks.slice(0, 5).forEach((t) => sources.push({ type: "monday", id: t.id, label: `Task: ${t.title}` }))
        }
      } else if (userQuery.includes("open tasks") || userQuery.includes("most tasks")) {
        const sortedAssociates = [...associates].sort((a, b) => b.openTasks - a.openTasks)
        response =
          "**Associates by Open Tasks:**\n\n" +
          sortedAssociates
            .map((a, i) => `${i + 1}. **${a.name}** - ${a.openTasks} open tasks (${a.activeProjects} projects)`)
            .join("\n")
      } else {
        response =
          "I'm not sure how to help with that. Try asking me to:\n\n" +
          "- Summarize this project\n" +
          "- What's blocking progress?\n" +
          "- What's due in the next 7 days?\n" +
          "- Show projects at risk\n\n" +
          "Or use **Do** mode to take actions like assigning people or approving documents."
      }
    }

    setSources(sources)
    addMessage({ role: "assistant", content: response, sources })
    setIsThinking(false)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">How can I help?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
              Ask me about projects, tasks, or documents. Use "Do" mode to take actions.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {getSuggestedPrompts().map((prompt) => (
                <Badge
                  key={prompt}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.mode && (
                    <Badge variant="outline" className="mb-1 text-xs">
                      {message.mode === "ask" ? (
                        <MessageSquare className="h-3 w-3 mr-1" />
                      ) : (
                        <Zap className="h-3 w-3 mr-1" />
                      )}
                      {message.mode}
                    </Badge>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - pinned at bottom */}
      <div className="shrink-0 p-4 border-t bg-background">
        <div className="flex gap-2 mb-3">
          <Button
            variant={mode === "ask" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("ask")}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask
          </Button>
          <Button
            variant={mode === "do" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("do")}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-1" />
            Do
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "ask" ? "Ask a question..." : "Describe what to do..."}
            className="min-h-[60px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button size="icon" className="shrink-0 h-[60px]" onClick={handleSend} disabled={!input.trim() || isThinking}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
