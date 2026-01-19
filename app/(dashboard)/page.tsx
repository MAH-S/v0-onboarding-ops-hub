"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import {
  FolderKanban,
  ListTodo,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Briefcase,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const { projects, tasks, milestones, uploads, associates, clients, notes } = useAppStore()

  // Calculate KPIs
  const activeProjects = projects.filter((p) => p.lifecycle !== "completed").length
  const completedProjects = projects.filter((p) => p.lifecycle === "completed").length
  const openTasks = tasks.filter((t) => t.status !== "done").length
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const overdueMilestones = milestones.filter(
    (m) => new Date(m.dueDate) < new Date() && m.status !== "completed",
  ).length
  const pendingDocuments = uploads.filter((u) => u.status === "Pending Review").length
  const pendingValue = uploads
    .filter((u) => u.status === "Pending Review" && u.amount)
    .reduce((sum, u) => sum + (u.amount || 0), 0)

  // Project health distribution
  const healthDistribution = {
    "on-track": projects.filter((p) => (p.health || "on-track") === "on-track").length,
    "at-risk": projects.filter((p) => p.health === "at-risk").length,
    "critical-risk": projects.filter((p) => p.health === "critical-risk").length,
  }

  // Lifecycle pipeline data
  const lifecycleCounts = {
    "new-business": projects.filter((p) => p.lifecycle === "new-business").length,
    onboarding: projects.filter((p) => p.lifecycle === "onboarding").length,
    execution: projects.filter((p) => p.lifecycle === "execution").length,
    closure: projects.filter((p) => p.lifecycle === "closure").length,
    learnings: projects.filter((p) => p.lifecycle === "learnings").length,
    completed: projects.filter((p) => p.lifecycle === "completed").length,
  }

  // Associate availability
  const availableAssociates = associates.filter((a) => a.availability === "available").length
  const busyAssociates = associates.filter((a) => a.availability === "busy").length

  // Upcoming deadlines (next 7 days)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingMilestones = milestones
    .filter((m) => {
      const due = new Date(m.dueDate)
      return due >= today && due <= nextWeek && m.status !== "completed"
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate) return false
      const due = new Date(t.dueDate)
      return due >= today && due <= nextWeek && t.status !== "done"
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  // Projects at risk
  const riskyProjects = projects.filter((p) => p.health === "at-risk" || p.health === "critical-risk").slice(0, 5)

  // Recent activity (simulated from notes)
  const recentActivity = notes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  // Team workload data
  const workloadData = associates.map((a) => ({
    name: a.name.split(" ")[0],
    tasks: a.openTasks,
    capacity: a.capacity || 100,
    avatar: a.avatar,
  }))

  // Health pie chart data
  const healthPieData = [
    { name: "On Track", value: healthDistribution["on-track"], color: "#22c55e" },
    { name: "At Risk", value: healthDistribution["at-risk"], color: "#f59e0b" },
    { name: "Critical", value: healthDistribution["critical-risk"], color: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Weekly task trend (mock data)
  const weeklyTrend = [
    { day: "Mon", completed: 12, added: 8 },
    { day: "Tue", completed: 15, added: 10 },
    { day: "Wed", completed: 8, added: 14 },
    { day: "Thu", completed: 18, added: 6 },
    { day: "Fri", completed: 22, added: 12 },
    { day: "Sat", completed: 5, added: 2 },
    { day: "Sun", completed: 3, added: 1 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Today"
    if (diff === 1) return "Tomorrow"
    return `${diff} days`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/project-board">
              <BarChart3 className="mr-2 h-4 w-4" />
              Project Board
            </Link>
          </Button>
          <Button asChild>
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjects}</div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {completedProjects} completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTasks}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>{completedTasks} completed this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Milestones</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${overdueMilestones > 0 ? "text-red-500" : "text-green-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueMilestones > 0 ? "text-red-500" : ""}`}>
              {overdueMilestones}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {overdueMilestones > 0 ? "Requires immediate attention" : "All milestones on track"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingDocuments}</div>
            <div className="mt-1 text-xs text-muted-foreground">{formatCurrency(pendingValue)} awaiting review</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Pipeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Project Pipeline
                  </CardTitle>
                  <CardDescription>Projects across lifecycle stages</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/project-board">
                    View Board
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {[
                  { key: "new-business", label: "New Business", color: "bg-slate-500" },
                  { key: "onboarding", label: "Onboarding", color: "bg-blue-500" },
                  { key: "execution", label: "Execution", color: "bg-purple-500" },
                  { key: "closure", label: "Closure", color: "bg-amber-500" },
                  { key: "learnings", label: "Learnings", color: "bg-teal-500" },
                  { key: "completed", label: "Completed", color: "bg-green-500" },
                ].map((stage, index) => (
                  <div key={stage.key} className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-16 w-full items-center justify-center rounded-lg ${stage.color} text-white font-bold text-xl`}
                    >
                      {lifecycleCounts[stage.key as keyof typeof lifecycleCounts]}
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground text-center">{stage.label}</span>
                    {index < 5 && (
                      <ArrowRight className="absolute right-0 h-4 w-4 text-muted-foreground/50 hidden lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects at Risk */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Projects Needing Attention
                  </CardTitle>
                  <CardDescription>Projects with health issues or blockers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projects?filter=at-risk">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {riskyProjects.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  All projects are on track!
                </div>
              ) : (
                <div className="space-y-3">
                  {riskyProjects.map((project) => {
                    const projectTasks = tasks.filter((t) => t.projectId === project.id)
                    const openTaskCount = projectTasks.filter((t) => t.status !== "done").length
                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              project.health === "critical-risk" ? "bg-red-500" : "bg-amber-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">{project.client}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{openTaskCount} tasks</p>
                            <p className="text-xs text-muted-foreground">{project.milestonesProgress || 0}% complete</p>
                          </div>
                          <Badge
                            variant={project.health === "critical-risk" ? "destructive" : "secondary"}
                            className={project.health === "at-risk" ? "bg-amber-500/10 text-amber-600" : ""}
                          >
                            {project.health === "critical-risk" ? "Critical" : "At Risk"}
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Weekly Task Activity
              </CardTitle>
              <CardDescription>Tasks completed vs added this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="addedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#22c55e"
                      fill="url(#completedGradient)"
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Area
                      type="monotone"
                      dataKey="added"
                      stroke="#3b82f6"
                      fill="url(#addedGradient)"
                      strokeWidth={2}
                      name="Added"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Project Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Project Health
              </CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={healthPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {healthPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4">
                {healthPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Availability */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Status
                  </CardTitle>
                  <CardDescription>{associates.length} team members</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/associates">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{availableAssociates}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{busyAssociates}</p>
                    <p className="text-xs text-muted-foreground">Busy</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {associates.slice(0, 4).map((associate) => (
                    <div key={associate.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {associate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{associate.name.split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{associate.openTasks} tasks</span>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            associate.availability === "available"
                              ? "bg-green-500"
                              : associate.availability === "busy"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                <TabsContent value="milestones" className="mt-4">
                  {upcomingMilestones.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No upcoming milestones</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMilestones.map((milestone) => {
                        const project = projects.find((p) => p.id === milestone.projectId)
                        return (
                          <div key={milestone.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{milestone.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{project?.name}</p>
                            </div>
                            <Badge variant="outline" className="ml-2 shrink-0">
                              <Clock className="mr-1 h-3 w-3" />
                              {getDaysUntil(milestone.dueDate)}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                  {upcomingTasks.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No upcoming tasks</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId)
                        return (
                          <div key={task.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{task.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{project?.name}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`ml-2 shrink-0 ${
                                task.priority === "high" ? "border-red-500 text-red-500" : ""
                              }`}
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {getDaysUntil(task.dueDate!)}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Clients</span>
                  <span className="font-medium">{clients.filter((c) => c.status === "active").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Milestones</span>
                  <span className="font-medium">{milestones.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">
                    {Math.round((completedTasks / (completedTasks + openTasks)) * 100) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Value</span>
                  <span className="font-medium text-amber-600">{formatCurrency(pendingValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
