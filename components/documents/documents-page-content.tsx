"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import {
  FileText,
  FileCheck,
  FileX,
  FileClock,
  Check,
  X,
  Send,
  DollarSign,
  Search,
  Users,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  Download,
  MessageSquare,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DocumentsPageContent() {
  const { uploads, projects, associates, updateUpload } = useAppStore()
  const [activeTab, setActiveTab] = useState("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [associateFilter, setAssociateFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState("")

  // Filter uploads based on tab and filters
  const filteredUploads = useMemo(() => {
    return uploads.filter((upload) => {
      if (activeTab === "quotes" && upload.type !== "Quote") return false
      if (activeTab === "invoices" && upload.type !== "Invoice") return false
      if (activeTab === "pending" && upload.status !== "Pending Review") return false
      if (activeTab === "approved" && upload.status !== "Approved") return false
      if (activeTab === "rejected" && upload.status !== "Rejected") return false

      if (projectFilter !== "all" && upload.projectId !== projectFilter) return false
      if (associateFilter !== "all" && upload.associateId !== associateFilter) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const project = projects.find((p) => p.id === upload.projectId)
        const associate = associates.find((a) => a.id === upload.associateId)
        if (
          !upload.fileName.toLowerCase().includes(query) &&
          !(associate?.name.toLowerCase().includes(query) ?? false) &&
          !(project?.name.toLowerCase().includes(query) ?? false)
        ) {
          return false
        }
      }

      return true
    })
  }, [uploads, activeTab, projectFilter, associateFilter, searchQuery, projects, associates])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDocuments = uploads.length
    const pendingReview = uploads.filter((u) => u.status === "Pending Review").length
    const approved = uploads.filter((u) => u.status === "Approved").length
    const rejected = uploads.filter((u) => u.status === "Rejected").length

    const totalValue = uploads.reduce((sum, u) => sum + u.amount, 0)
    const pendingValue = uploads.filter((u) => u.status === "Pending Review").reduce((sum, u) => sum + u.amount, 0)
    const approvedValue = uploads.filter((u) => u.status === "Approved").reduce((sum, u) => sum + u.amount, 0)

    const quotes = uploads.filter((u) => u.type === "Quote").length
    const invoices = uploads.filter((u) => u.type === "Invoice").length

    const pendingUploads = uploads.filter((u) => u.status === "Pending Review")
    const avgAgingDays =
      pendingUploads.length > 0
        ? Math.round(
            pendingUploads.reduce((sum, u) => {
              const days = Math.floor((new Date().getTime() - new Date(u.date).getTime()) / (1000 * 60 * 60 * 24))
              return sum + days
            }, 0) / pendingUploads.length,
          )
        : 0

    return {
      totalDocuments,
      pendingReview,
      approved,
      rejected,
      totalValue,
      pendingValue,
      approvedValue,
      quotes,
      invoices,
      avgAgingDays,
    }
  }, [uploads])

  const associateBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; value: number; pending: number; name: string; avatar: string }> =
      {}
    uploads.forEach((upload) => {
      const associate = associates.find((a) => a.id === upload.associateId)
      if (!associate) return
      if (!breakdown[upload.associateId]) {
        breakdown[upload.associateId] = {
          count: 0,
          value: 0,
          pending: 0,
          name: associate.name,
          avatar: associate.avatar,
        }
      }
      breakdown[upload.associateId].count++
      breakdown[upload.associateId].value += upload.amount
      if (upload.status === "Pending Review") {
        breakdown[upload.associateId].pending++
      }
    })
    return Object.entries(breakdown)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5)
  }, [uploads, associates])

  // Recent activity
  const recentActivity = useMemo(() => {
    return [...uploads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }, [uploads])

  const selectedUpload = uploads.find((u) => u.id === selectedUploadId)
  const selectedProject = projects.find((p) => p.id === selectedUpload?.projectId)
  const selectedAssociate = associates.find((a) => a.id === selectedUpload?.associateId)

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

  const handleSingleAction = (uploadId: string, action: "approve" | "reject", note?: string) => {
    updateUpload(uploadId, {
      status: action === "approve" ? "Approved" : "Rejected",
      reviewNote: note,
    })
    toast.success(`Document ${action === "approve" ? "approved" : "rejected"}`)
    setSidePanelOpen(false)
    setReviewNote("")
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return { variant: "default" as const, icon: FileCheck, color: "text-green-600", bg: "bg-green-500/10" }
      case "Rejected":
        return { variant: "destructive" as const, icon: FileX, color: "text-red-600", bg: "bg-red-500/10" }
      default:
        return { variant: "secondary" as const, icon: FileClock, color: "text-amber-600", bg: "bg-amber-500/10" }
    }
  }

  const getAgingBadge = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
    if (days > 7)
      return (
        <Badge variant="destructive" className="text-xs">
          {days}d overdue
        </Badge>
      )
    if (days > 3)
      return (
        <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700">
          {days}d
        </Badge>
      )
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents Hub</h1>
          <p className="text-muted-foreground">Manage quotes, invoices, and financial documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold">{kpis.totalDocuments}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {kpis.quotes} quotes, {kpis.invoices} invoices
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600">{kpis.pendingReview}</p>
                <p className="mt-1 text-xs text-muted-foreground">${kpis.pendingValue.toLocaleString()} value</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <FileClock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            {kpis.avgAgingDays > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Avg. {kpis.avgAgingDays} days aging
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{kpis.approved}</p>
                <p className="mt-1 text-xs text-muted-foreground">${kpis.approvedValue.toLocaleString()} value</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {kpis.totalDocuments > 0 && (
              <div className="mt-3">
                <Progress value={(kpis.approved / kpis.totalDocuments) * 100} className="h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((kpis.approved / kpis.totalDocuments) * 100)}% approval rate
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold">${(kpis.totalValue / 1000).toFixed(0)}k</p>
                <p className="mt-1 text-xs text-muted-foreground">Across all documents</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Documents Table - 3 columns */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    {filteredUploads.length} document{filteredUploads.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-[200px] pl-8"
                    />
                  </div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="h-9 w-[150px]">
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
                    <SelectTrigger className="h-9 w-[150px]">
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="gap-2">
                    All
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {uploads.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="quotes" className="gap-2">
                    <Receipt className="h-3.5 w-3.5" />
                    Quotes
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {kpis.quotes}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="gap-2">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Invoices
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {kpis.invoices}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="gap-2">
                    <FileClock className="h-3.5 w-3.5" />
                    Pending
                    <Badge variant="secondary" className="ml-1 h-5 bg-amber-500/20 px-1.5 text-amber-700">
                      {kpis.pendingReview}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="gap-2">
                    <FileCheck className="h-3.5 w-3.5" />
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="gap-2">
                    <FileX className="h-3.5 w-3.5" />
                    Rejected
                  </TabsTrigger>
                </TabsList>

                {/* Bulk Actions Bar */}
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
                        Reject
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

                <TabsContent value={activeTab} className="m-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox
                              checked={selectedUploads.length === filteredUploads.length && filteredUploads.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Associate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUploads.map((upload) => {
                          const project = projects.find((p) => p.id === upload.projectId)
                          const associate = associates.find((a) => a.id === upload.associateId)
                          const statusConfig = getStatusConfig(upload.status)
                          const StatusIcon = statusConfig.icon

                          return (
                            <TableRow
                              key={upload.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => {
                                setSelectedUploadId(upload.id)
                                setSidePanelOpen(true)
                              }}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedUploads.includes(upload.id)}
                                  onCheckedChange={(checked) => handleSelectUpload(upload.id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${statusConfig.bg}`}
                                  >
                                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{upload.fileName}</p>
                                    <p className="text-xs text-muted-foreground">{upload.type}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {project ? (
                                  <Link
                                    href={`/projects/${project.id}`}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {project.name}
                                    <ArrowUpRight className="h-3 w-3" />
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {associate ? (
                                  <Link
                                    href={`/associates/${associate.id}`}
                                    className="flex items-center gap-2 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {associate.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{associate.name}</span>
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${upload.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{new Date(upload.date).toLocaleDateString()}</span>
                                  {upload.status === "Pending Review" && getAgingBadge(upload.date)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusConfig.variant}>{upload.status}</Badge>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUploadId(upload.id)
                                        setSidePanelOpen(true)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {upload.status === "Pending Review" && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleSingleAction(upload.id, "approve")}>
                                          <Check className="mr-2 h-4 w-4 text-green-600" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSingleAction(upload.id, "reject")}>
                                          <X className="mr-2 h-4 w-4 text-red-600" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {filteredUploads.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No documents found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Top Associates
              </CardTitle>
              <CardDescription>By document value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {associateBreakdown.map(([id, data]) => (
                <div key={id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/associates/${id}`} className="flex items-center gap-2 hover:underline">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={data.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {data.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{data.name}</span>
                    </Link>
                    <span className="text-sm text-muted-foreground">{data.count} docs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(data.value / Math.max(...associateBreakdown.map(([, d]) => d.value))) * 100}
                      className="h-1.5"
                    />
                    <span className="text-xs font-medium">${(data.value / 1000).toFixed(0)}k</span>
                  </div>
                  {data.pending > 0 && <p className="text-xs text-amber-600">{data.pending} pending review</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((upload) => {
                  const associate = associates.find((a) => a.id === upload.associateId)
                  return (
                    <div key={upload.id} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getStatusConfig(upload.status).bg}`}
                      >
                        {(() => {
                          const Icon = getStatusConfig(upload.status).icon
                          return <Icon className={`h-4 w-4 ${getStatusConfig(upload.status).color}`} />
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{upload.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {associate?.name || "Unknown"} • {new Date(upload.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {kpis.avgAgingDays > 5 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-900">Aging Documents Alert</p>
                    <p className="mt-1 text-sm text-amber-700">
                      {kpis.pendingReview} documents have been pending for an average of {kpis.avgAgingDays} days.
                      Consider reviewing them soon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel for Document Details */}
      <Sheet open={sidePanelOpen} onOpenChange={setSidePanelOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedUpload && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedUpload.fileName}</SheetTitle>
                <SheetDescription>Document details and review options</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Amount Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-3xl font-bold">${selectedUpload.amount.toLocaleString()}</p>
                      </div>
                      <Badge variant={getStatusConfig(selectedUpload.status).variant} className="text-sm">
                        {selectedUpload.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedUpload.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium">{selectedUpload.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upload Date</p>
                    <p className="font-medium">{new Date(selectedUpload.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uploaded By</p>
                    <p className="font-medium">{selectedUpload.uploadedBy}</p>
                  </div>
                </div>

                {selectedAssociate && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Associate</p>
                    <Link
                      href={`/associates/${selectedAssociate.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedAssociate.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {selectedAssociate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedAssociate.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedAssociate.role}</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                )}

                {/* Linked Project */}
                {selectedProject && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Linked Project</p>
                    <Link
                      href={`/projects/${selectedProject.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{selectedProject.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedProject.client}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </div>
                )}

                {/* Review Notes */}
                {selectedUpload.status === "Pending Review" && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Review Notes</p>
                    <Textarea
                      placeholder="Add notes about this document..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {selectedUpload.status === "Pending Review" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleSingleAction(selectedUpload.id, "reject", reviewNote)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleSingleAction(selectedUpload.id, "approve", reviewNote)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}

                {/* Existing Review Note */}
                {selectedUpload.reviewNote && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Review Note</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedUpload.reviewNote}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
