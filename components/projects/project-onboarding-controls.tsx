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
import { type Project, type ProjectHealth, ONBOARDING_STEPS } from "@/lib/mock-data"
import { toast } from "sonner"
import { AlertTriangle, CheckCircle2, Clock, Shield, FileText } from "lucide-react"

interface ProjectOnboardingControlsProps {
  project: Project
}

export function ProjectOnboardingControls({ project }: ProjectOnboardingControlsProps) {
  const { updateProjectOnboardingStep, updateProjectHealth, toggleFinanceAutomation, addRiskNote } = useAppStore()

  const currentStep = project.onboardingStep ?? 1
  const currentHealth = project.health ?? "on-track"
  const isFinanceBlocked = project.financeAutomationBlocked ?? false
  const financeReadiness = project.financeReadiness ?? "Not Set"
  const auditLog = project.auditLog ?? []

  const [selectedStep, setSelectedStep] = useState(currentStep.toString())
  const [selectedHealth, setSelectedHealth] = useState<ProjectHealth>(currentHealth)
  const [riskNote, setRiskNote] = useState("")

  const handleSaveStep = () => {
    updateProjectOnboardingStep(project.id, Number.parseInt(selectedStep))
    const stepLabel = ONBOARDING_STEPS[Number.parseInt(selectedStep) - 1]?.label ?? "Unknown"
    toast.success(`Onboarding step updated to: ${stepLabel}`)
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Onboarding Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Onboarding Step
          </CardTitle>
          <CardDescription>Current step: {ONBOARDING_STEPS[currentStep - 1]?.label ?? "Not Set"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Change Onboarding Step</Label>
            <Select value={selectedStep} onValueChange={setSelectedStep}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ONBOARDING_STEPS.map((stepObj) => (
                  <SelectItem key={stepObj.step} value={stepObj.step.toString()}>
                    {stepObj.step}. {stepObj.label}
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
  )
}
