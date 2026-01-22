"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useBusinessAcquisitionStore } from "@/lib/business-acquisition-store"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  Briefcase,
  Plus,
  ChevronRight,
  ArrowRight,
  ClipboardCheck,
  Users,
  Settings,
  Mail,
  Phone,
  FileCheck,
  Upload,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

// Onboarding checklist items
interface ChecklistItem {
  id: string
  title: string
  description: string
  category: "client" | "contract" | "project" | "team" | "documentation"
  required: boolean
}

const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  // Client Setup
  { id: "client-profile", title: "Create Client Profile", description: "Set up the client in the system with all contact information", category: "client", required: true },
  { id: "primary-contact", title: "Identify Primary Contact", description: "Establish the main point of contact for the engagement", category: "client", required: true },
  { id: "stakeholder-mapping", title: "Map Key Stakeholders", description: "Identify all key stakeholders and decision makers", category: "client", required: false },
  
  // Contract & Finance
  { id: "contract-signed", title: "Contract Signed", description: "Ensure all contract documents are signed and filed", category: "contract", required: true },
  { id: "sow-finalized", title: "SOW Finalized", description: "Statement of Work is finalized and approved", category: "contract", required: true },
  { id: "billing-setup", title: "Billing Setup", description: "Set up billing details and payment schedule", category: "contract", required: true },
  { id: "nda-signed", title: "NDA Signed", description: "Non-disclosure agreement signed by both parties", category: "contract", required: false },
  
  // Project Setup
  { id: "project-created", title: "Create Project", description: "Set up the project in the project management system", category: "project", required: true },
  { id: "milestones-defined", title: "Define Milestones", description: "Create project milestones and timeline", category: "project", required: true },
  { id: "kickoff-scheduled", title: "Schedule Kickoff Meeting", description: "Schedule and send invites for project kickoff", category: "project", required: true },
  { id: "success-criteria", title: "Define Success Criteria", description: "Document project success metrics and KPIs", category: "project", required: false },
  
  // Team Assignment
  { id: "lead-assigned", title: "Assign Engagement Lead", description: "Assign a project lead to manage the engagement", category: "team", required: true },
  { id: "team-assembled", title: "Assemble Project Team", description: "Assign all required team members", category: "team", required: true },
  { id: "team-intro", title: "Team Introduction", description: "Introduce project team to client contacts", category: "team", required: false },
  
  // Documentation
  { id: "project-folder", title: "Create Project Folder", description: "Set up shared document repository", category: "documentation", required: true },
  { id: "templates-loaded", title: "Load Project Templates", description: "Add relevant templates to project folder", category: "documentation", required: false },
  { id: "access-granted", title: "Grant System Access", description: "Provide team with necessary system access", category: "documentation", required: true },
]

