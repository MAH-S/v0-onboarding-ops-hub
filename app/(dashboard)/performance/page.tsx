"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import {
  Trophy,
  TrendingUp,
  Clock,
  Lightbulb,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Medal,
  Zap,
  FileCheck,
  Timer,
} from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import Link from "next/link"

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function PerformancePage() {
  const { associates, uploads, tasks, projects, milestones } = useAppStore()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month")
  const [selectedAssociate, setSelectedAssociate] = useState<string>("all")

  // Calculate comprehensive performance metrics for each associate
  const performanceData = useMemo(() => {
    return associates
      .map((associate) => {
        const associateUploads = uploads.filter((u) => u.uploadedById === associate.id)
        const associateTasks = tasks.filter((t) => t.assigneeId === associate.id)
        const completedTasks = associateTasks.filter((t) => t.status === "done")
        const overdueTasks = associateTasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date())

        const approvedWithoutRework = associateUploads.filter((u) => u.status === "Approved" && !u.reviewNote).length
        const quotesAccuracy =
          associateUploads.length > 0 ? Math.round((approvedWithoutRework / associateUploads.length) * 100) : 100

        const rejectedInvoices = associateUploads.filter((u) => u.type === "Invoice" && u.status === "Rejected").length

        // Calculate trend (comparing last 2 periods)
        const recentTasks = associate.tasksCompletedHistory.slice(-2)
        const tasksTrend = recentTasks.length === 2 ? recentTasks[1].count - recentTasks[0].count : 0

        const recentCycle = associate.cycleTimeHistory.slice(-2)
        const cycleTrend =
          recentCycle.length === 2
            ? recentCycle[0].time - recentCycle[1].time // Negative is good for cycle time
            : 0

        // Calculate workload score (0-100)
        const workloadScore = Math.min(100, (associate.openTasks / 15) * 100)

        // Calculate efficiency score
        const efficiencyScore = Math.round(
          associate.performanceScore * 0.4 +
            quotesAccuracy * 0.3 +
            ((5 - Math.min(5, associate.avgCycleTime)) / 5) * 100 * 0.3,
        )

        return {
          ...associate,
          tasksCompleted: associate.tasksCompletedHistory.reduce((sum, h) => sum + h.count, 0),
          completedThisPeriod: completedTasks.length,
          overdueTasks: overdueTasks.length,
          quotesAccuracy,
          invoiceDelays: rejectedInvoices,
          costingQuality: Math.floor(Math.random() * 2) + 4,
          tasksTrend,
          cycleTrend,
          workloadScore,
          efficiencyScore,
          totalUploads: associateUploads.length,
          pendingReviews: associateUploads.filter((u) => u.status === "Pending Review").length,
        }
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
  }, [associates, uploads, tasks])

  // Team-wide metrics
  const teamMetrics = useMemo(() => {
    const totalTasks = performanceData.reduce((sum, a) => sum + a.tasksCompleted, 0)
    const avgPerformance = Math.round(
      performanceData.reduce((sum, a) => sum + a.performanceScore, 0) / performanceData.length,
    )
    const avgCycleTime = performanceData.reduce((sum, a) => sum + a.avgCycleTime, 0) / performanceData.length
    const avgQuotesAccuracy = Math.round(
      performanceData.reduce((sum, a) => sum + a.quotesAccuracy, 0) / performanceData.length,
    )
    const totalOverdue = performanceData.reduce((sum, a) => sum + a.overdueTasks, 0)
    const atCapacity = performanceData.filter((a) => a.workloadScore > 80).length

    return {
      totalTasks,
      avgPerformance,
      avgCycleTime: avgCycleTime.toFixed(1),
      avgQuotesAccuracy,
      totalOverdue,
      atCapacity,
      teamSize: performanceData.length,
    }
  }, [performanceData])

  // Prepare chart data
  const cycleTrendData = useMemo(() => {
    return (
      associates[0]?.cycleTimeHistory?.map((_, index) => {
        const dataPoint: { date: string; [key: string]: number | string } = {
          date: associates[0].cycleTimeHistory[index].date,
        }
        associates.forEach((a) => {
          const firstName = a.name.split(" ")[0]
          if (firstName) {
            dataPoint[firstName] = a.cycleTimeHistory[index]?.time || 0
          }
        })
        // Add team average
        const values = associates.map((a) => a.cycleTimeHistory[index]?.time || 0)
        dataPoint["Team Avg"] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
        return dataPoint
      }) || []
    )
  }, [associates])

  const tasksCompletedData = useMemo(() => {
    return (
      associates[0]?.tasksCompletedHistory?.map((_, index) => {
        const dataPoint: { date: string; [key: string]: number | string } = {
          date: associates[0].tasksCompletedHistory[index].date,
        }
        associates.forEach((a) => {
          const firstName = a.name.split(" ")[0]
          if (firstName) {
            dataPoint[firstName] = a.tasksCompletedHistory[index]?.count || 0
          }
        })
        return dataPoint
      }) || []
    )
  }, [associates])

  // Radar chart data for skill comparison
  const radarData = useMemo(() => {
    return [
      {
        metric: "Performance",
        ...Object.fromEntries(performanceData.map((a) => [a.name.split(" ")[0], a.performanceScore])),
      },
      {
        metric: "Speed",
        ...Object.fromEntries(
          performanceData.map((a) => [a.name.split(" ")[0], Math.round(((5 - a.avgCycleTime) / 5) * 100)]),
        ),
      },
      {
        metric: "Quality",
        ...Object.fromEntries(performanceData.map((a) => [a.name.split(" ")[0], a.quotesAccuracy])),
      },
      {
        metric: "Capacity",
        ...Object.fromEntries(performanceData.map((a) => [a.name.split(" ")[0], 100 - a.workloadScore])),
      },
      {
        metric: "Efficiency",
        ...Object.fromEntries(performanceData.map((a) => [a.name.split(" ")[0], a.efficiencyScore])),
      },
    ]
  }, [performanceData])

  // Workload distribution pie chart
  const workloadDistribution = useMemo(() => {
    const distribution = {
      low: performanceData.filter((a) => a.workloadScore < 40).length,
      medium: performanceData.filter((a) => a.workloadScore >= 40 && a.workloadScore < 70).length,
      high: performanceData.filter((a) => a.workloadScore >= 70 && a.workloadScore < 90).length,
      overloaded: performanceData.filter((a) => a.workloadScore >= 90).length,
    }
    return [
      { name: "Low (<40%)", value: distribution.low, color: "#22c55e" },
      { name: "Medium (40-70%)", value: distribution.medium, color: "#3b82f6" },
      { name: "High (70-90%)", value: distribution.high, color: "#f59e0b" },
      { name: "Overloaded (>90%)", value: distribution.overloaded, color: "#ef4444" },
    ].filter((d) => d.value > 0)
  }, [performanceData])

  // Generate insights
  const insights = useMemo(() => {
    const result = []

    // Top performer
    const topPerformer = performanceData[0]
    result.push({
      text: `${topPerformer.name} leads the team with a ${topPerformer.performanceScore} performance score and ${topPerformer.avgCycleTime}d average cycle time.`,
      type: "positive",
      icon: Trophy,
    })

    // Improving associates
    const improving = performanceData.filter((a) => a.cycleTrend > 0.3)
    if (improving.length > 0) {
      result.push({
        text: `${improving.map((a) => a.name.split(" ")[0]).join(", ")} ${improving.length === 1 ? "has" : "have"} improved cycle time significantly this period.`,
        type: "positive",
        icon: TrendingUp,
      })
    }

    // At risk / needs attention
    const needsAttention = performanceData.filter((a) => a.quotesAccuracy < 80 || a.overdueTasks > 2)
    if (needsAttention.length > 0) {
      result.push({
        text: `${needsAttention[0].name} may need support - ${needsAttention[0].quotesAccuracy < 80 ? `${100 - needsAttention[0].quotesAccuracy}% rework rate` : `${needsAttention[0].overdueTasks} overdue tasks`}.`,
        type: "warning",
        icon: AlertTriangle,
      })
    }

    // Capacity warning
    const overloaded = performanceData.filter((a) => a.workloadScore > 85)
    if (overloaded.length > 0) {
      result.push({
        text: `${overloaded.length} team member${overloaded.length > 1 ? "s are" : " is"} at high capacity (${overloaded.map((a) => a.name.split(" ")[0]).join(", ")}). Consider redistributing work.`,
        type: "info",
        icon: Users,
      })
    }

    // Team average
    result.push({
      text: `Team average cycle time is ${teamMetrics.avgCycleTime} days with ${teamMetrics.avgQuotesAccuracy}% first-time accuracy.`,
      type: "info",
      icon: BarChart3,
    })

    return result
  }, [performanceData, teamMetrics])

  const getTrendIcon = (trend: number, inverse = false) => {
    const isPositive = inverse ? trend < 0 : trend > 0
    if (Math.abs(trend) < 0.1) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (isPositive) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    return <ArrowDownRight className="h-4 w-4 text-red-500" />
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 75) return "text-blue-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
          <Medal className="h-5 w-5 text-yellow-500" />
        </div>
      )
    if (index === 1)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400/20">
          <Medal className="h-5 w-5 text-gray-400" />
        </div>
      )
    if (index === 2)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600/20">
          <Medal className="h-5 w-5 text-orange-600" />
        </div>
      )
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
          <p className="text-muted-foreground">Team analytics and individual performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: "week" | "month" | "quarter") => setTimeRange(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold">{teamMetrics.teamSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{teamMetrics.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">{teamMetrics.avgPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Timer className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{teamMetrics.avgCycleTime}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <FileCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First-Time Accuracy</p>
                <p className="text-2xl font-bold">{teamMetrics.avgQuotesAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold">{teamMetrics.totalOverdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="workload" className="gap-2">
            <Zap className="h-4 w-4" />
            Workload
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Top 3 Cards */}
            {performanceData.slice(0, 3).map((associate, index) => (
              <Card
                key={associate.id}
                className={
                  index === 0
                    ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-transparent"
                    : index === 1
                      ? "border-gray-400/50 bg-gradient-to-br from-gray-400/5 to-transparent"
                      : "border-orange-600/50 bg-gradient-to-br from-orange-600/5 to-transparent"
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {getRankBadge(index)}
                    <Badge variant={index === 0 ? "default" : "secondary"}>{associate.performanceScore}%</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                      <AvatarFallback>
                        {associate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/associates/${associate.id}`} className="font-semibold hover:underline">
                        {associate.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{associate.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tasks Done</p>
                      <p className="font-semibold">{associate.tasksCompleted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cycle Time</p>
                      <p className="font-semibold">{associate.avgCycleTime}d</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-semibold">{associate.quotesAccuracy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Efficiency</p>
                      <p className="font-semibold">{associate.efficiencyScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle>Full Team Rankings</CardTitle>
              <CardDescription>Detailed performance metrics for all team members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Associate</TableHead>
                    <TableHead className="text-right">Tasks</TableHead>
                    <TableHead className="text-right">Cycle Time</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead className="text-right">Workload</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((associate, index) => (
                    <TableRow key={associate.id}>
                      <TableCell>{getRankBadge(index)}</TableCell>
                      <TableCell>
                        <Link href={`/associates/${associate.id}`} className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                            <AvatarFallback>
                              {associate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium hover:underline">{associate.name}</p>
                            <p className="text-xs text-muted-foreground">{associate.role}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-medium">{associate.tasksCompleted}</span>
                          {getTrendIcon(associate.tasksTrend)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span>{associate.avgCycleTime}d</span>
                          {getTrendIcon(associate.cycleTrend, true)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={associate.quotesAccuracy < 80 ? "text-amber-500" : ""}>
                          {associate.quotesAccuracy}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={associate.overdueTasks > 0 ? "text-red-500" : ""}>
                          {associate.overdueTasks}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress
                            value={associate.workloadScore}
                            className={`h-2 w-16 ${
                              associate.workloadScore > 85
                                ? "[&>div]:bg-red-500"
                                : associate.workloadScore > 70
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-green-500"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">{Math.round(associate.workloadScore)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={associate.performanceScore} className="h-2 w-16" />
                          <span className={`text-sm font-medium ${getPerformanceColor(associate.performanceScore)}`}>
                            {associate.performanceScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {associate.cycleTrend > 0.2 ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Improving
                          </Badge>
                        ) : associate.cycleTrend < -0.2 ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Declining
                          </Badge>
                        ) : (
                          <Badge variant="outline">Stable</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Tasks Completed Over Time
                </CardTitle>
                <CardDescription>Weekly task completion by associate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tasksCompletedData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        className="text-muted-foreground"
                        fontSize={12}
                      />
                      <YAxis className="text-muted-foreground" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <Legend />
                      {associates.map((a, i) => {
                        const firstName = a.name.split(" ")[0]
                        if (!firstName) return null
                        return (
                          <Area
                            key={a.id}
                            type="monotone"
                            dataKey={firstName}
                            name={a.name}
                            stroke={COLORS[i % COLORS.length]}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        )
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Cycle Time Trends
                </CardTitle>
                <CardDescription>Average days to complete tasks (lower is better)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cycleTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        className="text-muted-foreground"
                        fontSize={12}
                      />
                      <YAxis className="text-muted-foreground" fontSize={12} domain={[0, 4]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        formatter={(value: number) => [`${value}d`, ""]}
                      />
                      <Legend />
                      {associates.map((a, i) => {
                        const firstName = a.name.split(" ")[0]
                        if (!firstName) return null
                        return (
                          <Line
                            key={a.id}
                            type="monotone"
                            dataKey={firstName}
                            name={a.name}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                          />
                        )
                      })}
                      <Line
                        type="monotone"
                        dataKey="Team Avg"
                        name="Team Average"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Performance Insights
              </CardTitle>
              <CardDescription>Auto-generated observations and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      insight.type === "positive"
                        ? "border-green-500/30 bg-green-500/5"
                        : insight.type === "warning"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border bg-muted/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        insight.type === "positive"
                          ? "bg-green-500/20 text-green-500"
                          : insight.type === "warning"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <insight.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills Radar Comparison</CardTitle>
                <CardDescription>Multi-dimensional performance comparison across key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid className="stroke-border" />
                      <PolarAngleAxis dataKey="metric" className="text-muted-foreground" fontSize={12} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-muted-foreground" fontSize={10} />
                      {associates.map((a, i) => {
                        const firstName = a.name.split(" ")[0]
                        if (!firstName) return null
                        return (
                          <Radar
                            key={a.id}
                            name={a.name}
                            dataKey={firstName}
                            stroke={COLORS[i % COLORS.length]}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        )
                      })}
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs Cycle Time</CardTitle>
                <CardDescription>Efficiency quadrant analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        className="text-muted-foreground"
                        fontSize={12}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="performanceScore" name="Performance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="efficiencyScore" name="Efficiency" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>Team capacity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workloadDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {workloadDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Individual Workload Breakdown</CardTitle>
                <CardDescription>Current capacity and task distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((associate) => (
                    <div key={associate.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                        <AvatarFallback>
                          {associate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <Link href={`/associates/${associate.id}`} className="font-medium hover:underline">
                            {associate.name}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {associate.openTasks} open tasks / {associate.activeProjects} projects
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={associate.workloadScore}
                            className={`h-3 flex-1 ${
                              associate.workloadScore > 85
                                ? "[&>div]:bg-red-500"
                                : associate.workloadScore > 70
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-green-500"
                            }`}
                          />
                          <span
                            className={`min-w-[60px] text-right text-sm font-medium ${
                              associate.workloadScore > 85
                                ? "text-red-500"
                                : associate.workloadScore > 70
                                  ? "text-amber-500"
                                  : "text-green-500"
                            }`}
                          >
                            {Math.round(associate.workloadScore)}% full
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          associate.availability === "available"
                            ? "default"
                            : associate.availability === "partially-available"
                              ? "secondary"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {associate.availability.replace("-", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
