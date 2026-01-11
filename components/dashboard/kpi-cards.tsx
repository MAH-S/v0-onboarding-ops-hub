"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { FolderKanban, ListTodo, AlertTriangle, FileText, Receipt } from "lucide-react"

export function KPICards() {
  const { projects, tasks, milestones, uploads } = useAppStore()

  const activeProjects = projects.filter((p) => p.status !== "Closed").length
  const openTasks = tasks.filter((t) => t.status !== "done").length
  const overdueMilestones = milestones.filter(
    (m) => new Date(m.dueDate) < new Date() && m.status !== "completed",
  ).length
  const pendingQuotes = uploads.filter((u) => u.type === "Quote" && u.status === "Pending Review").length
  const pendingInvoices = uploads.filter((u) => u.type === "Invoice" && u.status === "Pending Review").length

  const kpis = [
    {
      title: "Active Projects",
      value: activeProjects,
      icon: FolderKanban,
      color: "text-chart-1",
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: ListTodo,
      color: "text-chart-2",
    },
    {
      title: "Overdue Milestones",
      value: overdueMilestones,
      icon: AlertTriangle,
      color: overdueMilestones > 0 ? "text-destructive" : "text-chart-3",
    },
    {
      title: "Quotes Pending",
      value: pendingQuotes,
      icon: FileText,
      color: "text-chart-4",
    },
    {
      title: "Invoices Pending",
      value: pendingInvoices,
      icon: Receipt,
      color: "text-chart-5",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
