"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import type { Project, ProjectHealth, ProjectLifecycle } from "@/lib/mock-data"
import {
  Kanban,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Briefcase,
  Sparkles,
  TrendingUp,
  FileCheck,
  GraduationCap,
  Trophy,
  PartyPopper,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { format } from "date-fns"

const LIFECYCLE_COLUMNS: { id: ProjectLifecycle; title: string; icon: React.ReactNode; color: string }[] = [
  { id: "new-business", title: "New Business", icon: <Sparkles className="h-4 w-4" />, color: "bg-blue-500" },
  { id: "onboarding", title: "Onboarding", icon: <Briefcase className="h-4 w-4" />, color: "bg-purple-500" },
  { id: "execution", title: "Execution", icon: <TrendingUp className="h-4 w-4" />, color: "bg-amber-500" },
  { id: "closure", title: "Closure", icon: <FileCheck className="h-4 w-4" />, color: "bg-emerald-500" },
  { id: "learnings", title: "Learnings", icon: <GraduationCap className="h-4 w-4" />, color: "bg-slate-500" },
  {
    id: "completed" as ProjectLifecycle,
    title: "Completed",
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-gradient-to-r from-yellow-500 to-amber-500",
  },
]

function Confetti({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      delay: number
      duration: number
      color: string
      size: number
      rotation: number
    }>
  >([])

  useEffect(() => {
    if (isActive) {
      const colors = [
        "#f43f5e",
        "#ec4899",
        "#a855f7",
        "#8b5cf6",
        "#6366f1",
        "#3b82f6",
        "#0ea5e9",
        "#14b8a6",
        "#22c55e",
        "#84cc16",
        "#eab308",
        "#f97316",
        "#ef4444",
      ]
      const newParticles = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isActive])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(180deg) scale(0.9);
          }
          50% {
            transform: translateY(50vh) rotate(360deg) scale(0.8);
          }
          75% {
            transform: translateY(75vh) rotate(540deg) scale(0.6);
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.4);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}

function CelebrationDialog({
  isOpen,
  onClose,
  projectName,
}: {
  isOpen: boolean
  onClose: () => void
  projectName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
              <div className="relative rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 p-4">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl flex items-center gap-2 justify-center">
            <PartyPopper className="h-6 w-6 text-amber-500" />
            Congratulations!
            <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            <span className="font-semibold text-foreground">{projectName}</span> has been successfully completed!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Great job on completing this project. The team's hard work has paid off!
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Celebrate!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProjectCard({
  project,
  associates,
}: { project: Project; associates: ReturnType<typeof useAppStore>["associates"] }) {
  const router = useRouter()
  const assignedAssociates = associates.filter((a) => project.assignedAssociates.includes(a.id))
  const isOverdue = new Date(project.dueDate) < new Date()

  const getHealthBadge = (health: ProjectHealth) => {
    switch (health) {
      case "on-track":
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            On Track
          </Badge>
        )
      case "at-risk":
        return (
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            At Risk
          </Badge>
        )
      case "critical-risk":
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600 border-0 text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm group relative hover:shadow-md transition-shadow">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium line-clamp-1">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.client}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 mb-3">{getHealthBadge(project.health)}</div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.milestonesProgress}%</span>
        </div>
        <Progress value={project.milestonesProgress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <div className="flex -space-x-2">
              {assignedAssociates.slice(0, 3).map((associate) => (
                <Tooltip key={associate.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                      <AvatarFallback className="text-xs">
                        {associate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{associate.name}</TooltipContent>
                </Tooltip>
              ))}
              {assignedAssociates.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{assignedAssociates.length - 3}</span>
                </div>
              )}
            </div>
          </TooltipProvider>
        </div>

        <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
          <Calendar className="h-3 w-3" />
          {format(new Date(project.dueDate), "MMM d")}
        </div>
      </div>

      {project.alerts && project.alerts.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            {project.alerts.length} alert{project.alerts.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  )
}

function SortableProjectCard({
  project,
  associates,
}: {
  project: Project
  associates: ReturnType<typeof useAppStore>["associates"]
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <ProjectCard project={project} associates={associates} />
    </div>
  )
}

function DroppableColumn({
  column,
  projects,
  associates,
  isActiveDropZone,
}: {
  column: (typeof LIFECYCLE_COLUMNS)[0]
  projects: Project[]
  associates: ReturnType<typeof useAppStore>["associates"]
  isActiveDropZone: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  })

  const isCompleted = column.id === "completed"
  const showDropIndicator = isOver || isActiveDropZone

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg bg-muted/50 transition-all duration-200 min-w-[280px] max-w-[320px] flex-1 ${
        showDropIndicator ? "bg-primary/10 ring-2 ring-primary scale-[1.02]" : ""
      } ${isCompleted && !showDropIndicator ? "ring-2 ring-yellow-500/30" : ""}`}
    >
      <div className={`p-3 rounded-t-lg ${column.color} ${showDropIndicator ? "opacity-90" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            {column.icon}
            <h3 className="font-semibold text-sm">{column.title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            {projects.length}
          </Badge>
        </div>
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-[400px]">
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 h-full">
            {projects.map((project) => (
              <SortableProjectCard key={project.id} project={project} associates={associates} />
            ))}
            <div
              className={`flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                showDropIndicator
                  ? "border-primary bg-primary/5 h-24"
                  : projects.length === 0
                    ? "h-[200px]"
                    : "h-16 opacity-0 hover:opacity-50"
              } ${isCompleted && !showDropIndicator ? "border-yellow-500/50" : ""}`}
            >
              <p className={`text-sm text-muted-foreground ${showDropIndicator ? "font-medium text-primary" : ""}`}>
                {showDropIndicator
                  ? `Drop here to move to ${column.title}`
                  : isCompleted
                    ? "Drop completed projects here"
                    : "Drop projects here"}
              </p>
            </div>
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default function ProjectBoardPage() {
  const { projects, associates, updateProjectLifecycle } = useAppStore()
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedProjectName, setCompletedProjectName] = useState("")
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null)

  const [localProjects, setLocalProjects] = useState<Project[]>(projects)

  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const triggerCelebration = useCallback((projectName: string) => {
    setCompletedProjectName(projectName)
    setShowConfetti(true)
    setShowCelebration(true)

    setTimeout(() => {
      setShowConfetti(false)
    }, 4000)
  }, [])

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const project = localProjects.find((p) => p.id === event.active.id)
    setActiveProject(project || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (!over) {
      setActiveDropColumn(null)
      return
    }

    const overId = over.id as string

    if (overId.startsWith("column-")) {
      setActiveDropColumn(overId.replace("column-", ""))
    } else {
      const overProject = localProjects.find((p) => p.id === overId)
      if (overProject) {
        setActiveDropColumn(overProject.lifecycle)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProject(null)
    setActiveDropColumn(null)

    if (!over) return

    const projectId = active.id as string
    const overId = over.id as string

    const currentProject = localProjects.find((p) => p.id === projectId)
    if (!currentProject) return

    let targetLifecycle: ProjectLifecycle | null = null

    if (overId.startsWith("column-")) {
      targetLifecycle = overId.replace("column-", "") as ProjectLifecycle
    } else {
      const overProject = localProjects.find((p) => p.id === overId)
      if (overProject) {
        targetLifecycle = overProject.lifecycle
      }
    }

    if (targetLifecycle && currentProject.lifecycle !== targetLifecycle) {
      setLocalProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, lifecycle: targetLifecycle } : p)))

      updateProjectLifecycle(projectId, targetLifecycle)

      if (targetLifecycle === "completed") {
        triggerCelebration(currentProject.name)
      } else {
        const columnTitle = LIFECYCLE_COLUMNS.find((c) => c.id === targetLifecycle)?.title
        toast.success(`Project moved to ${columnTitle}`)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveProject(null)
    setActiveDropColumn(null)
  }

  const projectsByLifecycle = LIFECYCLE_COLUMNS.map((column) => ({
    ...column,
    projects: localProjects.filter((p) => p.lifecycle === column.id),
  }))

  const totalProjects = localProjects.length
  const atRiskProjects = localProjects.filter((p) => p.health === "at-risk" || p.health === "critical-risk").length
  const completedProjects = localProjects.filter((p) => p.lifecycle === "completed").length

  return (
    <div className="space-y-6">
      <Confetti isActive={showConfetti} />
      <CelebrationDialog isOpen={showCelebration} onClose={handleCloseCelebration} projectName={completedProjectName} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Board</h1>
          <p className="text-muted-foreground">Drag and drop projects between lifecycle stages</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{totalProjects}</span>
            <span className="text-muted-foreground">projects</span>
          </div>
          {completedProjects > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-600">{completedProjects}</span>
              <span className="text-muted-foreground">completed</span>
            </div>
          )}
          {atRiskProjects > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-amber-600">{atRiskProjects}</span>
              <span className="text-muted-foreground">at risk</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Kanban className="h-5 w-5 text-primary" />
            Project Pipeline
          </CardTitle>
          <CardDescription>Move projects through lifecycle stages by dragging them between columns</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {projectsByLifecycle.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  projects={column.projects}
                  associates={associates}
                  isActiveDropZone={activeDropColumn === column.id}
                />
              ))}
            </div>
            <DragOverlay>
              {activeProject && <ProjectCard project={activeProject} associates={associates} />}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  )
}
