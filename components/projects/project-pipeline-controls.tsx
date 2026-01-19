"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import {
  type Project,
  type ProjectHealth,
  type ProjectLifecycle,
  ONBOARDING_STEPS,
  NEW_BUSINESS_STEPS,
  EXECUTION_STEPS,
  CLOSURE_STEPS,
  LEARNINGS_STEPS,
} from "@/lib/mock-data"
import { toast } from "sonner"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Briefcase,
  Play,
  Archive,
  BookOpen,
  Trophy,
} from "lucide-react"

interface ProjectPipelineControlsProps {
  project: Project
}

const PIPELINE_CONFIG: Record<
  ProjectLifecycle,
  {
    name: string
    icon: typeof Briefcase
    steps: { step: number; label: string }[]
    stepField: keyof Project
    color: string
  }
> = {
  "new-business": {
    name: "New Business Acquisition",
    icon: Briefcase,
    steps: NEW_BUSINESS_STEPS,
    stepField: "newBusinessStep",
    color: "text-blue-500",
  },
  onboarding: {
    name: "Project Onboarding",
    icon: Play,
    steps: ONBOARDING_STEPS,
    stepField: "onboardingStep",
    color: "text-emerald-500",
  },
  execution: {
    name: "Project Execution",
    icon: Play,
    steps: EXECUTION_STEPS,
    stepField: "executionStep",
    color: "text-violet-500",
  },
  closure: {
    name: "Project Closure",
    icon: Archive,
    steps: CLOSURE_STEPS,
    stepField: "closureStep",
    color: "text-amber-500",
  },
  learnings: {
    name: "Project Learnings",
    icon: BookOpen,
    steps: LEARNINGS_STEPS,
    stepField: "learningsStep",
    color: "text-cyan-500",
  },
  completed: {
    name: "Completed",
    icon: Trophy,
    steps: [],
    stepField: "onboardingStep",
    color: "text-green-500",
  },
}

