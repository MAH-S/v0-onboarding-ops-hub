"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Search,
  Clock,
  DollarSign,
  Globe,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientStatus } from "@/lib/mock-data"
import { AddAdvisoryClientDialog } from "@/components/clients/add-advisory-client-dialog"

export function AdvisoryPageContent() {
  const { clients, associates } = useAppStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [retainerStatusFilter, setRetainerStatusFilter] = useState<string>("all")

  // Filter only advisory clients
  const advisoryClients = clients.filter((c) => c.clientType === "advisory")

  // Calculate stats
  const activeRetainers = advisoryClients.filter((c) => c.retainer?.status === "active").length
  const expiredRetainers = advisoryClients.filter((c) => c.retainer?.status === "expired").length
  const pendingRetainers = advisoryClients.filter((c) => c.retainer?.status === "pending").length
  const monthlyRetainerRevenue = advisoryClients
    .filter((c) => c.retainer?.status === "active")
    .reduce((sum, c) => sum + (c.retainer?.monthlyFee || 0), 0)
  const totalHoursIncluded = advisoryClients
    .filter((c) => c.retainer?.status === "active")
    .reduce((sum, c) => sum + (c.retainer?.hoursIncluded || 0), 0)
  const totalHoursUsed = advisoryClients
    .filter((c) => c.retainer?.status === "active")
    .reduce((sum, c) => sum + (c.retainer?.hoursUsed || 0), 0)
  const avgHoursUsed = totalHoursIncluded > 0 ? Math.round((totalHoursUsed / totalHoursIncluded) * 100) : 0

  // Filter clients
  const filteredClients = advisoryClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.industry.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesRetainerStatus = retainerStatusFilter === "all" || client.retainer?.status === retainerStatusFilter
    return matchesSearch && matchesStatus && matchesRetainerStatus
  })

  const getStatusBadge = (status: ClientStatus) => {
    const styles: Record<ClientStatus, string> = {
      active: "bg-emerald-600 text-white",
      prospect: "bg-blue-600 text-white",
      inactive: "bg-gray-500 text-white",
      churned: "bg-red-600 text-white",
    }
    const labels: Record<ClientStatus, string> = {
      active: "Active",
      prospect: "Prospect",
      inactive: "Inactive",
      churned: "Churned",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getAdvisor = (advisorId?: string) => {
    if (!advisorId) return null
    return associates.find((a) => a.id === advisorId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advisory Clients</h1>
            <p className="text-muted-foreground">Retained monthly support engagements</p>
          </div>
        </div>
        <AddAdvisoryClientDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advisoryClients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Advisory engagements</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Retainers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeRetainers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingRetainers > 0 && `${pendingRetainers} pending`}
              {expiredRetainers > 0 && ` ${expiredRetainers} expired`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${monthlyRetainerRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From active retainers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Utilization</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursUsed}%</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={avgHoursUsed} className="h-2 flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-200 dark:border-cyan-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advisoryClients.length > 0
                ? Math.round(advisoryClients.reduce((sum, c) => sum + c.healthScore, 0) / advisoryClients.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Client satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Advisory Client Directory</CardTitle>
          <CardDescription>Manage retained monthly support clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search advisory clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={retainerStatusFilter} onValueChange={setRetainerStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Retainer Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Retainers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 mb-4">
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">No Advisory Clients Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Advisory clients are for retained monthly support engagements. Add your first advisory client to get
                started.
              </p>
              <div className="mt-4">
                <AddAdvisoryClientDialog />
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Retainer Status</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Hours Used</TableHead>
                    <TableHead>Assigned Advisor</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead className="text-right">Services</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const advisor = getAdvisor(client.retainer?.advisorId)
                    const hoursPercent = client.retainer
                      ? Math.round((client.retainer.hoursUsed / client.retainer.hoursIncluded) * 100)
                      : 0

                    return (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                              <Briefcase className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium hover:underline">{client.name}</p>
                              {client.website && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {client.website.replace("https://", "")}
                                </p>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>{client.industry}</TableCell>
                        <TableCell>
                          {client.retainer?.status === "active" ? (
                            <Badge className="bg-emerald-600 text-white gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : client.retainer?.status === "expired" ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Calendar className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">${client.retainer?.monthlyFee?.toLocaleString() || 0}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={hoursPercent}
                              className={cn("h-2 w-16", hoursPercent > 90 && "[&>div]:bg-amber-500")}
                            />
                            <span className="text-sm text-muted-foreground">
                              {client.retainer?.hoursUsed || 0}/{client.retainer?.hoursIncluded || 0}h
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {advisor ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={advisor.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {advisor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{advisor.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={cn("font-semibold", getHealthColor(client.healthScore))}>
                            {client.healthScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {client.retainer?.services?.slice(0, 2).map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {(client.retainer?.services?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(client.retainer?.services?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
