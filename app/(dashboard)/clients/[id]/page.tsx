"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star,
  Edit,
  Plus,
  Briefcase,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientStatus, ClientTier, ProjectHealth } from "@/lib/mock-data"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { clients, projects, associates, tasks, milestones } = useAppStore()

  const client = clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Client not found</h2>
        <Button variant="outline" onClick={() => router.push("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    )
  }

  // Get client's projects
  const clientProjects = projects.filter((p) => p.client === client.name)

  // Get team members working on this client
  const associateIds = new Set(clientProjects.flatMap((p) => p.assignedAssociates))
  const clientTeam = associates.filter((a) => associateIds.has(a.id))

  // Calculate metrics
  const activeProjects = clientProjects.filter((p) => p.status !== "Closed").length
  const totalTasks = tasks.filter((t) => clientProjects.some((p) => p.id === t.projectId)).length
  const completedTasks = tasks.filter(
    (t) => clientProjects.some((p) => p.id === t.projectId) && t.status === "done",
  ).length
  const clientMilestones = milestones.filter((m) => clientProjects.some((p) => p.id === m.projectId))
  const completedMilestones = clientMilestones.filter((m) => m.status === "completed").length

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

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-600"
    return "bg-red-600"
  }

  const getProjectHealthBadge = (health: ProjectHealth) => {
    const styles: Record<ProjectHealth, string> = {
      "on-track": "bg-emerald-600 text-white",
      "at-risk": "bg-amber-600 text-white",
      "critical-risk": "bg-red-600 text-white",
    }
    const labels: Record<ProjectHealth, string> = {
      "on-track": "On Track",
      "at-risk": "At Risk",
      "critical-risk": "Critical",
    }
    return <Badge className={styles[health]}>{labels[health]}</Badge>
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const primaryContact = client.contacts.find((c) => c.isPrimary)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/clients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                {getStatusBadge(client.status)}
                {getTierBadge(client.tier)}
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span>{client.industry}</span>
                {client.website && (
                  <>
                    <span>•</span>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Globe className="h-4 w-4" />
                      {client.website.replace("https://", "")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            {client.healthScore >= 80 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : client.healthScore >= 60 ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getHealthColor(client.healthScore))}>
              {client.status === "prospect" ? "—" : `${client.healthScore}%`}
            </div>
            <Progress value={client.healthScore} className={cn("h-2 mt-2", getHealthBg(client.healthScore))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">{clientProjects.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientTeam.length}</div>
            <p className="text-xs text-muted-foreground">Assigned associates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(client.totalRevenue)}</div>
            {client.outstandingBalance > 0 && (
              <p className="text-xs text-amber-500">{formatCurrency(client.outstandingBalance)} outstanding</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects ({clientProjects.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({clientTeam.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({client.contacts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{client.description}</p>
                <Separator />
                {/* Company Details */}
                <div className="space-y-3">
                  <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Company Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium">{client.industry}</p>
                      </div>
                    </div>
                    {client.domain && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Domain</p>
                          <p className="font-medium">{client.domain}</p>
                        </div>
                      </div>
                    )}
                    {client.employeeCount && (
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Employees</p>
                          <p className="font-medium">{client.employeeCount.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {client.foundedYear && (
                      <div className="flex items-start gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Founded</p>
                          <p className="font-medium">{client.foundedYear}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {client.address.street}
                        <br />
                        {client.address.city}, {client.address.state} {client.address.zip}
                        <br />
                        {client.address.country}
                      </p>
                    </div>
                  </div>
                  {client.contractStart && client.contractEnd && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Contract Period</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(client.contractStart)} — {formatDate(client.contractEnd)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {primaryContact ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {primaryContact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold">{primaryContact.name}</p>
                        <p className="text-muted-foreground">{primaryContact.role}</p>
                        <Badge className="mt-1 bg-amber-600 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${primaryContact.email}`} className="text-sm hover:underline">
                          {primaryContact.email}
                        </a>
                      </div>
                      {primaryContact.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${primaryContact.phone}`} className="text-sm hover:underline">
                            {primaryContact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No primary contact assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{client.notes || "No notes added"}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>All projects for {client.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientProjects.map((project) => {
                    const projectTasks = tasks.filter((t) => t.projectId === project.id)
                    const projectCompletedTasks = projectTasks.filter((t) => t.status === "done").length
                    const projectAssociates = associates.filter((a) => project.assignedAssociates.includes(a.id))

                    return (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold hover:underline">{project.name}</h3>
                                {getProjectHealthBadge(project.health)}
                                <Badge variant="outline">{project.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Owner: {project.owner} • Due: {formatDate(project.dueDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{project.milestonesProgress}% Complete</p>
                              <Progress value={project.milestonesProgress} className="h-2 w-32 mt-1" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{project.openTasks} open tasks</span>
                              <span>•</span>
                              <span>
                                {projectCompletedTasks}/{projectTasks.length} tasks done
                              </span>
                            </div>
                            <div className="flex -space-x-2">
                              {projectAssociates.slice(0, 4).map((associate) => (
                                <Avatar key={associate.id} className="h-7 w-7 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {associate.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Associates working on {client.name} projects</CardDescription>
            </CardHeader>
            <CardContent>
              {clientTeam.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members assigned</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {clientTeam.map((associate) => {
                    const associateProjects = clientProjects.filter((p) => p.assignedAssociates.includes(associate.id))
                    const associateTasks = tasks.filter(
                      (t) => t.assigneeId === associate.id && clientProjects.some((p) => p.id === t.projectId),
                    )
                    const openTasks = associateTasks.filter((t) => t.status !== "done").length

                    return (
                      <Link key={associate.id} href={`/associates/${associate.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {associate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold hover:underline">{associate.name}</p>
                              <p className="text-sm text-muted-foreground">{associate.role}</p>
                            </div>
                            <Badge variant="outline">{openTasks} open tasks</Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Working on:</span>
                            {associateProjects.slice(0, 2).map((p) => (
                              <Badge key={p.id} variant="secondary" className="text-xs">
                                {p.name}
                              </Badge>
                            ))}
                            {associateProjects.length > 2 && <span>+{associateProjects.length - 2} more</span>}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>All contacts at {client.name}</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn("p-4 rounded-lg border", contact.isPrimary && "border-amber-500/50 bg-amber-500/5")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                      </div>
                      {contact.isPrimary && (
                        <Badge className="bg-amber-600 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${contact.phone}`} className="hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