export function ProjectPipelineControls({ project }: ProjectPipelineControlsProps) {
  const {
    updateProjectOnboardingStep,
    updateProjectHealth,
    toggleFinanceAutomation,
    addRiskNote,
    updateProjectNewBusinessStep,
    updateProjectExecutionStep,
    updateProjectClosureStep,
    updateProjectLearningsStep,
  } = useAppStore()

  const lifecycle = project.lifecycle ?? "onboarding"
  const config = PIPELINE_CONFIG[lifecycle]
  const Icon = config.icon

  // Get current step based on lifecycle
  const getCurrentStep = (): number => {
    switch (lifecycle) {
      case "new-business":
        return project.newBusinessStep ?? 1
      case "onboarding":
        return project.onboardingStep ?? 1
      case "execution":
        return project.executionStep ?? 1
      case "closure":
        return project.closureStep ?? 1
      case "learnings":
        return project.learningsStep ?? 1
      default:
        return 1
    }
  }

  const currentStep = getCurrentStep()
  const currentHealth = project.health ?? "on-track"
  const isFinanceBlocked = project.financeAutomationBlocked ?? false
  const financeReadiness = project.financeReadiness ?? "Not Set"
  const auditLog = project.auditLog ?? []

  const [selectedStep, setSelectedStep] = useState(currentStep.toString())
  const [selectedHealth, setSelectedHealth] = useState<ProjectHealth>(currentHealth)
  const [riskNote, setRiskNote] = useState("")

  const handleSaveStep = () => {
    const stepNum = Number.parseInt(selectedStep)
    const stepLabel = config.steps[stepNum - 1]?.label ?? "Unknown"

    switch (lifecycle) {
      case "new-business":
        updateProjectNewBusinessStep(project.id, stepNum)
        break
      case "onboarding":
        updateProjectOnboardingStep(project.id, stepNum)
        break
      case "execution":
        updateProjectExecutionStep(project.id, stepNum)
        break
      case "closure":
        updateProjectClosureStep(project.id, stepNum)
        break
      case "learnings":
        updateProjectLearningsStep(project.id, stepNum)
        break
    }
    toast.success(`${config.name} step updated to: ${stepLabel}`)
  }

  const handleSaveHealth = () => {
    updateProjectHealth(project.id, selectedHealth)
    const healthLabels: Record<ProjectHealth, string> = {
      "on-track": "On Track",
      "at-risk": "At Risk",
      "critical-risk": "Critical Risk",
    }
    toast.success(`Project health updated to: ${healthLabels[selectedHealth]}`)
  }

  const handleToggleFinance = () => {
    toggleFinanceAutomation(project.id)
    toast.success(project.financeAutomationBlocked ? "Finance automation unblocked" : "Finance automation blocked")
  }

  const handleAddRiskNote = () => {
    if (!riskNote.trim()) {
      toast.error("Please enter a note")
      return
    }
    addRiskNote(project.id, riskNote)
    setRiskNote("")
    toast.success("Risk/Issue note added")
  }

  const getHealthIcon = (health: ProjectHealth) => {
    switch (health) {
      case "on-track":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "at-risk":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "critical-risk":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  if (lifecycle === "completed") {
    return (
      <div className="space-y-6">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Trophy className="h-5 w-5" />
              Project Completed
            </CardTitle>
            <CardDescription>
              This project has been successfully completed. No further pipeline controls are available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600">
                Completed
              </Badge>
              <span className="text-sm text-muted-foreground">Final Progress: {project.milestonesProgress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Still show audit log for completed projects */}
        <Card>
          <CardHeader>
            <CardTitle>Project History</CardTitle>
            <CardDescription>Audit log of changes made to this project</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No changes recorded</p>
            ) : (
              <div className="space-y-3">
                {auditLog.slice(0, 10).map((log, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user} &middot; {log.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepLabel = config.steps[currentStep - 1]?.label ?? "Not Set"

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <Icon className="h-5 w-5" />
              {config.name}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {config.steps.length}
            </Badge>
          </div>
          <CardDescription className="text-base font-medium">Current Step: {currentStepLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Visual progress bar */}
          <div className="flex gap-1">
            {config.steps.map((s, idx) => (
              <div
                key={s.step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  idx < currentStep - 1 ? "bg-primary" : idx === currentStep - 1 ? "bg-primary/60" : "bg-muted"
                }`}
                title={s.label}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span>{Math.round(((currentStep - 1) / config.steps.length) * 100)}% Complete</span>
            <span>End</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Step */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pipeline Step
            </CardTitle>
            <CardDescription>Current: {currentStepLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Change Step</Label>
              <Select value={selectedStep} onValueChange={setSelectedStep}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.steps.map((stepObj) => (
                    <SelectItem key={stepObj.step} value={stepObj.step.toString()}>
                      <span className={stepObj.step < currentStep ? "text-muted-foreground" : ""}>
                        {stepObj.step}. {stepObj.label}
                        {stepObj.step < currentStep && " (completed)"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveStep} disabled={selectedStep === currentStep.toString()} className="w-full">
              Update Step
            </Button>
          </CardContent>
        </Card>

        {/* Project Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthIcon(currentHealth)}
              Project Health
            </CardTitle>
            <CardDescription>
              Current status:{" "}
              {currentHealth === "on-track" ? "On Track" : currentHealth === "at-risk" ? "At Risk" : "Critical Risk"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Update Health Status</Label>
              <Select value={selectedHealth} onValueChange={(v) => setSelectedHealth(v as ProjectHealth)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-track">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      On Track
                    </div>
                  </SelectItem>
                  <SelectItem value="at-risk">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      At Risk
                    </div>
                  </SelectItem>
                  <SelectItem value="critical-risk">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Critical Risk
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveHealth} disabled={selectedHealth === currentHealth} className="w-full">
              Update Health
            </Button>
          </CardContent>
        </Card>

        {/* Finance Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Finance Automation
            </CardTitle>
            <CardDescription>Control automated finance processes for this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Block Finance Automation</Label>
                <p className="text-sm text-muted-foreground">
                  {isFinanceBlocked ? "Automation is currently blocked" : "Automation is currently enabled"}
                </p>
              </div>
              <Switch checked={isFinanceBlocked} onCheckedChange={handleToggleFinance} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isFinanceBlocked ? "destructive" : "secondary"}>
                {isFinanceBlocked ? "Blocked" : "Active"}
              </Badge>
              <span className="text-sm text-muted-foreground">Finance Readiness: {financeReadiness}</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk/Issue Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Add Risk/Issue Note
            </CardTitle>
            <CardDescription>Document risks or issues for this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the risk or issue..."
              value={riskNote}
              onChange={(e) => setRiskNote(e.target.value)}
              rows={4}
            />
            <Button onClick={handleAddRiskNote} disabled={!riskNote.trim()} className="w-full">
              Add Note
            </Button>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
            <CardDescription>Audit log of recent updates to this project</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No changes recorded yet</p>
            ) : (
              <div className="space-y-3">
                {auditLog.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user} &middot; {log.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function getPipelineTabLabel(lifecycle: ProjectLifecycle): string {
  return PIPELINE_CONFIG[lifecycle]?.name ?? "Pipeline Controls"
}
