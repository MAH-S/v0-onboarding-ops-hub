"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  Building2,
  Briefcase,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Plus,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useRevenueStore } from "@/lib/revenue-store"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function RevenuePageContent() {
  const router = useRouter()
  const { projects, clients, associates } = useAppStore()
  const {
    projectRevenue,
    assignments,
    getAllProjectRevenueCalculations,
    getAllAssociateRevenueCalculations,
    addProjectRevenue,
  } = useRevenueStore()

  const [activeTab, setActiveTab] = useState("projects")
  const [searchQuery, setSearchQuery] = useState("")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [contractValue, setContractValue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Calculate all revenues
  const projectCalculations = useMemo(() => getAllProjectRevenueCalculations(), [projectRevenue, assignments])
  const associateCalculations = useMemo(() => getAllAssociateRevenueCalculations(), [assignments])

  const availableProjects = useMemo(() => {
    const trackedProjectIds = new Set(projectRevenue.map((pr) => pr.projectId))
    return projects.filter((p) => !trackedProjectIds.has(p.id))
  }, [projects, projectRevenue])

  // Filter projects
  const filteredProjectCalcs = useMemo(() => {
    return projectCalculations.filter((calc) => {
      const project = projects.find((p) => p.id === calc.projectId)
      const pr = projectRevenue.find((r) => r.projectId === calc.projectId)
      if (!project || !pr) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!project.name.toLowerCase().includes(query) && !project.client.toLowerCase().includes(query)) {
          return false
        }
      }

      if (clientFilter !== "all" && project.client !== clientFilter) return false
      if (statusFilter !== "all" && pr.status !== statusFilter) return false

      return true
    })
  }, [projectCalculations, projects, projectRevenue, searchQuery, clientFilter, statusFilter])

  // Summary calculations
  const summary = useMemo(() => {
    const totalRevenue = filteredProjectCalcs.reduce((sum, c) => sum + c.revenue, 0)
    const totalCost = filteredProjectCalcs.reduce((sum, c) => sum + c.totalCost, 0)
    const totalMargin = filteredProjectCalcs.reduce((sum, c) => sum + c.grossMargin, 0)
    const avgMargin = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0
    const activeProjects = filteredProjectCalcs.filter((c) => {
      const pr = projectRevenue.find((r) => r.projectId === c.projectId)
      return pr?.status === "active"
    }).length
    const totalAssignments = filteredProjectCalcs.reduce((sum, c) => sum + c.assignmentCount, 0)
    return { totalRevenue, totalCost, totalMargin, avgMargin, activeProjects, totalAssignments }
  }, [filteredProjectCalcs, projectRevenue])

  // Associate summary
  const associateSummary = useMemo(() => {
    const totalCost = associateCalculations.reduce((sum, c) => sum + c.totalCost, 0)
    const totalProjects = new Set(assignments.map((a) => a.projectId)).size
    const avgDailyCost =
      associateCalculations.reduce((sum, c) => sum + c.avgCostPerDay, 0) / (associateCalculations.length || 1)
    const totalHours = associateCalculations.reduce((sum, c) => sum + c.totalHours, 0)
    return { totalCost, totalProjects, avgDailyCost, totalHours }
  }, [associateCalculations, assignments])

  // Get unique clients
  const uniqueClients = useMemo(() => {
    const clientNames = new Set<string>()
    projects.forEach((p) => clientNames.add(p.client))
    return Array.from(clientNames)
  }, [projects])

  // Navigate to project revenue detail page
  const handleProjectClick = (projectId: string) => {
    router.push(`/revenue/${projectId}`)
  }

  const handlePriceProject = () => {
    if (!selectedProjectId || !contractValue || !startDate || !endDate) return

    const newRevenue = {
      id: `pr${Date.now()}`,
      projectId: selectedProjectId,
      contractValue: Number.parseFloat(contractValue),
      startDate,
      endDate,
      status: "active" as const,
    }

    addProjectRevenue(newRevenue)

    // Reset form
    setSelectedProjectId("")
    setContractValue("")
    setStartDate("")
    setEndDate("")
    setPriceDialogOpen(false)
  }

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId)
  }, [projects, selectedProjectId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Tracker</h1>
          <p className="text-muted-foreground">Track project revenue, costs, and profitability</p>
        </div>

        <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Price a Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Price a Project</DialogTitle>
              <DialogDescription>
                Add a project to revenue tracking by setting its contract value and timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label htmlFor="project">Select Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        All projects are already being tracked
                      </div>
                    ) : (
                      availableProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <span>{project.name}</span>
                            <span className="text-muted-foreground">({project.client})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Project Preview */}
              {selectedProject && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedProject.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedProject.client}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedProject.lifecycle.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant={
                              selectedProject.health === "on-track"
                                ? "default"
                                : selectedProject.health === "at-risk"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {selectedProject.health.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contract Value */}
              <div className="space-y-2">
                <Label htmlFor="contractValue">Contract Value ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contractValue"
                    type="number"
                    placeholder="150,000"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              {contractValue && startDate && endDate && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Ready to add</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contract: ${Number.parseFloat(contractValue).toLocaleString()} | Duration:{" "}
                      {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                      days
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePriceProject}
                disabled={
                  !selectedProjectId || !contractValue || !startDate || !endDate || availableProjects.length === 0
                }
              >
                Add to Revenue Tracker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="projects" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="associates" className="gap-2">
            <Users className="h-4 w-4" />
            Associates
          </TabsTrigger>
        </TabsList>

        {/* Projects Revenue Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Revenue</CardTitle>
                <div className="rounded-full bg-blue-500/10 p-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">{filteredProjectCalcs.length} project(s)</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Total Cost</CardTitle>
                <div className="rounded-full bg-amber-500/10 p-2">
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">Labor + Overhead</p>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-br ${summary.totalMargin >= 0 ? "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50" : "from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50"}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={`text-sm font-medium ${summary.totalMargin >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                >
                  Gross Margin
                </CardTitle>
                <div className={`rounded-full p-2 ${summary.totalMargin >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {summary.totalMargin >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.totalMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.totalMargin)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenue - Cost</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Margin %</CardTitle>
                <div className="rounded-full bg-purple-500/10 p-2">
                  <PieChart className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${summary.avgMargin >= 20 ? "text-green-600" : summary.avgMargin >= 10 ? "text-amber-600" : "text-red-600"}`}
                >
                  {summary.avgMargin.toFixed(1)}%
                </div>
                <Progress value={Math.max(0, Math.min(100, summary.avgMargin))} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalAssignments}</div>
                <p className="text-xs text-muted-foreground mt-1">Total assignments</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label className="sr-only">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search projects or clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[180px]">
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {uniqueClients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-[150px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid/Cards for mobile, Table for desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Click a project to view detailed revenue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead className="text-right">Contract Value</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Gross Margin</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                      <TableHead className="text-center">Team</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjectCalcs.map((calc) => {
                      const project = projects.find((p) => p.id === calc.projectId)
                      const pr = projectRevenue.find((r) => r.projectId === calc.projectId)
                      if (!project || !pr) return null

                      return (
                        <TableRow
                          key={calc.projectId}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleProjectClick(calc.projectId)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2 w-2 rounded-full ${pr.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                              />
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <Badge variant={pr.status === "active" ? "default" : "secondary"} className="mt-1">
                                  {pr.status}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{project.client}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(pr.startDate)}</p>
                              <p className="text-muted-foreground">{formatDate(pr.endDate)}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(calc.revenue)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(calc.totalCost)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${calc.grossMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {calc.grossMargin >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {formatCurrency(Math.abs(calc.grossMargin))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                calc.marginPercent >= 20
                                  ? "default"
                                  : calc.marginPercent >= 10
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                calc.marginPercent >= 20
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : calc.marginPercent >= 10
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                    : ""
                              }
                            >
                              {calc.marginPercent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{calc.assignmentCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredProjectCalcs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                            <p>No projects found</p>
                            <Button variant="outline" size="sm" onClick={() => setPriceDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Price a Project
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Cards View */}
          <div className="grid gap-4 lg:hidden">
            {filteredProjectCalcs.length === 0 && (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center gap-2">
                  <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No projects found</p>
                  <Button variant="outline" size="sm" onClick={() => setPriceDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Price a Project
                  </Button>
                </CardContent>
              </Card>
            )}
            {filteredProjectCalcs.map((calc) => {
              const project = projects.find((p) => p.id === calc.projectId)
              const pr = projectRevenue.find((r) => r.projectId === calc.projectId)
              if (!project || !pr) return null

              return (
                <Card
                  key={calc.projectId}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProjectClick(calc.projectId)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${pr.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Contract</p>
                        <p className="font-semibold">{formatCurrency(calc.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost</p>
                        <p className="font-semibold">{formatCurrency(calc.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className={`font-semibold ${calc.grossMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(calc.grossMargin)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin %</p>
                        <Badge
                          variant={
                            calc.marginPercent >= 20
                              ? "default"
                              : calc.marginPercent >= 10
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            calc.marginPercent >= 20
                              ? "bg-green-100 text-green-700"
                              : calc.marginPercent >= 10
                                ? "bg-amber-100 text-amber-700"
                                : ""
                          }
                        >
                          {calc.marginPercent.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Associate Revenue Tab */}
        <TabsContent value="associates" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  Total Labor Cost
                </CardTitle>
                <div className="rounded-full bg-indigo-500/10 p-2">
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(associateSummary.totalCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Staffed</CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{associateSummary.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Cost</CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(associateSummary.avgDailyCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per associate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{associateSummary.totalHours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Billed hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Associates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Associate Costs</CardTitle>
              <CardDescription>Cost contribution by associate across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associate</TableHead>
                    <TableHead className="text-center">Projects</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Avg Cost/Day</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associateCalculations.map((calc) => {
                    const associate = associates.find((a) => a.id === calc.associateId)
                    if (!associate) return null

                    return (
                      <TableRow key={calc.associateId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                              <AvatarFallback>
                                {associate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{associate.name}</p>
                              <p className="text-sm text-muted-foreground">{associate.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{calc.projectCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{calc.totalHours.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(calc.avgCostPerDay)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(calc.totalCost)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
