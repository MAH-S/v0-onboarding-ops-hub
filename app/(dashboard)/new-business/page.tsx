"use client"

import React from "react"
import { Suspense } from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBusinessAcquisitionStore, type BusinessLead, type AcquisitionStage, ACQUISITION_STAGES } from "@/lib/business-acquisition-store"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
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
import {
  Briefcase,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  DollarSign,
  User,
  Building2,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  Target,
  Award,
  ArrowRight,
  Phone,
  Mail,
  Trophy,
  ThumbsDown,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  ClipboardCheck,
  FileCheck,
  Users,
  Sparkles,
} from "lucide-react"

// Pipeline stage configuration with colors
const STAGE_CONFIG: Record<AcquisitionStage, { color: string; bgColor: string; icon: React.ReactNode }> = {
  "bid-evaluation": { color: "bg-blue-500", bgColor: "bg-blue-50", icon: <ClipboardCheck className="h-4 w-4" /> },
  "bid-manual": { color: "bg-purple-500", bgColor: "bg-purple-50", icon: <FileText className="h-4 w-4" /> },
  "bid-pricing": { color: "bg-amber-500", bgColor: "bg-amber-50", icon: <DollarSign className="h-4 w-4" /> },
  "consulting-vertical-lead": { color: "bg-indigo-500", bgColor: "bg-indigo-50", icon: <Users className="h-4 w-4" /> },
  "win": { color: "bg-emerald-500", bgColor: "bg-emerald-50", icon: <Trophy className="h-4 w-4" /> },
  "loss": { color: "bg-red-500", bgColor: "bg-red-50", icon: <ThumbsDown className="h-4 w-4" /> },
}

