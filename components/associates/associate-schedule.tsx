"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Associate } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  Flag,
} from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns"

interface AssociateScheduleProps {
  associate: Associate
}

const PROJECT_COLORS = [
  { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", light: "bg-blue-100 dark:bg-blue-900/40" },
  {
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-700",
    light: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  { bg: "bg-amber-500", text: "text-white", border: "border-amber-600", light: "bg-amber-100 dark:bg-amber-900/40" },
  { bg: "bg-rose-600", text: "text-white", border: "border-rose-700", light: "bg-rose-100 dark:bg-rose-900/40" },
  {
    bg: "bg-violet-600",
    text: "text-white",
    border: "border-violet-700",
    light: "bg-violet-100 dark:bg-violet-900/40",
  },
  { bg: "bg-cyan-600", text: "text-white", border: "border-cyan-700", light: "bg-cyan-100 dark:bg-cyan-900/40" },
  {
    bg: "bg-orange-600",
    text: "text-white",
    border: "border-orange-700",
    light: "bg-orange-100 dark:bg-orange-900/40",
  },
  { bg: "bg-pink-600", text: "text-white", border: "border-pink-700", light: "bg-pink-100 dark:bg-pink-900/40" },
]

export function AssociateSchedule({ associate }: AssociateScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { projects, tasks, milestones } = useAppStore()

  const assignedProjects = projects.filter((p) => p.assignedAssociates.includes(associate.id))

  const projectColorMap = new Map<string, (typeof PROJECT_COLORS)[0]>()
  assignedProjects.forEach((project, index) => {
    projectColorMap.set(project.id, PROJECT_COLORS[index % PROJECT_COLORS.length])
  })

  const assignedTasks = tasks.filter((t) => t.assigneeId === associate.id)

  const assignedMilestones = milestones.filter((m) => assignedProjects.some((p) => p.id === m.projectId))

  const getTypeColor = (type: string) => {
    switch (type) {
      case "office":
        return "bg-slate-600 text-white border-slate-700"
      case "remote":
        return "bg-slate-500 text-white border-slate-600"
      case "client-site":
        return "bg-slate-700 text-white border-slate-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTimeOffColor = (type: string) => {
    switch (type) {
      case "vacation":
        return "bg-emerald-600 text-white border-emerald-700"
      case "sick":
        return "bg-red-600 text-white border-red-700"
      case "personal":
        return "bg-amber-500 text-white border-amber-600"
      case "training":
        return "bg-blue-600 text-white border-blue-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isOnTimeOff = (date: Date) => {
    if (!associate.timeOff) return null
    return associate.timeOff.find((to) =>
      isWithinInterval(date, { start: parseISO(to.startDate), end: parseISO(to.endDate) }),
    )
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return assignedTasks.filter((t) => t.dueDate === dateStr)
  }

  const getMilestonesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return assignedMilestones.filter((m) => m.dueDate === dateStr)
  }

  const getScheduleForDay = (date: Date) => {
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
    const dayName = dayNames[date.getDay()]
    return associate.schedule?.find((s) => s.dayOfWeek === dayName)
  }

  const getItemsGroupedByProject = (date: Date) => {
    const dayTasks = getTasksForDate(date)
    const dayMilestones = getMilestonesForDate(date)

    const grouped = new Map<string, { tasks: typeof dayTasks; milestones: typeof dayMilestones }>()

    dayTasks.forEach((task) => {
      if (!grouped.has(task.projectId)) {
        grouped.set(task.projectId, { tasks: [], milestones: [] })
      }
      grouped.get(task.projectId)!.tasks.push(task)
    })

    dayMilestones.forEach((milestone) => {
      if (!grouped.has(milestone.projectId)) {
        grouped.set(milestone.projectId, { tasks: [], milestones: [] })
      }
      grouped.get(milestone.projectId)!.milestones.push(milestone)
    })

    return grouped
  }

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Schedule
                </CardTitle>
                <CardDescription>Projects, tasks, and milestones for {associate.name}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="ml-2">
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <span className="text-xs font-medium text-muted-foreground mr-2">Projects:</span>
              {assignedProjects.map((project) => {
                const colors = projectColorMap.get(project.id)!
                return (
                  <Badge key={project.id} className={`${colors.bg} ${colors.text} text-xs`}>
                    {project.name}
                  </Badge>
                )
              })}
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = isSameDay(day, new Date())
                const timeOff = isOnTimeOff(day)
                const daySchedule = getScheduleForDay(day)
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                const groupedItems = getItemsGroupedByProject(day)

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-1 rounded-md border ${
                      !isCurrentMonth
                        ? "bg-muted/30 text-muted-foreground/50"
                        : isToday
                          ? "border-primary border-2 bg-primary/5"
                          : isWeekend
                            ? "bg-muted/40"
                            : "border-border bg-card"
                    } ${timeOff ? "bg-amber-100 dark:bg-amber-900/30" : ""}`}
                  >
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {daySchedule && !isWeekend && !timeOff && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1 py-0 font-medium ${getTypeColor(daySchedule.type)}`}
                        >
                          {daySchedule.type === "office" ? "O" : daySchedule.type === "remote" ? "R" : "C"}
                        </Badge>
                      )}
                    </div>

                    {/* Time off indicator */}
                    {timeOff && (
                      <Badge
                        className={`text-[10px] px-1.5 py-0.5 w-full justify-center font-semibold ${getTimeOffColor(timeOff.type)}`}
                      >
                        {timeOff.type}
                      </Badge>
                    )}

                    {!timeOff && isCurrentMonth && (
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {Array.from(groupedItems.entries())
                          .slice(0, 2)
                          .map(([projectId, items]) => {
                            const project = assignedProjects.find((p) => p.id === projectId)
                            const colors = projectColorMap.get(projectId)!
                            const totalItems = items.tasks.length + items.milestones.length

                            return (
                              <Tooltip key={projectId}>
                                <TooltipTrigger asChild>
                                  <div className={`rounded overflow-hidden cursor-pointer border ${colors.border}`}>
                                    {/* Project header */}
                                    <div
                                      className={`text-[9px] px-1.5 py-0.5 font-semibold truncate ${colors.bg} ${colors.text}`}
                                    >
                                      {project?.name}
                                    </div>
                                    {/* Tasks under project */}
                                    <div className={`${colors.light} px-1 py-0.5`}>
                                      {items.milestones.slice(0, 1).map((m) => (
                                        <div
                                          key={m.id}
                                          className="text-[9px] truncate flex items-center gap-0.5 text-foreground"
                                        >
                                          <Flag className="h-2 w-2 shrink-0" />
                                          <span className="truncate">{m.title}</span>
                                        </div>
                                      ))}
                                      {items.tasks.slice(0, 1).map((t) => (
                                        <div
                                          key={t.id}
                                          className={`text-[9px] truncate flex items-center gap-0.5 ${
                                            t.status === "done" ? "line-through opacity-60" : ""
                                          } text-foreground`}
                                        >
                                          <CheckSquare className="h-2 w-2 shrink-0" />
                                          <span className="truncate">{t.title}</span>
                                        </div>
                                      ))}
                                      {totalItems > 2 && (
                                        <div className="text-[9px] text-muted-foreground">+{totalItems - 2} more</div>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-[280px] p-0 overflow-hidden bg-popover border border-border shadow-xl"
                                >
                                  <div className={`px-3 py-2 ${colors.bg} ${colors.text}`}>
                                    <p className="font-semibold">{project?.name}</p>
                                    <p className="text-xs opacity-90">{project?.client}</p>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    {items.milestones.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">Milestones</p>
                                        {items.milestones.map((m) => (
                                          <div key={m.id} className="flex items-center gap-2 text-sm">
                                            <Flag className="h-3 w-3 text-purple-500 shrink-0" />
                                            <span>{m.title}</span>
                                            <Badge variant="outline" className="text-[10px] ml-auto">
                                              {m.completion}%
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {items.tasks.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">Tasks</p>
                                        {items.tasks.map((t) => (
                                          <div key={t.id} className="flex items-center gap-2 text-sm mb-1">
                                            <CheckSquare
                                              className={`h-3 w-3 shrink-0 ${
                                                t.status === "done" ? "text-emerald-500" : "text-sky-500"
                                              }`}
                                            />
                                            <span className={t.status === "done" ? "line-through opacity-60" : ""}>
                                              {t.title}
                                            </span>
                                            <Badge
                                              className={`text-[10px] ml-auto ${
                                                t.priority === "high"
                                                  ? "bg-red-600 text-white"
                                                  : t.priority === "medium"
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-slate-500 text-white"
                                              }`}
                                            >
                                              {t.priority}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}

                        {/* More projects indicator */}
                        {groupedItems.size > 2 && (
                          <div className="text-[9px] text-muted-foreground text-center font-medium">
                            +{groupedItems.size - 2} more projects
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Assigned Projects
            </CardTitle>
            <CardDescription>Projects this associate is currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedProjects.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {assignedProjects.map((project) => {
                  const colors = projectColorMap.get(project.id)!
                  const projectTasks = assignedTasks.filter((t) => t.projectId === project.id)
                  const openTasks = projectTasks.filter((t) => t.status !== "done").length
                  const doneTasks = projectTasks.filter((t) => t.status === "done").length
                  const projectMilestones = assignedMilestones.filter((m) => m.projectId === project.id)

                  return (
                    <div key={project.id} className={`rounded-lg border overflow-hidden ${colors.border}`}>
                      {/* Project header with color */}
                      <div className={`px-4 py-2 ${colors.bg} ${colors.text}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-xs opacity-90">{project.client}</p>
                          </div>
                          <Badge
                            className={`text-xs ${
                              project.health === "on-track"
                                ? "bg-white/20 text-white border-white/30"
                                : project.health === "at-risk"
                                  ? "bg-amber-400 text-amber-900"
                                  : "bg-red-400 text-red-900"
                            }`}
                          >
                            {project.health === "on-track"
                              ? "On Track"
                              : project.health === "at-risk"
                                ? "At Risk"
                                : "Critical"}
                          </Badge>
                        </div>
                      </div>

                      {/* Project details */}
                      <div className="p-4 bg-card">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            {openTasks} open / {doneTasks} done
                          </span>
                          <span className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {projectMilestones.length} milestones
                          </span>
                        </div>

                        {/* Task list */}
                        {projectTasks.length > 0 && (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs font-medium text-muted-foreground">Your Tasks:</p>
                            {projectTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className={`text-xs flex items-center justify-between p-1.5 rounded ${colors.light}`}
                              >
                                <span
                                  className={`flex items-center gap-1.5 ${task.status === "done" ? "line-through opacity-60" : ""}`}
                                >
                                  <CheckSquare
                                    className={`h-3 w-3 ${task.status === "done" ? "text-emerald-500" : "text-muted-foreground"}`}
                                  />
                                  {task.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    task.status === "done"
                                      ? "border-emerald-500 text-emerald-600"
                                      : task.status === "in-progress"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-slate-400 text-slate-500"
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                            {projectTasks.length > 3 && (
                              <p className="text-xs text-muted-foreground">+{projectTasks.length - 3} more tasks</p>
                            )}
                          </div>
                        )}

                        {/* Progress bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${colors.bg}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects currently assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Schedule Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-slate-600 text-white">
                <MapPin className="h-3 w-3 mr-1" />
                Office (O)
              </Badge>
              <Badge className="bg-slate-500 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Remote (R)
              </Badge>
              <Badge className="bg-slate-700 text-white">
                <Plane className="h-3 w-3 mr-1" />
                Client Site (C)
              </Badge>
              <Badge variant="outline">
                <Flag className="h-3 w-3 mr-1" />
                Milestone
              </Badge>
              <Badge variant="outline">
                <CheckSquare className="h-3 w-3 mr-1" />
                Task
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Time Off Section */}
        {associate.timeOff && associate.timeOff.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Time Off Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {associate.timeOff.map((to, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge className={getTimeOffColor(to.type)}>{to.type}</Badge>
                      <span className="text-sm">
                        {format(parseISO(to.startDate), "MMM d")} - {format(parseISO(to.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        to.status === "approved"
                          ? "border-emerald-500 text-emerald-600"
                          : to.status === "pending"
                            ? "border-amber-500 text-amber-600"
                            : "border-red-500 text-red-600"
                      }
                    >
                      {to.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
