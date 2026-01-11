"use client"

import { Button } from "@/components/ui/button"
import { useCopilotStore } from "@/lib/copilot-store"
import { Sparkles } from "lucide-react"

export function CopilotMinibar() {
  const { isOpen, openCopilot } = useCopilotStore()

  if (isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={openCopilot}
        className="rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
        size="lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Ask Copilot...
        <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 font-mono text-xs font-medium sm:flex">
          <span className="text-xs">⌃</span>/
        </kbd>
      </Button>
    </div>
  )
}
