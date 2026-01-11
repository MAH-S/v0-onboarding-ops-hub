"use client"

import { Button } from "@/components/ui/button"
import { useCopilotStore, type CopilotContext } from "@/lib/copilot-store"
import { Sparkles } from "lucide-react"

interface CopilotTriggerButtonProps {
  context?: Partial<CopilotContext>
  label?: string
  variant?: "default" | "ghost" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function CopilotTriggerButton({
  context,
  label = "Ask Copilot",
  variant = "outline",
  size = "sm",
  className,
}: CopilotTriggerButtonProps) {
  const { openCopilot, setContext } = useCopilotStore()

  const handleClick = () => {
    if (context) {
      setContext({
        scope: context.scope || "global",
        project: context.project,
        task: context.task,
        document: context.document,
        milestone: context.milestone,
      })
    }
    openCopilot()
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={className}>
      <Sparkles className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}
