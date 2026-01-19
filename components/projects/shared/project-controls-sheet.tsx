"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { PIPELINE_CONFIG, type Project, type ProjectHealth } from "@/lib/mock-data"

interface ProjectControlsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onStepChange: (step: number) => void
  editHealth: ProjectHealth
  setEditHealth: (health: ProjectHealth) => void
  editFinanceBlocked: boolean
  setEditFinanceBlocked: (blocked: boolean) => void
  riskNote: string
  setRiskNote: (note: string) => void
  onSave: () => void
}

export function ProjectControlsSheet({
  open,
  onOpenChange,
  project,
  onStepChange,
  editHealth,
  setEditHealth,
  editFinanceBlocked,
  setEditFinanceBlocked,
  riskNote,
  setRiskNote,
  onSave,
}: ProjectControlsSheetProps) {
  if (!project) return null

  const pipelineConfig = PIPELINE_CONFIG[project.lifecycle]
  const pipelineName = pipelineConfig.name
  const pipelineSteps = pipelineConfig.steps
  const stepField = pipelineConfig.stepField

  const getCurrentStep = () => {
    switch (project.lifecycle) {
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
  const currentStepLabel = pipelineSteps.find((s) => s.step === currentStep)?.label ?? "Unknown"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Project Controls</SheetTitle>
          <SheetDescription>
            {project.name} - {project.client}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Pipeline</span>
              <Badge variant="outline" className="font-semibold">
                {pipelineName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current Step:</span>
              <span className="font-medium flex items-center gap-1">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {currentStep}
                </span>
                {currentStepLabel}
              </span>
            </div>
          </div>

          {pipelineSteps.length > 0 && (
            <div className="space-y-3">
              <Label>Change Pipeline Step</Label>
              <Select value={currentStep.toString()} onValueChange={(v) => onStepChange(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineSteps.map((step) => (
                    <SelectItem key={step.step} value={step.step.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                          {step.step}
                        </span>
                        {step.label}
                        {step.step === currentStep && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 mt-2">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={step.step}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      step.step < currentStep ? "bg-emerald-500" : step.step === currentStep ? "bg-primary" : "bg-muted"
                    }`}
                    title={`Step ${step.step}: ${step.label}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Start</span>
                <span>
                  {currentStep} of {pipelineSteps.length}
                </span>
                <span>End</span>
              </div>
            </div>
          )}

          {/* Show message for completed projects */}
          {project.lifecycle === "completed" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Project Completed</span>
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                This project has been successfully completed and archived.
              </p>
            </div>
          )}

          <Separator />

          {/* Health */}
          <div className="space-y-3">
            <Label>Project Health</Label>
            <Select value={editHealth} onValueChange={(v) => setEditHealth(v as ProjectHealth)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-track">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    On Track
                  </div>
                </SelectItem>
                <SelectItem value="at-risk">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    At Risk
                  </div>
                </SelectItem>
                <SelectItem value="critical-risk">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Critical Risk
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Finance Automation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block Finance Automation</Label>
              <p className="text-sm text-muted-foreground">Prevent automated finance processes</p>
            </div>
            <Switch checked={editFinanceBlocked} onCheckedChange={setEditFinanceBlocked} />
          </div>

          <Separator />

          {/* Risk Note */}
          <div className="space-y-3">
            <Label>Add Risk/Issue Note</Label>
            <Textarea
              placeholder="Describe any risks or issues..."
              value={riskNote}
              onChange={(e) => setRiskNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Audit Log */}
          {project.auditLog && project.auditLog.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Recent Changes</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {project.auditLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user} - {format(new Date(log.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <Button onClick={onSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
