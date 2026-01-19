"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Target,
  Wallet,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useRevenueStore } from "@/lib/revenue-store"
import { calculateAssignmentTotalCost, calculateDaysBetween, type ProjectAssignment } from "@/lib/revenue-types"

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

interface ProjectRevenueDetailProps {
  projectId: string
}

export function ProjectRevenueDetail({ projectId }: ProjectRevenueDetailProps) {
  const router = useRouter()
  const { projects, associates } = useAppStore()
  const {
    projectRevenue,
    assignments,
    getProjectRevenueCalculation,
    getAssociateDefaultRate,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useRevenueStore()

  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ProjectAssignment | null>(null)
  const [assignmentForm, setAssignmentForm] = useState({
    associateId: "",
    role: "",
    hourlyRate: 100,
    hoursPerDay: 8,
    startDate: "",
    endDate: "",
    initialOverheadPerDay: 200,
    finalOverheadPerDay: 50,
    rampDays: 20,
  })

  const project = projects.find((p) => p.id === projectId)
  const pr = projectRevenue.find((r) => r.projectId === projectId)
  const projectAssignments = assignments.filter((a) => a.projectId === projectId)
  const calc = useMemo(() => getProjectRevenueCalculation(projectId), [projectId, projectRevenue, assignments])

  // Calculate individual assignment costs
  const assignmentCosts = useMemo(() => {
    return projectAssignments.map((assignment) => {
      const associate = associates.find((a) => a.id === assignment.associateId)
      const costs = calculateAssignmentTotalCost(assignment)
      return {
        assignment,
        associate,
        costs,
      }
    })
  }, [projectAssignments, associates])

  // Project timeline info
  const timelineInfo = useMemo(() => {
    if (!pr) return null
    const totalDays = calculateDaysBetween(pr.startDate, pr.endDate)
    const today = new Date()
    const start = new Date(pr.startDate)
    const end = new Date(pr.endDate)
    const elapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const remaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100))
    return { totalDays, elapsed, remaining, progress }
  }, [pr])

  if (!project || !pr || !calc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" onClick={() => router.push("/revenue")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Revenue
        </Button>
      </div>
    )
  }

  const openAssignmentDialog = (assignment?: ProjectAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment)
      setAssignmentForm({
        associateId: assignment.associateId,
        role: assignment.role,
        hourlyRate: assignment.hourlyRate,
        hoursPerDay: assignment.hoursPerDay,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        initialOverheadPerDay: assignment.initialOverheadPerDay,
        finalOverheadPerDay: assignment.finalOverheadPerDay,
        rampDays: assignment.rampDays,
      })
    } else {
      setEditingAssignment(null)
      setAssignmentForm({
        associateId: "",
        role: "",
        hourlyRate: 100,
        hoursPerDay: 8,
        startDate: pr.startDate,
        endDate: pr.endDate,
        initialOverheadPerDay: 200,
        finalOverheadPerDay: 50,
        rampDays: 20,
      })
    }
    setIsAssignmentDialogOpen(true)
  }

  const handleSaveAssignment = () => {
    if (!assignmentForm.associateId || !assignmentForm.startDate || !assignmentForm.endDate) return

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, assignmentForm)
    } else {
      addAssignment({
        id: `assign-${Date.now()}`,
        projectId,
        ...assignmentForm,
      })
    }
    setIsAssignmentDialogOpen(false)
  }

  const handleAssociateSelect = (associateId: string) => {
    const rate = getAssociateDefaultRate(associateId)
    const associate = associates.find((a) => a.id === associateId)
    setAssignmentForm((prev) => ({
      ...prev,
      associateId,
      hourlyRate: rate,
      role: associate?.role || prev.role,
    }))
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to remove this assignment?")) {
      deleteAssignment(assignmentId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/revenue")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant={pr.status === "active" ? "default" : "secondary"}>{pr.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Building2 className="h-4 w-4" />
              <span>{project.client}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Contract Value</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calc.revenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Total Cost</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2">
              <Wallet className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calc.totalCost)}</div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>Labor: {formatCurrency(calc.laborCost)}</span>
              <span>Overhead: {formatCurrency(calc.overheadCost)}</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${calc.grossMargin >= 0 ? "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50" : "from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={`text-sm font-medium ${calc.grossMargin >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
            >
              Gross Margin
            </CardTitle>
            <div className={`rounded-full p-2 ${calc.grossMargin >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {calc.grossMargin >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calc.grossMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(calc.grossMargin)}
            </div>
            <Badge
              className={`mt-2 ${calc.marginPercent >= 20 ? "bg-green-100 text-green-700" : calc.marginPercent >= 10 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
            >
              {calc.marginPercent.toFixed(1)}% margin
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calc.assignmentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Card */}
      {timelineInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Start: {formatDate(pr.startDate)}</span>
                <span className="text-muted-foreground">End: {formatDate(pr.endDate)}</span>
              </div>
              <Progress value={timelineInfo.progress} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span>
                  <strong>{timelineInfo.elapsed}</strong> days elapsed
                </span>
                <span>
                  <strong>{timelineInfo.remaining}</strong> days remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Assignments</CardTitle>
            <CardDescription>Manage project team members and their cost allocations</CardDescription>
          </div>
          <Button onClick={() => openAssignmentDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Assignment
          </Button>
        </CardHeader>
        <CardContent>
          {assignmentCosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No team members assigned yet</p>
              <Button onClick={() => openAssignmentDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Assignment
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Associate</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Hours/Day</TableHead>
                      <TableHead className="text-right">Labor Cost</TableHead>
                      <TableHead className="text-right">Overhead</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentCosts.map(({ assignment, associate, costs }) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={associate?.avatar || "/placeholder.svg"} alt={associate?.name} />
                              <AvatarFallback>
                                {associate?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{associate?.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{assignment.role}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(assignment.startDate)}</p>
                            <p className="text-muted-foreground">{formatDate(assignment.endDate)}</p>
                            <Badge variant="outline" className="mt-1">
                              {costs.days} days
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${assignment.hourlyRate}/hr</TableCell>
                        <TableCell className="text-right">{assignment.hoursPerDay}h</TableCell>
                        <TableCell className="text-right">{formatCurrency(costs.laborCost)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(costs.overheadCost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(costs.totalCost)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openAssignmentDialog(assignment)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 lg:hidden">
                {assignmentCosts.map(({ assignment, associate, costs }) => (
                  <Card key={assignment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={associate?.avatar || "/placeholder.svg"} alt={associate?.name} />
                            <AvatarFallback>
                              {associate?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{associate?.name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{assignment.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openAssignmentDialog(assignment)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{costs.days} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-medium">${assignment.hourlyRate}/hr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Labor Cost</p>
                          <p className="font-medium">{formatCurrency(costs.laborCost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Cost</p>
                          <p className="font-semibold">{formatCurrency(costs.totalCost)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
            <DialogDescription>
              {editingAssignment ? "Update the assignment details" : "Add a team member to this project"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Associate</Label>
              <Select value={assignmentForm.associateId} onValueChange={handleAssociateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select associate" />
                </SelectTrigger>
                <SelectContent>
                  {associates.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={a.avatar || "/placeholder.svg"} alt={a.name} />
                          <AvatarFallback>
                            {a.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {a.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={assignmentForm.role}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Project Manager, Analyst"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  value={assignmentForm.hourlyRate}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hours/Day</Label>
                <Input
                  type="number"
                  value={assignmentForm.hoursPerDay}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, hoursPerDay: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={assignmentForm.startDate}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={assignmentForm.endDate}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Overhead Settings</Label>
              <p className="text-xs text-muted-foreground">
                Overhead ramps down linearly from initial to final over the ramp period
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Initial ($/day)</Label>
                <Input
                  type="number"
                  value={assignmentForm.initialOverheadPerDay}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({ ...prev, initialOverheadPerDay: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Final ($/day)</Label>
                <Input
                  type="number"
                  value={assignmentForm.finalOverheadPerDay}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({ ...prev, finalOverheadPerDay: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ramp (days)</Label>
                <Input
                  type="number"
                  value={assignmentForm.rampDays}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, rampDays: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} disabled={!assignmentForm.associateId}>
              {editingAssignment ? "Save Changes" : "Add Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
