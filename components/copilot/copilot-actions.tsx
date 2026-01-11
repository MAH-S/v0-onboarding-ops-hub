"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useCopilotStore } from "@/lib/copilot-store"
import { useCopilotTools } from "@/lib/copilot-tools"
import { FolderKanban, ListTodo, Flag, FileText, Check, X } from "lucide-react"
import { toast } from "sonner"

export function CopilotActions() {
  const { proposedActions, toggleActionIncluded, clearActions, setActiveTab } = useCopilotStore()
  const tools = useCopilotTools()

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "project":
        return <FolderKanban className="h-4 w-4" />
      case "task":
        return <ListTodo className="h-4 w-4" />
      case "milestone":
        return <Flag className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleConfirm = () => {
    const includedActions = proposedActions.filter((a) => a.included)
    includedActions.forEach((action) => {
      tools.executeAction(action)
    })
    toast.success(`Applied ${includedActions.length} action${includedActions.length !== 1 ? "s" : ""}`)
    clearActions()
    setActiveTab("chat")
  }

  const handleCancel = () => {
    clearActions()
    setActiveTab("chat")
  }

  if (proposedActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Check className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No pending actions</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Use "Do" mode in the Chat tab to generate actions like assigning people, approving documents, or creating
          tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Proposed Actions</h3>
        <Badge variant="secondary">{proposedActions.filter((a) => a.included).length} selected</Badge>
      </div>

      <div className="space-y-3">
        {proposedActions.map((action) => (
          <Card key={action.id} className={action.included ? "border-primary" : "opacity-60"}>
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={action.included}
                  onCheckedChange={() => toggleActionIncluded(action.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <CardDescription className="text-xs mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {action.system}
                    </Badge>
                    <span className="flex items-center gap-1">
                      {getTargetIcon(action.targetType)}
                      {action.target}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 pl-9">
              <p className="text-xs text-muted-foreground">{action.changes}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={handleConfirm} disabled={!proposedActions.some((a) => a.included)}>
          <Check className="h-4 w-4 mr-1" />
          Confirm & Apply
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
