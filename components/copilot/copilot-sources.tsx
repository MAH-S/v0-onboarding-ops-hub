"use client"

import { Badge } from "@/components/ui/badge"
import { useCopilotStore } from "@/lib/copilot-store"
import { useRouter } from "next/navigation"
import { FolderKanban, FileText, StickyNote, ExternalLink } from "lucide-react"

export function CopilotSources() {
  const { sources } = useCopilotStore()
  const router = useRouter()

  const groupedSources = {
    monday: sources.filter((s) => s.type === "monday"),
    documents: sources.filter((s) => s.type === "document"),
    notes: sources.filter((s) => s.type === "note"),
  }

  const handleSourceClick = (source: { type: string; id: string }) => {
    // Simulate navigation based on source type
    switch (source.type) {
      case "monday":
        if (source.id.startsWith("p")) {
          router.push(`/projects/${source.id}`)
        } else if (source.id.startsWith("t")) {
          // Navigate to project containing the task
          router.push("/projects")
        } else if (source.id.startsWith("m")) {
          router.push("/milestones")
        }
        break
      case "document":
        router.push("/uploads")
        break
      case "note":
        // Stay on current page, notes are inline
        break
    }
    useCopilotStore.getState().closeCopilot()
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <StickyNote className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No sources yet</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          When Copilot answers questions, the sources it used will appear here. Click on any source to navigate to it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedSources.monday.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
            <FolderKanban className="h-3 w-3" />
            monday.com Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {groupedSources.monday.map((source) => (
              <Badge
                key={source.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSourceClick(source)}
              >
                {source.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {groupedSources.documents.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Document Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {groupedSources.documents.map((source) => (
              <Badge
                key={source.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSourceClick(source)}
              >
                {source.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {groupedSources.notes.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
            <StickyNote className="h-3 w-3" />
            Note Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {groupedSources.notes.map((source) => (
              <Badge
                key={source.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSourceClick(source)}
              >
                {source.label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
