"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import {
  ArrowLeft,
  FolderKanban,
  ListTodo,
  AlertTriangle,
  Clock,
  MoreVertical,
  UserPlus,
  Flag,
  RefreshCw,
  User,
  Zap,
  Calendar,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { AssociateProjects } from "@/components/associates/associate-projects"
import { AssociateTasks } from "@/components/associates/associate-tasks"
import { AssociateUploads } from "@/components/associates/associate-uploads"
import { AssociatePerformance } from "@/components/associates/associate-performance"
import { AssociateProfileInfo } from "@/components/associates/associate-profile-info"
import { AssociateSkills } from "@/components/associates/associate-skills"
import { AssociateSchedule } from "@/components/associates/associate-schedule"
import { toast } from "sonner"

export default function AssociateProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { associates, tasks, projects } = useAppStore()
  const [activeTab, setActiveTab] = useState("profile")

  const associate = associates.find((a) => a.id === id)

  if (!associate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Associate not found</h2>
        <p className="text-muted-foreground">The associate you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/associates">Back to Associates</Link>
        </Button>
      </div>
    )
  }

  const associateTasks = tasks.filter((t) => t.assigneeId === id)
  const associateProjects = projects.filter((p) => p.assignedAssociates.includes(id))
  const openTasks = associateTasks.filter((t) => t.status !== "done").length

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-emerald-500"
    if (score >= 75) return "text-blue-500"
    return "text-amber-500"
  }

  const getAvailabilityBadge = () => {
    switch (associate.availability) {
      case "available":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Available</Badge>
      case "partially-available":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Partially Available</Badge>
      case "unavailable":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Unavailable</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/associates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
            <AvatarFallback className="text-lg">
              {associate.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{associate.name}</h1>
              <Badge variant="secondary">{associate.role}</Badge>
              {getAvailabilityBadge()}
            </div>
            <p className="text-muted-foreground">{associate.email}</p>
            {(associate.department || associate.location) && (
              <p className="text-sm text-muted-foreground">
                {associate.department}
                {associate.department && associate.location && " • "}
                {associate.location}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVertical className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Assign to Project dialog (Prototype)")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Assign Milestone dialog (Prototype)")}>
              <Flag className="mr-2 h-4 w-4" />
              Assign Milestone
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Reassign Tasks dialog (Prototype)")}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reassign Tasks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {associate.activeProjects}/{associate.maxCapacity}
                </p>
                <p className="text-xs text-muted-foreground">Projects (Cap)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <ListTodo className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTasks}</p>
                <p className="text-xs text-muted-foreground">Open Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${associate.milestonesOverdue > 0 ? "bg-red-500/10" : "bg-muted"}`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${associate.milestonesOverdue > 0 ? "text-red-500" : "text-muted-foreground"}`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{associate.milestonesOverdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{associate.avgCycleTime}d</p>
                <p className="text-xs text-muted-foreground">Avg Cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Progress value={associate.performanceScore} className="h-2 w-6" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getPerformanceColor(associate.performanceScore)}`}>
                  {associate.performanceScore}
                </p>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5">
            <Zap className="h-4 w-4" />
            Skills & Strengths
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <ListTodo className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AssociateProfileInfo associate={associate} />
        </TabsContent>

        <TabsContent value="skills">
          <AssociateSkills associate={associate} />
        </TabsContent>

        <TabsContent value="schedule">
          <AssociateSchedule associate={associate} />
        </TabsContent>

        <TabsContent value="projects">
          <AssociateProjects projects={associateProjects} />
        </TabsContent>

        <TabsContent value="tasks">
          <AssociateTasks tasks={associateTasks} />
        </TabsContent>

        <TabsContent value="uploads">
          <AssociateUploads associateId={id} />
        </TabsContent>

        <TabsContent value="performance">
          <AssociatePerformance associate={associate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
