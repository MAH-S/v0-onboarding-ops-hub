"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { Upload, FileText, Eye, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface ProjectUploadsProps {
  projectId: string
}

export function ProjectUploads({ projectId }: ProjectUploadsProps) {
  const { uploads, addUpload, updateUpload } = useAppStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const [newUpload, setNewUpload] = useState({
    fileName: "",
    type: "Quote" as "Quote" | "Invoice",
    vendor: "",
    amount: "",
    currency: "USD",
  })

  const projectUploads = uploads.filter((u) => u.projectId === projectId)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setNewUpload((prev) => ({ ...prev, fileName: files[0].name }))
      setUploadDialogOpen(true)
    }
  }, [])

  const handleUpload = () => {
    if (!newUpload.fileName || !newUpload.vendor || !newUpload.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    addUpload({
      id: `u${Date.now()}`,
      fileName: newUpload.fileName,
      type: newUpload.type,
      vendor: newUpload.vendor,
      amount: Number.parseFloat(newUpload.amount),
      currency: newUpload.currency,
      date: new Date().toISOString().split("T")[0],
      uploadedBy: "Manager User",
      uploadedById: "manager",
      status: "Pending Review",
      projectId,
    })

    setNewUpload({ fileName: "", type: "Quote", vendor: "", amount: "", currency: "USD" })
    setUploadDialogOpen(false)
    toast.success("File uploaded successfully")
  }

  const handleAddReviewNote = () => {
    if (!selectedUpload || !reviewNote.trim()) return

    updateUpload(selectedUpload, { reviewNote })
    setReviewNote("")
    setReviewDialogOpen(false)
    toast.success("Review note added")
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quotes & Invoices
            </CardTitle>
            <CardDescription>Manage project documents</CardDescription>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Add a quote or invoice to this project</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <Input
                    value={newUpload.fileName}
                    onChange={(e) => setNewUpload({ ...newUpload, fileName: e.target.value })}
                    placeholder="document.pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newUpload.type}
                    onValueChange={(v) => setNewUpload({ ...newUpload, type: v as "Quote" | "Invoice" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quote">Quote</SelectItem>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input
                    value={newUpload.vendor}
                    onChange={(e) => setNewUpload({ ...newUpload, vendor: e.target.value })}
                    placeholder="Vendor name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={newUpload.amount}
                      onChange={(e) => setNewUpload({ ...newUpload, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={newUpload.currency}
                      onValueChange={(v) => setNewUpload({ ...newUpload, currency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleUpload} className="w-full">
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag and drop files here, or click Upload above</p>
        </div>

        {projectUploads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">{upload.fileName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{upload.type}</Badge>
                  </TableCell>
                  <TableCell>{upload.vendor}</TableCell>
                  <TableCell className="text-right">
                    {upload.currency} {upload.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{upload.date}</TableCell>
                  <TableCell>{upload.uploadedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(upload.status)}>{upload.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Preview: {upload.fileName}</DialogTitle>
                          </DialogHeader>
                          <div className="flex h-96 items-center justify-center rounded-lg border bg-muted">
                            <p className="text-muted-foreground">Preview not available (Prototype)</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={reviewDialogOpen && selectedUpload === upload.id}
                        onOpenChange={(open) => {
                          setReviewDialogOpen(open)
                          if (open) setSelectedUpload(upload.id)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedUpload(upload.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Review Note</DialogTitle>
                            <DialogDescription>Add a note for this document</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {upload.reviewNote && (
                              <div className="rounded-lg bg-muted p-3">
                                <p className="text-xs text-muted-foreground mb-1">Current note:</p>
                                <p className="text-sm">{upload.reviewNote}</p>
                              </div>
                            )}
                            <Textarea
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              placeholder="Enter review note..."
                              rows={3}
                            />
                            <Button onClick={handleAddReviewNote} className="w-full">
                              Save Note
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No documents uploaded yet. Drag and drop files or click Upload.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