// Lead Card Component
function LeadCard({ lead, associates, onClick }: { lead: BusinessLead; associates: any[]; onClick: () => void }) {
  const owner = associates.find(a => a.id === lead.leadOwnerId)
  const isWin = lead.stage === "win"
  const isLoss = lead.stage === "loss"
  
  return (
    <div 
      className={`rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
        isWin ? 'border-emerald-200 bg-emerald-50/30' : isLoss ? 'border-red-200 bg-red-50/30' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium line-clamp-1">{lead.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {lead.companyName}
          </div>
        </div>
        {isWin && <Trophy className="h-4 w-4 text-emerald-500" />}
        {isLoss && <ThumbsDown className="h-4 w-4 text-red-500" />}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs font-mono">
          ${(lead.estimatedValue / 1000).toFixed(0)}k
        </Badge>
        <Badge 
          variant="secondary" 
          className={`text-xs ${
            lead.probability >= 70 ? 'bg-emerald-100 text-emerald-700' :
            lead.probability >= 40 ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}
        >
          {lead.probability}% prob
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 border">
                  <AvatarImage src={owner?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-[9px]">
                    {owner?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {owner?.name?.split(' ')[0] || 'Unassigned'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{owner?.name || 'Unassigned'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(lead.expectedCloseDate), "MMM d")}
        </div>
      </div>
    </div>
  )
}

// Sortable Lead Card
function SortableLeadCard({ lead, associates, onClick }: { lead: BusinessLead; associates: any[]; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <LeadCard lead={lead} associates={associates} onClick={onClick} />
    </div>
  )
}

// Droppable Column
function DroppableColumn({
  stage,
  leads,
  associates,
  isActiveDropZone,
  onLeadClick,
}: {
  stage: typeof ACQUISITION_STAGES[0]
  leads: BusinessLead[]
  associates: any[]
  isActiveDropZone: boolean
  onLeadClick: (lead: BusinessLead) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${stage.id}` })
  const config = STAGE_CONFIG[stage.id]
  const showDropIndicator = isOver || isActiveDropZone

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg bg-muted/50 transition-all duration-200 min-w-[260px] max-w-[300px] flex-1 ${
        showDropIndicator ? "bg-primary/10 ring-2 ring-primary scale-[1.01]" : ""
      }`}
    >
      <div className={`p-3 rounded-t-lg ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            {config.icon}
            <h3 className="font-semibold text-sm">{stage.title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            {leads.length}
          </Badge>
        </div>
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-[350px] max-h-[500px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {leads.map(lead => (
              <SortableLeadCard key={lead.id} lead={lead} associates={associates} onClick={() => onLeadClick(lead)} />
            ))}
            <div
              className={`flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                showDropIndicator
                  ? "border-primary bg-primary/5 h-20"
                  : leads.length === 0
                    ? "h-[150px]"
                    : "h-12 opacity-0 hover:opacity-50"
              }`}
            >
              <p className={`text-xs text-muted-foreground ${showDropIndicator ? "font-medium text-primary" : ""}`}>
                {showDropIndicator ? `Move to ${stage.title}` : "Drop leads here"}
              </p>
            </div>
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

// Add Lead Dialog
function AddLeadDialog({ 
  open, 
  onOpenChange, 
  associates 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  associates: any[]
}) {
  const { addLead } = useBusinessAcquisitionStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    industry: "",
    estimatedValue: "",
    leadOwnerId: user?.associateId || "",
    description: "",
    source: "",
    probability: "50",
    expectedCloseDate: "",
    contactName: "",
    contactEmail: "",
    contactRole: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.companyName || !formData.leadOwnerId) {
      toast.error("Please fill in required fields")
      return
    }

    addLead({
      name: formData.name,
      companyName: formData.companyName,
      industry: formData.industry,
      estimatedValue: parseFloat(formData.estimatedValue) || 0,
      currency: "USD",
      stage: "bid-evaluation",
      leadOwnerId: formData.leadOwnerId,
      contacts: formData.contactName ? [{
        id: `contact-${Date.now()}`,
        name: formData.contactName,
        email: formData.contactEmail,
        role: formData.contactRole,
        isPrimary: true,
      }] : [],
      description: formData.description,
      source: formData.source,
      probability: parseInt(formData.probability) || 50,
      expectedCloseDate: formData.expectedCloseDate || new Date().toISOString().split('T')[0],
      notes: [],
      tags: [],
    })

    toast.success("Lead created successfully")
    onOpenChange(false)
    setFormData({
      name: "",
      companyName: "",
      industry: "",
      estimatedValue: "",
      leadOwnerId: user?.associateId || "",
      description: "",
      source: "",
      probability: "50",
      expectedCloseDate: "",
      contactName: "",
      contactEmail: "",
      contactRole: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Add New Lead
          </DialogTitle>
          <DialogDescription>Create a new business opportunity in the acquisition pipeline</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Opportunity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cloud Migration Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., TechCorp Inc"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={formData.estimatedValue}
                onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Win Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={e => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Lead Owner *</Label>
              <Select value={formData.leadOwnerId} onValueChange={v => setFormData({ ...formData, leadOwnerId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
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
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select value={formData.source} onValueChange={v => setFormData({ ...formData, source: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="How was this lead acquired?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Website Inquiry">Website Inquiry</SelectItem>
                  <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Partner Referral">Partner Referral</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closeDate">Expected Close Date</Label>
            <Input
              id="closeDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the opportunity..."
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Primary Contact (Optional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactRole">Role</Label>
                <Input
                  id="contactRole"
                  value={formData.contactRole}
                  onChange={e => setFormData({ ...formData, contactRole: e.target.value })}
                  placeholder="CTO"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Lead Detail Dialog
function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  associates,
}: {
  lead: BusinessLead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  associates: any[]
}) {
  const router = useRouter()
  const { moveToStage, markAsWin, markAsLoss, addNote, updateLead } = useBusinessAcquisitionStore()
  const { user } = useAuthStore()
  const [newNote, setNewNote] = useState("")
  const [showLossDialog, setShowLossDialog] = useState(false)
  const [lossReason, setLossReason] = useState("")
  const [competitor, setCompetitor] = useState("")
  const [lossNotes, setLossNotes] = useState("")

  if (!lead) return null

  const owner = associates.find(a => a.id === lead.leadOwnerId)
  const currentStageIndex = ACQUISITION_STAGES.findIndex(s => s.id === lead.stage)
  const isInPipeline = currentStageIndex >= 0 && currentStageIndex < 4

  const handleMoveToNextStage = () => {
    if (currentStageIndex < 3) {
      const nextStage = ACQUISITION_STAGES[currentStageIndex + 1]
      moveToStage(lead.id, nextStage.id, user?.id || "")
      toast.success(`Moved to ${nextStage.title}`)
    }
  }

  const handleWin = () => {
    markAsWin(lead.id, user?.id || "")
    toast.success("Congratulations! Lead marked as Won")
    router.push("/broker-onboarding")
  }

  const handleLoss = () => {
    if (!lossReason) {
      toast.error("Please select a loss reason")
      return
    }
    markAsLoss(lead.id, user?.id || "", lossReason, competitor, lossNotes)
    toast.info("Lead marked as Lost")
    setShowLossDialog(false)
    onOpenChange(false)
    router.push("/projects?tab=losses")
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNote(lead.id, newNote, user?.id || "")
    setNewNote("")
    toast.success("Note added")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {lead.name}
                  {lead.stage === "win" && <Trophy className="h-5 w-5 text-emerald-500" />}
                  {lead.stage === "loss" && <ThumbsDown className="h-5 w-5 text-red-500" />}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {lead.companyName} | {lead.industry}
                </DialogDescription>
              </div>
              <Badge className={`${STAGE_CONFIG[lead.stage].color} text-white`}>
                {ACQUISITION_STAGES.find(s => s.id === lead.stage)?.title}
              </Badge>
            </div>
          </DialogHeader>

          {/* Pipeline Progress */}
          <div className="py-4 border-b">
            <div className="flex items-center gap-1">
              {ACQUISITION_STAGES.slice(0, 4).map((stage, idx) => {
                const isPast = idx < currentStageIndex
                const isCurrent = idx === currentStageIndex
                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div className={`flex-1 h-2 rounded-full ${
                      isPast || isCurrent ? STAGE_CONFIG[stage.id].color : 'bg-muted'
                    }`} />
                    {idx < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              {ACQUISITION_STAGES.slice(0, 4).map((stage, idx) => (
                <span key={stage.id} className={`text-xs ${idx === currentStageIndex ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {stage.title.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Estimated Value</p>
              <p className="text-lg font-semibold">${lead.estimatedValue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Win Probability</p>
              <div className="flex items-center gap-2">
                <Progress value={lead.probability} className="h-2 flex-1" />
                <span className="text-sm font-medium">{lead.probability}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Expected Close</p>
              <p className="text-sm font-medium">{format(new Date(lead.expectedCloseDate), "MMM d, yyyy")}</p>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Lead Owner</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={owner?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{owner?.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{owner?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm">{lead.source || 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{lead.description || 'No description provided'}</p>
              </div>
              {lead.stage === "loss" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-red-800 flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Loss Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-red-600">Reason</p>
                      <p className="text-red-800">{lead.lossReason || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-600">Competitor</p>
                      <p className="text-red-800">{lead.competitorWon || 'Unknown'}</p>
                    </div>
                  </div>
                  {lead.lossNotes && (
                    <div>
                      <p className="text-xs text-red-600">Notes</p>
                      <p className="text-sm text-red-800">{lead.lossNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="pt-4">
              {lead.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No contacts added</p>
              ) : (
                <div className="space-y-3">
                  {lead.contacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            {contact.isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`mailto:${contact.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        {contact.phone && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`tel:${contact.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="pt-4">
              <div className="space-y-3">
                {lead.stageHistory.map((update, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${STAGE_CONFIG[update.stage].color} text-white`}>
                      {STAGE_CONFIG[update.stage].icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {ACQUISITION_STAGES.find(s => s.id === update.stage)?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(update.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      {update.notes && <p className="text-sm mt-1">{update.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="pt-4 space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>Add</Button>
              </div>
              <div className="space-y-3">
                {lead.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                ) : (
                  lead.notes.map(note => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
            {isInPipeline && (
              <>
                {currentStageIndex < 3 && (
                  <Button onClick={handleMoveToNextStage}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Move to {ACQUISITION_STAGES[currentStageIndex + 1].title}
                  </Button>
                )}
                {currentStageIndex === 3 && (
                  <>
                    <Button variant="destructive" onClick={() => setShowLossDialog(true)}>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Mark as Loss
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleWin}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Mark as Win
                    </Button>
                  </>
                )}
              </>
            )}
            {lead.stage === "win" && lead.convertedProjectId && (
              <Button onClick={() => router.push(`/projects/${lead.convertedProjectId}`)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loss Reason Dialog */}
      <AlertDialog open={showLossDialog} onOpenChange={setShowLossDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              Record Loss Details
            </AlertDialogTitle>
            <AlertDialogDescription>
              Help us learn from this loss by providing details about why we didn't win.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Loss Reason *</Label>
              <Select value={lossReason} onValueChange={setLossReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Price">Price - Our proposal was too expensive</SelectItem>
                  <SelectItem value="Competition">Competition - Lost to a competitor</SelectItem>
                  <SelectItem value="Timing">Timing - Project delayed or cancelled</SelectItem>
                  <SelectItem value="Requirements">Requirements - Couldn't meet requirements</SelectItem>
                  <SelectItem value="Relationship">Relationship - Existing vendor preference</SelectItem>
                  <SelectItem value="Budget">Budget - Client budget constraints</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Competitor (if applicable)</Label>
              <Input
                value={competitor}
                onChange={e => setCompetitor(e.target.value)}
                placeholder="Who won the deal?"
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={lossNotes}
                onChange={e => setLossNotes(e.target.value)}
                placeholder="Any additional context..."
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoss} className="bg-red-600 hover:bg-red-700">
              Confirm Loss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Main Page Component
function NewBusinessAcquisitionPage() {
  const router = useRouter()
  const { leads, moveToStage } = useBusinessAcquisitionStore()
  const { associates } = useAppStore()
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState("pipeline")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOwner, setFilterOwner] = useState("all")
  const [activeLead, setActiveLead] = useState<BusinessLead | null>(null)
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [localLeads, setLocalLeads] = useState(leads)

  useEffect(() => {
    setLocalLeads(leads)
  }, [leads])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Filter leads
  const filteredLeads = localLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOwner = filterOwner === "all" || lead.leadOwnerId === filterOwner
    return matchesSearch && matchesOwner
  })

  // Group leads by stage
  const pipelineStages = ACQUISITION_STAGES.slice(0, 4) // Only first 4 stages for pipeline
  const leadsByStage = pipelineStages.map(stage => ({
    ...stage,
    leads: filteredLeads.filter(l => l.stage === stage.id)
  }))

  const wonLeads = filteredLeads.filter(l => l.stage === "win")
  const lostLeads = filteredLeads.filter(l => l.stage === "loss")

  // Stats
  const totalValue = filteredLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
  const avgProbability = filteredLeads.length > 0 
    ? Math.round(filteredLeads.reduce((sum, l) => sum + l.probability, 0) / filteredLeads.length)
    : 0

  const handleDragStart = (event: DragStartEvent) => {
    const lead = localLeads.find(l => l.id === event.active.id)
    setActiveLead(lead || null)
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
      const overLead = localLeads.find(l => l.id === overId)
      if (overLead) setActiveDropColumn(overLead.stage)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)
    setActiveDropColumn(null)

    if (!over) return

    const leadId = active.id as string
    const overId = over.id as string
    const currentLead = localLeads.find(l => l.id === leadId)
    if (!currentLead) return

    let targetStage: AcquisitionStage | null = null
    if (overId.startsWith("column-")) {
      targetStage = overId.replace("column-", "") as AcquisitionStage
    } else {
      const overLead = localLeads.find(l => l.id === overId)
      if (overLead) targetStage = overLead.stage
    }

    if (targetStage && currentLead.stage !== targetStage) {
      setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: targetStage } : l))
      moveToStage(leadId, targetStage, user?.id || "")
      
      const stageTitle = ACQUISITION_STAGES.find(s => s.id === targetStage)?.title
      toast.success(`Lead moved to ${stageTitle}`)
    }
  }

  const handleLeadClick = (lead: BusinessLead) => {
    setActiveLead(lead)
    setShowDetailDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Business Acquisition</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and track business opportunities</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredLeads.filter(l => !["win", "loss"].includes(l.stage)).length}</p>
                <p className="text-xs text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgProbability}%</p>
                <p className="text-xs text-muted-foreground">Avg Win Probability</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{wonLeads.length}/{wonLeads.length + lostLeads.length}</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="wins" className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" />
              Wins ({wonLeads.length})
            </TabsTrigger>
            <TabsTrigger value="losses" className="flex items-center gap-1.5">
              <ThumbsDown className="h-4 w-4" />
              Losses ({lostLeads.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="pl-9 w-64"
              />
            </div>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {associates.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => { setActiveLead(null); setActiveDropColumn(null) }}
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {leadsByStage.map(stage => (
                    <DroppableColumn
                      key={stage.id}
                      stage={stage}
                      leads={stage.leads}
                      associates={associates}
                      isActiveDropZone={activeDropColumn === stage.id}
                      onLeadClick={handleLeadClick}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {activeLead && <LeadCard lead={activeLead} associates={associates} onClick={() => {}} />}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wins View */}
        <TabsContent value="wins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-emerald-500" />
                Won Opportunities
              </CardTitle>
              <CardDescription>Successfully acquired business opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {wonLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No wins recorded yet</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {wonLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} associates={associates} onClick={() => handleLeadClick(lead)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Losses View */}
        <TabsContent value="losses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                Lost Opportunities
              </CardTitle>
              <CardDescription>Learn from past losses to improve future outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              {lostLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ThumbsDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No losses recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lostLeads.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleLeadClick(lead)}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Value</p>
                          <p className="font-medium">${lead.estimatedValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reason</p>
                          <Badge variant="secondary">{lead.lossReason || 'Unknown'}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lost To</p>
                          <p className="font-medium">{lead.competitorWon || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p>{lead.lossDate ? format(new Date(lead.lossDate), "MMM d, yyyy") : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddLeadDialog open={showAddDialog} onOpenChange={setShowAddDialog} associates={associates} />
      <LeadDetailDialog 
        lead={activeLead} 
        open={showDetailDialog} 
        onOpenChange={setShowDetailDialog} 
        associates={associates}
      />
    </div>
  )
}

// Loading Component
function Loading() {
  return null
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <NewBusinessAcquisitionPage />
    </Suspense>
  )
}
