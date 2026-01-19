"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Plus,
  X,
  History,
  Target,
  DollarSign,
  FolderKanban,
  FileCheck,
  ListTodo,
  AlertCircle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Client, ClientHealthHistoryEntry } from "@/lib/mock-data"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface ClientHealthDashboardProps {
  client: Client
}

export function ClientHealthDashboard({ client }: ClientHealthDashboardProps) {
  const {
    calculateClientHealthScore,
    updateClientHealthOverride,
    addClientHealthNote,
    addClientHealthAlert,
    removeClientHealthAlert,
  } = useAppStore()

  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false)
  const [overrideValue, setOverrideValue] = useState(client.healthScore)
  const [overrideNote, setOverrideNote] = useState("")
  const [useManualOverride, setUseManualOverride] = useState(
    client.healthOverride !== null && client.healthOverride !== undefined,
  )
  const [newAlert, setNewAlert] = useState("")
  const [healthNotes, setHealthNotes] = useState(client.healthNotes || "")

  // Calculate current health
  const { score: calculatedScore, factors } = useMemo(
    () => calculateClientHealthScore(client.id),
    [client.id, calculateClientHealthScore],
  )

  const currentFactors = client.healthFactors || factors
  const currentScore =
    client.healthOverride !== null && client.healthOverride !== undefined ? client.healthOverride : calculatedScore

  // Generate mock history if none exists
  const healthHistory: ClientHealthHistoryEntry[] = useMemo(() => {
    if (client.healthHistory && client.healthHistory.length > 0) {
      return client.healthHistory
    }
    // Generate last 12 weeks of mock history
    const mockHistory: ClientHealthHistoryEntry[] = []
    const baseScore = currentScore
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i * 7)
      const variation = Math.floor(Math.random() * 20) - 10
      mockHistory.push({
        date: date.toISOString().split("T")[0],
        score: Math.max(0, Math.min(100, baseScore + variation)),
        factors: currentFactors,
      })
    }
    return mockHistory
  }, [client.healthHistory, currentScore, currentFactors])

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Healthy"
    if (score >= 60) return "At Risk"
    return "Critical"
  }

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    if (score >= 60) return <Clock className="h-5 w-5 text-amber-500" />
    return <AlertTriangle className="h-5 w-5 text-red-500" />
  }

  const getTrend = () => {
    if (healthHistory.length < 2) return { direction: "stable", value: 0 }
    const recent = healthHistory.slice(-4)
    const older = healthHistory.slice(-8, -4)
    const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b.score, 0) / older.length : recentAvg
    const diff = Math.round(recentAvg - olderAvg)
    return {
      direction: diff > 2 ? "up" : diff < -2 ? "down" : "stable",
      value: Math.abs(diff),
    }
  }

  const trend = getTrend()

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case "Project Health":
        return <FolderKanban className="h-4 w-4" />
      case "Task Completion":
        return <ListTodo className="h-4 w-4" />
      case "Milestone Progress":
        return <Target className="h-4 w-4" />
      case "Financial Health":
        return <DollarSign className="h-4 w-4" />
      case "Document Approval":
        return <FileCheck className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const handleSaveOverride = () => {
    updateClientHealthOverride(client.id, useManualOverride ? overrideValue : null, overrideNote)
    setIsOverrideDialogOpen(false)
    setOverrideNote("")
  }

  const handleSaveNotes = () => {
    addClientHealthNote(client.id, healthNotes)
  }

  const handleAddAlert = () => {
    if (newAlert.trim()) {
      addClientHealthAlert(client.id, newAlert.trim())
      setNewAlert("")
    }
  }

  const radarData = currentFactors.map((f) => ({
    subject: f.factor.split(" ")[0],
    score: f.score,
    fullMark: 100,
  }))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Score Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Health Score</CardTitle>
                <CardDescription>
                  {client.healthOverride !== null && client.healthOverride !== undefined
                    ? "Manual override active"
                    : "Auto-calculated based on 5 factors"}
                </CardDescription>
              </div>
              <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    {client.healthOverride !== null ? "Edit Override" : "Override Score"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Override Health Score</DialogTitle>
                    <DialogDescription>
                      Set a manual health score or let the system auto-calculate based on project data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manual-override">Use Manual Override</Label>
                      <Switch id="manual-override" checked={useManualOverride} onCheckedChange={setUseManualOverride} />
                    </div>

                    {useManualOverride && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Health Score</Label>
                            <span className={cn("text-2xl font-bold", getHealthColor(overrideValue))}>
                              {overrideValue}%
                            </span>
                          </div>
                          <Slider
                            value={[overrideValue]}
                            onValueChange={([value]) => setOverrideValue(value)}
                            max={100}
                            step={1}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Critical (0-59)</span>
                            <span>At Risk (60-79)</span>
                            <span>Healthy (80-100)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!useManualOverride && (
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">
                          Auto-calculated score:{" "}
                          <span className={cn("font-bold", getHealthColor(calculatedScore))}>{calculatedScore}%</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="override-note">Note (optional)</Label>
                      <Textarea
                        id="override-note"
                        placeholder="Reason for override..."
                        value={overrideNote}
                        onChange={(e) => setOverrideNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveOverride}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="relative">
                <div
                  className={cn(
                    "flex h-32 w-32 items-center justify-center rounded-full border-8",
                    currentScore >= 80
                      ? "border-emerald-500"
                      : currentScore >= 60
                        ? "border-amber-500"
                        : "border-red-500",
                  )}
                >
                  <div className="text-center">
                    <span className={cn("text-4xl font-bold", getHealthColor(currentScore))}>{currentScore}</span>
                    <p className="text-sm text-muted-foreground">/ 100</p>
                  </div>
                </div>
                {client.healthOverride !== null && client.healthOverride !== undefined && (
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600">Manual</Badge>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  {getHealthIcon(currentScore)}
                  <span className="text-lg font-semibold">{getHealthLabel(currentScore)}</span>
                  {trend.direction !== "stable" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        trend.direction === "up"
                          ? "text-emerald-600 border-emerald-600"
                          : "text-red-600 border-red-600",
                      )}
                    >
                      {trend.direction === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {trend.value}% {trend.direction === "up" ? "improvement" : "decline"}
                    </Badge>
                  )}
                  {trend.direction === "stable" && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Minus className="h-3 w-3 mr-1" />
                      Stable
                    </Badge>
                  )}
                </div>

                <Progress value={currentScore} className={cn("h-3", getHealthBg(currentScore))} />

                <p className="text-sm text-muted-foreground">
                  {currentScore >= 80
                    ? "This client is performing well across all metrics."
                    : currentScore >= 60
                      ? "Some areas need attention to improve client health."
                      : "Immediate action required to address critical issues."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">12-Week Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={currentScore >= 80 ? "#10b981" : currentScore >= 60 ? "#f59e0b" : "#ef4444"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={currentScore >= 80 ? "#10b981" : currentScore >= 60 ? "#f59e0b" : "#ef4444"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={false} axisLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="text-xs text-muted-foreground">{formatDate(payload[0].payload.date)}</p>
                            <p className={cn("font-bold", getHealthColor(payload[0].value as number))}>
                              {payload[0].value}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={currentScore >= 80 ? "#10b981" : currentScore >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth={2}
                    fill="url(#healthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Factors Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Factors List */}
        <Card>
          <CardHeader>
            <CardTitle>Health Factors Breakdown</CardTitle>
            <CardDescription>Contributing factors to the overall health score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentFactors.map((factor) => (
              <div key={factor.factor} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFactorIcon(factor.factor)}
                    <span className="font-medium">{factor.factor}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(factor.weight * 100)}% weight
                    </Badge>
                  </div>
                  <span className={cn("font-bold", getHealthColor(factor.score))}>{factor.score}%</span>
                </div>
                <Progress value={factor.score} className={cn("h-2", getHealthBg(factor.score))} />
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Factor Comparison</CardTitle>
            <CardDescription>Visual comparison of all health factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={currentScore >= 80 ? "#10b981" : currentScore >= 60 ? "#f59e0b" : "#ef4444"}
                    fill={currentScore >= 80 ? "#10b981" : currentScore >= 60 ? "#f59e0b" : "#ef4444"}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Health Alerts
                </CardTitle>
                <CardDescription>Active alerts for this client</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new alert..."
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAlert()}
              />
              <Button onClick={handleAddAlert} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {(client.healthAlerts || []).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(client.healthAlerts || []).map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm">{alert}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeClientHealthAlert(client.id, alert)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Health Notes</CardTitle>
            <CardDescription>Additional context and observations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add notes about client health..."
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleSaveNotes} className="w-full">
              Save Notes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Health History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Health History
          </CardTitle>
          <CardDescription>Recent changes and updates to health score</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {healthHistory.slice(0, 10).map((entry, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg border">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold",
                      getHealthBg(entry.score),
                    )}
                  >
                    {entry.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatDate(entry.date)}</span>
                      {entry.isManualOverride && (
                        <Badge variant="outline" className="text-xs">
                          Manual
                        </Badge>
                      )}
                    </div>
                    {entry.note && <p className="text-sm text-muted-foreground truncate">{entry.note}</p>}
                    {entry.updatedBy && <p className="text-xs text-muted-foreground">by {entry.updatedBy}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
