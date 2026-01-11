"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, Plus, TrendingUp, AlertTriangle, UserPlus, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientStatus, ClientTier } from "@/lib/mock-data"

function ClientsPageContent() {
  const { clients, projects, associates } = useAppStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")

  // Calculate stats
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const atRiskClients = clients.filter((c) => c.healthScore < 60 && c.status === "active").length
  const prospects = clients.filter((c) => c.status === "prospect").length

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.industry.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesTier = tierFilter === "all" || client.tier === tierFilter
    return matchesSearch && matchesStatus && matchesTier
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

  const getTierBadge = (tier: ClientTier) => {
    const styles: Record<ClientTier, string> = {
      enterprise: "bg-purple-600 text-white",
      "mid-market": "bg-amber-600 text-white",
      startup: "bg-cyan-600 text-white",
    }
    const labels: Record<ClientTier, string> = {
      enterprise: "Enterprise",
      "mid-market": "Mid-Market",
      startup: "Startup",
    }
    return <Badge className={styles[tier]}>{labels[tier]}</Badge>
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getClientProjects = (clientName: string) => {
    return projects.filter((p) => p.client === clientName)
  }

  const getClientTeam = (clientName: string) => {
    const clientProjects = getClientProjects(clientName)
    const associateIds = new Set(clientProjects.flatMap((p) => p.assignedAssociates))
    return associates.filter((a) => associateIds.has(a.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships and engagements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">All registered clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeClients}</div>
            <p className="text-xs text-muted-foreground">With ongoing engagements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskClients}</div>
            <p className="text-xs text-muted-foreground">Health score below 60</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{prospects}</div>
            <p className="text-xs text-muted-foreground">Potential new clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>View and manage all clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
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
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="mid-market">Mid-Market</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Primary Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const clientProjects = getClientProjects(client.name)
                  const clientTeam = getClientTeam(client.name)
                  const primaryContact = client.contacts.find((c) => c.isPrimary)

                  return (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
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
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{getTierBadge(client.tier)}</TableCell>
                      <TableCell>
                        {client.status === "prospect" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className={cn("font-semibold", getHealthColor(client.healthScore))}>
                            {client.healthScore}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{clientProjects.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {clientTeam.slice(0, 3).map((associate) => (
                            <div
                              key={associate.id}
                              className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                              title={associate.name}
                            >
                              {associate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          ))}
                          {clientTeam.length > 3 && (
                            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                              +{clientTeam.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.totalRevenue > 0 ? (
                          <span className="font-medium">${(client.totalRevenue / 1000).toFixed(0)}K</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {primaryContact ? (
                          <div className="text-right">
                            <p className="font-medium text-sm">{primaryContact.name}</p>
                            <p className="text-xs text-muted-foreground">{primaryContact.role}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={null}>
      <ClientsPageContent />
    </Suspense>
  )
}
