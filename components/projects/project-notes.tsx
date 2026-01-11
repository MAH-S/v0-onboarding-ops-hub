"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"

interface ProjectNotesProps {
  projectId: string
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const { notes, associates, addNote } = useAppStore()
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState<"Costing" | "Client" | "Finance" | "Risk">("Client")

  const projectNotes = notes
    .filter((n) => n.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAddNote = () => {
    if (!newNote.trim()) return

    addNote({
      id: `n${Date.now()}`,
      content: newNote,
      type: noteType,
      authorId: "manager",
      authorName: "Manager User",
      createdAt: new Date().toISOString(),
      projectId,
    })
    setNewNote("")
    toast.success("Note added successfully")
  }

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "Costing":
        return "bg-chart-1/10 text-chart-1"
      case "Client":
        return "bg-chart-2/10 text-chart-2"
      case "Finance":
        return "bg-chart-3/10 text-chart-3"
      case "Risk":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Project Notes
        </CardTitle>
        <CardDescription>Communication and tracking notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Select value={noteType} onValueChange={(v) => setNoteType(v as "Costing" | "Client" | "Finance" | "Risk")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Costing">Costing</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Risk">Risk</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Note type</span>
          </div>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note... (Supports markdown-style formatting)"
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {projectNotes.map((note) => {
            const author = associates.find((a) => a.id === note.authorId)
            return (
              <div key={note.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={author?.avatar || "/placeholder.svg"} alt={note.authorName} />
                      <AvatarFallback>
                        {note.authorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{note.authorName}</span>
                    <Badge variant="secondary" className={getNoteTypeColor(note.type)}>
                      {note.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            )
          })}
          {projectNotes.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">No notes yet. Add the first note above.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
