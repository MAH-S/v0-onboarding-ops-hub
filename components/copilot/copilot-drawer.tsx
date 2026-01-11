"use client"

import { useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pin, PinOff, X } from "lucide-react"
import { useCopilotStore } from "@/lib/copilot-store"
import { CopilotContextCard } from "./copilot-context-card"
import { CopilotChat } from "./copilot-chat"
import { CopilotActions } from "./copilot-actions"
import { CopilotSources } from "./copilot-sources"

export function CopilotDrawer() {
  const { isOpen, isPinned, activeTab, closeCopilot, togglePinned, setActiveTab, proposedActions, sources } =
    useCopilotStore()

  // Keyboard shortcut: Ctrl+/
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        useCopilotStore.getState().isOpen
          ? useCopilotStore.getState().closeCopilot()
          : useCopilotStore.getState().openCopilot()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCopilot()}>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col p-0 gap-0 [&>button]:hidden" side="right">
        <SheetHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Copilot
          </SheetTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={togglePinned}
              title={isPinned ? "Unpin drawer" : "Pin drawer"}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeCopilot}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="px-4 py-3 border-b">
          <CopilotContextCard />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3 shrink-0">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="actions" className="relative">
              Actions
              {proposedActions.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 w-5 rounded-full p-0 text-xs">
                  {proposedActions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sources" className="relative">
              Sources
              {sources.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 w-5 rounded-full p-0 text-xs">
                  {sources.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="chat"
            className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col"
          >
            <CopilotChat />
          </TabsContent>

          <TabsContent value="actions" className="flex-1 overflow-auto m-0 p-4">
            <CopilotActions />
          </TabsContent>

          <TabsContent value="sources" className="flex-1 overflow-auto m-0 p-4">
            <CopilotSources />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
