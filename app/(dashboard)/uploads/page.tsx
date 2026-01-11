"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { Upload, FileText, MessageSquare, Check, X, Send, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function UploadsPage() {
  const { uploads, projects, associates, updateUpload } = useAppStore()
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [associateFilter, setAssociateFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null)

  const filteredUploads = uploads.filter((upload) => {
    if (projectFilter !== "all" && upload.projectId !== projectFilter) return false
    if (associateFilter !== "all" && upload.uploadedById !== associateFilter) return false
    if (typeFilter !== "all" && upload.type !== typeFilter) return false
    if (statusFilter !== "all" && upload.status !== statusFilter) return false
    if (dateFrom && new Date(upload.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(upload.date) > new Date(dateTo)) return false
    return true
  })

  const selectedUpload = uploads.find((u) => u.id === selectedUploadId)
  const selectedProject = projects.find((p) => p.id === selectedUpload?.projectId)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUploads(filteredUploads.map((u) => u.id))
    } else {
      setSelectedUploads([])
    }
  }

  const handleSelectUpload = (uploadId: string, checked: boolean) => {
    if (checked) {
      setSelectedUploads([...selectedUploads, uploadId])
    } else {
      setSelectedUploads(selectedUploads.filter((id) => id !== uploadId))
    }
  }

  const handleBulkAction = (action: "approve" | "reject" | "finance") => {
    selectedUploads.forEach((id) => {
      if (action === "approve") {
        updateUpload(id, { status: "Approved" })
      } else if (action === "reject") {
        updateUpload(id, { status: "Rejected" })
      }
    })
    toast.success(
      `${action === "finance" ? "Sent to finance" : action === "approve" ? "Approved" : "Rejected"} ${selectedUploads.length} documents`,
    )
    setSelectedUploads([])
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
        <p className="text-muted-foreground">Central hub for all quotes and invoices</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                All Documents
              </CardTitle>
              <CardDescription>
                {filteredUploads.length} document{filteredUploads.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={associateFilter} onValueChange={setAssociateFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Associate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Associates</SelectItem>
                  {associates.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Quote">Quote</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">From:</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">To:</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-[140px]" />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                }}
              >
                Clear dates
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedUploads.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">{selectedUploads.length} selected</span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("reject")}
                  className="bg-transparent"
                >
                  <X className="mr-1 h-4 w-4" />
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("approve")}
                  className="bg-transparent"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("finance")}>
                  <Send className="mr-1 h-4 w-4" />
                  Send to Finance
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedUploads.length === filteredUploads.length && filteredUploads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUploads.map((upload) => {
                const project = projects.find((p) => p.id === upload.projectId)
                return (
                  <TableRow key={upload.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUploads.includes(upload.id)}
                        onCheckedChange={(checked) => handleSelectUpload(upload.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {upload.fileName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {project ? (
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{upload.vendor}</TableCell>
                    <TableCell className="text-right">
                      {upload.currency} {upload.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {upload.date}
                      </div>
                    </TableCell>
                    <TableCell>{upload.uploadedBy}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(upload.status)}>{upload.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedUploadId(upload.id)
                          setSidePanelOpen(true)
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredUploads.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">No documents found matching your filters</div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sidePanelOpen} onOpenChange={setSidePanelOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Document Details</SheetTitle>
            <SheetDescription>View linked project and milestone information</SheetDescription>
          </SheetHeader>
          {selectedUpload && (
            <div className="mt-6 space-y-6">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium">Document Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File</span>
                    <span>{selectedUpload.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{selectedUpload.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span>
                      {selectedUpload.currency} {selectedUpload.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={getStatusVariant(selectedUpload.status)}>{selectedUpload.status}</Badge>
                  </div>
                </div>
              </div>

              {selectedProject && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Linked Project</h4>
                  <Link href={`/projects/${selectedProject.id}`} className="text-primary hover:underline">
                    {selectedProject.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedProject.client}</p>
                </div>
              )}

              {selectedUpload.reviewNote && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Review Note</h4>
                  <p className="text-sm">{selectedUpload.reviewNote}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    updateUpload(selectedUpload.id, { status: "Rejected" })
                    toast.success("Document rejected")
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    updateUpload(selectedUpload.id, { status: "Approved" })
                    toast.success("Document approved")
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
