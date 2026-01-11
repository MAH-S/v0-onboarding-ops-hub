"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { Upload, UserPlus, Flag, StickyNote, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function QuickActions() {
  const { projects, associates, addNote, assignAssociateToProject } = useAppStore()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedAssociate, setSelectedAssociate] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteType, setNoteType] = useState<"Costing" | "Client" | "Finance" | "Risk">("Client")

  const handleAssign = () => {
    if (selectedProject && selectedAssociate) {
      assignAssociateToProject(selectedAssociate, selectedProject)
      toast.success("Associate assigned to project")
      setAssignDialogOpen(false)
      setSelectedProject("")
      setSelectedAssociate("")
    }
  }

  const handleAddNote = () => {
    if (selectedProject && noteContent) {
      addNote({
        id: `n${Date.now()}`,
        content: noteContent,
        type: noteType,
        authorId: "manager",
        authorName: "Manager User",
        createdAt: new Date().toISOString(),
        projectId: selectedProject,
      })
      toast.success("Note added to project")
      setNoteDialogOpen(false)
      setSelectedProject("")
      setNoteContent("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common operations</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
          <a href="/uploads">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload</span>
          </a>
        </Button>

        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Assign</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Associate to Project</DialogTitle>
              <DialogDescription>Select an associate and project to create an assignment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Associate</Label>
                <Select value={selectedAssociate} onValueChange={setSelectedAssociate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select associate" />
                  </SelectTrigger>
                  <SelectContent>
                    {associates.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p) => p.status !== "Closed")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} className="w-full">
                Assign
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
          <a href="/milestones">
            <Flag className="h-5 w-5" />
            <span className="text-xs">Milestone</span>
          </a>
        </Button>

        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
              <StickyNote className="h-5 w-5" />
              <span className="text-xs">Add Note</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Project Note</DialogTitle>
              <DialogDescription>Add a note to a project for tracking and communication.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p) => p.status !== "Closed")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note Type</Label>
                <Select
                  value={noteType}
                  onValueChange={(v) => setNoteType(v as "Costing" | "Client" | "Finance" | "Risk")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Costing">Costing</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note..."
                  rows={4}
                />
              </div>
              <Button onClick={handleAddNote} className="w-full">
                Add Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