const CATEGORY_CONFIG = {
  client: { label: "Client Setup", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  contract: { label: "Contract & Finance", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  project: { label: "Project Setup", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
  team: { label: "Team Assignment", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  documentation: { label: "Documentation", icon: FileCheck, color: "text-slate-600", bg: "bg-slate-50" },
}

export default function BrokerOnboardingPage() {
  const router = useRouter()
  const { leads, getWonLeads, updateLead } = useBusinessAcquisitionStore()
  const { associates, clients, addProject, addClient } = useAppStore()
  const { user } = useAuthStore()
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showCreateProject, setShowCreateProject] = useState(false)
  
  // Form states
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [leadAssignee, setLeadAssignee] = useState("")
  
  const wonLeads = getWonLeads()
  const selectedLead = leads.find(l => l.id === selectedLeadId)
  
  // Calculate progress
  const requiredItems = ONBOARDING_CHECKLIST.filter(item => item.required)
  const completedRequired = requiredItems.filter(item => completedItems.has(item.id)).length
  const progress = Math.round((completedRequired / requiredItems.length) * 100)
  
  // Group items by category
  const categories = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>
  
  const toggleItem = (itemId: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }
  
  const handleCreateProject = () => {
    if (!selectedLead || !projectName || !leadAssignee) {
      toast.error("Please fill in all required fields")
      return
    }
    
    // Check if client exists, if not create one
    let clientId = selectedLead.convertedClientId
    const existingClient = clients.find(c => c.name === selectedLead.companyName)
    
    if (!existingClient && !clientId) {
      // Would create client here - for now just use company name
      toast.info(`Client "${selectedLead.companyName}" will be created`)
    }
    
    // Create project
    const newProjectId = `proj-${Date.now()}`
    addProject({
      id: newProjectId,
      name: projectName,
      client: selectedLead.companyName,
      status: "Onboarding",
      health: "on-track",
      milestonesProgress: 0,
      assignedAssociates: [leadAssignee],
      ownerId: leadAssignee,
      dueDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lifecycle: "onboarding",
      avgCycleTime: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      alerts: [],
      financeReadiness: "quote",
      description: projectDescription,
    })
    
    // Update lead with project ID
    updateLead(selectedLeadId!, { convertedProjectId: newProjectId })
    
    toast.success("Project created successfully!")
    setShowCreateProject(false)
    
    // Mark project-created as complete
    setCompletedItems(prev => new Set([...prev, "project-created"]))
  }
  
  const handleCompleteOnboarding = () => {
    if (progress < 100) {
      toast.error("Please complete all required items before finishing onboarding")
      return
    }
    
    toast.success("Onboarding completed! Redirecting to project...")
    
    if (selectedLead?.convertedProjectId) {
      router.push(`/projects/${selectedLead.convertedProjectId}`)
    } else {
      router.push("/projects")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/new-business">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-emerald-500" />
            Broker Onboarding
          </h1>
          <p className="text-muted-foreground">Complete the onboarding process for won opportunities</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Won Leads List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Won Opportunities
            </CardTitle>
            <CardDescription>Select a won lead to start onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {wonLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No won leads yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/new-business">Go to Pipeline</Link>
                </Button>
              </div>
            ) : (
              wonLeads.map(lead => {
                const owner = associates.find(a => a.id === lead.leadOwnerId)
                const isSelected = selectedLeadId === lead.id
                const hasProject = !!lead.convertedProjectId
                
                return (
                  <div
                    key={lead.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lead.companyName}
                        </p>
                      </div>
                      {hasProject && (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Project Created
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        ${lead.estimatedValue.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        Won {lead.winDate ? format(new Date(lead.winDate), "MMM d") : '-'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Onboarding Checklist */}
        <Card className="lg:col-span-2">
          {!selectedLeadId ? (
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
              <ClipboardCheck className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a won opportunity to view onboarding checklist</p>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      Onboarding Checklist
                    </CardTitle>
                    <CardDescription>
                      {selectedLead?.name} - {selectedLead?.companyName}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="w-24 h-2" />
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {completedRequired}/{requiredItems.length} required items
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions */}
                {!selectedLead?.convertedProjectId && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-800">Project Not Created</p>
                          <p className="text-sm text-amber-600">Create a project to continue onboarding</p>
                        </div>
                      </div>
                      <Button onClick={() => setShowCreateProject(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={activeCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory("all")}
                  >
                    All
                  </Button>
                  {categories.map(cat => {
                    const config = CATEGORY_CONFIG[cat]
                    const Icon = config.icon
                    const catItems = ONBOARDING_CHECKLIST.filter(item => item.category === cat)
                    const catCompleted = catItems.filter(item => completedItems.has(item.id)).length
                    
                    return (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(cat)}
                        className="gap-1.5"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {catCompleted}/{catItems.length}
                        </Badge>
                      </Button>
                    )
                  })}
                </div>

                {/* Checklist Items */}
                <div className="space-y-4">
                  {categories
                    .filter(cat => activeCategory === "all" || activeCategory === cat)
                    .map(cat => {
                      const config = CATEGORY_CONFIG[cat]
                      const Icon = config.icon
                      const items = ONBOARDING_CHECKLIST.filter(item => item.category === cat)
                      
                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${config.bg}`}>
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <h3 className="font-medium text-sm">{config.label}</h3>
                          </div>
                          <div className="space-y-1 pl-8">
                            {items.map(item => {
                              const isCompleted = completedItems.has(item.id)
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                                    isCompleted ? 'opacity-60' : ''
                                  }`}
                                  onClick={() => toggleItem(item.id)}
                                >
                                  <Checkbox checked={isCompleted} className="mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>
                                        {item.title}
                                      </p>
                                      {item.required && (
                                        <Badge variant="secondary" className="text-[10px] h-4">Required</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Complete Button */}
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ready to complete onboarding?</p>
                    <p className="text-xs text-muted-foreground">
                      {progress === 100 ? 'All required items completed!' : `Complete all required items (${completedRequired}/${requiredItems.length})`}
                    </p>
                  </div>
                  <Button
                    onClick={handleCompleteOnboarding}
                    disabled={progress < 100}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Onboarding
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && selectedLead && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Create Project
              </CardTitle>
              <CardDescription>
                Set up the project for {selectedLead.companyName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder={selectedLead.name}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lead">Engagement Lead *</Label>
                <Select value={leadAssignee} onValueChange={setLeadAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {associates.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={a.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[9px]">{a.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {a.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
