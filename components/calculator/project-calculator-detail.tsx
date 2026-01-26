'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { usePricingStore } from '@/lib/pricing-store'
import { calculateExpenseCost, getAssociateTotalDays, getAllAssignedAssociates, calculateAssigneeDays, getTaskPricing, getMilestoneTotalDays, CURRENCY_CONFIG, Currency, TimeUnit, TaskAssignee } from '@/lib/pricing-types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Check,
  X,
  Calculator,
  Layers,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  Settings,
  UserPlus,
  GanttChart,
  ChevronDown,
  ChevronRight,
  Plane,
  Building2,
  Star
} from 'lucide-react'

interface ProjectCalculatorDetailProps {
  projectId: string
}

const PHASE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

export function ProjectCalculatorDetail({ projectId }: ProjectCalculatorDetailProps) {
  const { projects, clients, associates, addMilestoneToProject, addTaskToMilestone, deleteMilestoneFromProject } = useStore()
  const { 
    getProjectPricing, 
    initProjectPricing,
    addPhase,
    deletePhase,
    addWorkstream,
    updateWorkstream,
    deleteWorkstream,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    addAssigneeToLineItem,
    updateAssigneeDays,
    updateAssigneeTimeUnit,
    removeAssigneeFromLineItem,
    // Milestone pricing actions
    addTaskAssignee,
    updateTaskAssignee,
    updateTaskSettings,
    removeTaskAssignee,
    setAssociateRate,
    setAssociateMarkedUpRate,
    updateExpense,
    updatePricingSettings,
    updatePricingStatus
  } = usePricingStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [addPhaseOpen, setAddPhaseOpen] = useState(false)
  const [newPhaseName, setNewPhaseName] = useState('')
  const [newPhaseStartDate, setNewPhaseStartDate] = useState('')
  const [newPhaseEndDate, setNewPhaseEndDate] = useState('')
  const [addTaskOpen, setAddTaskOpen] = useState<string | null>(null) // phase ID when open
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskStartDate, setNewTaskStartDate] = useState('')
  const [newTaskEndDate, setNewTaskEndDate] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingWorkstream, setEditingWorkstream] = useState<{phaseId: string, workstreamId: string, name: string} | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [phasesInitialized, setPhasesInitialized] = useState(false)
  
  const project = projects.find(p => p.id === projectId)
  const client = project ? clients.find(c => c.id === project.client) : null
  
  useEffect(() => {
    if (projectId) {
      initProjectPricing(projectId)
      // Reset phases initialized flag when project changes
      setPhasesInitialized(false)
    }
  }, [projectId, initProjectPricing])
  
  const pricing = getProjectPricing(projectId)
  
  // Expand all phases by default - only run once when project loads
  useEffect(() => {
    if (project?.milestones && !phasesInitialized) {
      // Use project milestones for the resourcing grid
      const milestoneIds = project.milestones.map(m => m.id)
      // Also include any pricing phases for backwards compatibility
      const pricingPhaseIds = pricing?.phases?.map(p => p.id) || []
      setExpandedPhases(new Set([...milestoneIds, ...pricingPhaseIds]))
      setPhasesInitialized(true)
    }
  }, [project?.milestones, pricing?.phases, phasesInitialized])

  const getAssociate = (id: string) => associates.find(a => a.id === id)
  
  const getAssociateInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Timeline/Gantt data
  const ganttData = useMemo(() => {
    if (!pricing) return { tasks: [], minDate: null, maxDate: null, totalDays: 0, months: [] }
    
    let minDate: Date | null = null
    let maxDate: Date | null = null
    const tasks: Array<{
      id: string
      name: string
      phaseId: string
      phaseName: string
      phaseColor: string
      startDate: Date | null
      endDate: Date | null
      assignees: Array<{ id: string; name: string; initials: string; days: number }>
      totalDays: number
    }> = []

    const phaseColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
    
    pricing.phases.forEach((phase, phaseIndex) => {
      const color = phaseColors[phaseIndex % phaseColors.length]
      
      phase.workstreams.forEach(ws => {
        ws.lineItems.forEach(item => {
          const startDate = item.startDate ? new Date(item.startDate) : null
          const endDate = item.endDate ? new Date(item.endDate) : null
          
          if (startDate && (!minDate || startDate < minDate)) minDate = startDate
          if (endDate && (!maxDate || endDate > maxDate)) maxDate = endDate
          
          const assignees = item.assignees.map(a => {
            const assoc = associates.find(associate => associate.id === a.associateId)
            return {
              id: a.associateId,
              name: assoc?.name || 'Unknown',
              initials: assoc ? assoc.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??',
              days: a.days
            }
          })
          
          tasks.push({
            id: item.id,
            name: `${item.number} ${item.name || 'Unnamed Task'}`,
            phaseId: phase.id,
            phaseName: phase.name,
            phaseColor: color,
            startDate,
            endDate,
            assignees,
            totalDays: item.assignees.reduce((sum, a) => sum + a.days, 0)
          })
        })
      })
    })

    // Calculate months between min and max date
    const months: Array<{ label: string; date: Date }> = []
    if (minDate && maxDate) {
      const current = new Date(minDate)
      current.setDate(1) // Start of month
      while (current <= maxDate) {
        months.push({
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          date: new Date(current)
        })
        current.setMonth(current.getMonth() + 1)
      }
    }

    const totalDays = minDate && maxDate 
      ? Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0

    return { tasks, minDate, maxDate, totalDays, months }
  }, [pricing, associates])
  
  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <Link href="/calculator">
            <Button variant="link">Back to Calculator</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddPhase = () => {
    if (newPhaseName.trim()) {
      // Generate a unique ID for the phase
      const phaseId = `phase-${Date.now()}`
      
      // Add to project milestones (for the resourcing grid)
      addMilestoneToProject(projectId, {
        id: phaseId,
        title: newPhaseName.trim(),
        startDate: newPhaseStartDate || undefined,
        dueDate: newPhaseEndDate || undefined,
      })
      
      // Add to pricing store phases
      addPhase(projectId, newPhaseName.trim())
      
      // Expand the new phase
      setExpandedPhases(prev => new Set([...prev, phaseId]))
      
      // Reset form
      setNewPhaseName('')
      setNewPhaseStartDate('')
      setNewPhaseEndDate('')
      setAddPhaseOpen(false)
    }
  }

  const handleAddTask = (phaseId: string) => {
    const taskName = newTaskName.trim()
    if (taskName) {
      const taskId = `task-${Date.now()}`
      
      // Add task to the project milestone
      addTaskToMilestone(projectId, phaseId, {
        id: taskId,
        title: taskName,
        startDate: newTaskStartDate || undefined,
        dueDate: newTaskEndDate || undefined,
      })
      
      // Reset form
      setNewTaskName('')
      setNewTaskStartDate('')
      setNewTaskEndDate('')
      setAddTaskOpen(null)
    }
  }

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId)
    } else {
      newExpanded.add(phaseId)
    }
    setExpandedPhases(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'priced':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Priced
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Priced
          </Badge>
        )
    }
  }

  // Get all assigned associates
  const assignedAssociateIds = pricing ? getAllAssignedAssociates(pricing) : []
  const assignedAssociates = assignedAssociateIds.map(id => getAssociate(id)).filter(Boolean)

  // Currency formatting
  const currency = pricing?.currency || 'USD'
  const currencyConfig = CURRENCY_CONFIG[currency]
  const currencySymbol = currencyConfig.symbol
  const formatCurrency = (amount: number) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`
    }
    return `${currencyConfig.symbol} ${amount.toLocaleString()}`
  }

  // Calculate totals
  const calculateTotals = () => {
    if (!pricing) return { totalDays: 0, totalManDayCost: 0, totalExpenses: 0, total: 0, withTax: 0 }
    
    let totalDays = 0
    let totalManDayCost = 0
    
    assignedAssociateIds.forEach(assocId => {
      const days = getAssociateTotalDays(pricing, assocId)
      const rate = pricing.associateRates.find(ar => ar.associateId === assocId)
      totalDays += days
      totalManDayCost += days * (rate?.markedUpRate || 0)
    })
    
    const totalExpenses = pricing.expenses.reduce((sum, exp) => sum + calculateExpenseCost(exp), 0)
    const total = totalManDayCost + totalExpenses
    const withTax = total * (1 - pricing.withholdingTaxPercentage / 100)
    
    return { totalDays, totalManDayCost, totalExpenses, total, withTax }
  }

  const totals = calculateTotals()

  // Calculate bar position and width for Gantt chart
  const getBarStyle = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate || !ganttData.minDate || !ganttData.maxDate) {
      return { left: '0%', width: '0%' }
    }
    
    const totalDuration = ganttData.maxDate.getTime() - ganttData.minDate.getTime()
    const startOffset = startDate.getTime() - ganttData.minDate.getTime()
    const duration = endDate.getTime() - startDate.getTime()
    
    const left = (startOffset / totalDuration) * 100
    const width = Math.max((duration / totalDuration) * 100, 2) // Min 2% width
    
    return { left: `${left}%`, width: `${width}%` }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/calculator" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back to Calculator
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {getStatusBadge(pricing?.status || 'not-priced')}
            </div>
            <p className="text-muted-foreground mt-1">{client?.name}</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select
              value={currency}
              onValueChange={(value: Currency) => updatePricingSettings(projectId, { currency: value })}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {pricing && pricing.phases.length > 0 && pricing.status !== 'priced' && (
              <Button 
                onClick={() => updatePricingStatus(projectId, 'priced')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Priced
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="resourcing" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Resourcing Grid</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <GanttChart className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {(!pricing || pricing.phases.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pricing Data Yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Start by adding a phase to begin pricing this project
                </p>
                <Button onClick={() => setAddPhaseOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phase
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Total Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{totals.totalDays}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700">Man Day Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-900">{formatCurrency(totals.totalManDayCost)}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(totals.totalExpenses)}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-pink-700">Grand Total ({currency})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pink-900">{formatCurrency(totals.total)}</div>
                    <p className="text-xs text-pink-600 mt-1">After tax: {formatCurrency(totals.withTax)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Phases Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Phases ({pricing.phases.length})</CardTitle>
                  <Button size="sm" onClick={() => setAddPhaseOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Phase
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pricing.phases.map(phase => {
                      let phaseDays = 0
                      phase.workstreams.forEach(ws => {
                        ws.lineItems.forEach(item => {
                          item.assignees.forEach(a => phaseDays += a.days)
                        })
                      })
                      return (
                        <div 
                          key={phase.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{phase.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {phase.workstreams.length} workstream(s) | {phaseDays} days
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deletePhase(projectId, phase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Summary */}
              {assignedAssociates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Summary ({assignedAssociates.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {assignedAssociates.map(associate => {
                        if (!associate || !pricing) return null
                        const totalDays = getAssociateTotalDays(pricing, associate.id)
                        return (
                          <div key={associate.id} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50/50">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={associate.avatar || ''} />
                              <AvatarFallback className="text-xs">{getAssociateInitials(associate.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{associate.name}</p>
                              <p className="text-xs text-muted-foreground">{totalDays} days</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Resourcing Grid Tab - Phases > Tasks with Team Assignment */}
        <TabsContent value="resourcing" className="space-y-4">
          {/* Quick Stats Bar */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">{assignedAssociates.length} Team Members</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">{totals.totalDays} Total Days</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">{project?.milestones?.length || 0} Phases</span>
            </div>
            <div className="flex-1" />
            <Button size="sm" onClick={() => setAddPhaseOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Phase
            </Button>
          </div>

          {/* Phases */}
          {(!project?.milestones || project.milestones.length === 0) ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Layers className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Phases Yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create phases to organize your project work and assign team members to tasks
                </p>
                <Button onClick={() => setAddPhaseOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Phase
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(() => {
                const phaseColors = ['border-l-blue-500', 'border-l-emerald-500', 'border-l-purple-500', 'border-l-amber-500', 'border-l-rose-500']
                const phaseBgColors = ['bg-blue-50/50', 'bg-emerald-50/50', 'bg-purple-50/50', 'bg-amber-50/50', 'bg-rose-50/50']
                
                // Calculate phase days from milestone pricing
                const getPhaseDays = (milestoneId: string): number => {
                  const mp = pricing?.milestonePricing?.find(m => m.milestoneId === milestoneId)
                  if (!mp) return 0
                  return mp.tasks.reduce((sum, tp) => sum + tp.assignees.reduce((aSum, a) => aSum + (a.days || 0), 0), 0)
                }

                return project.milestones.map((phase, phaseIndex) => {
                  const isExpanded = expandedPhases.has(phase.id)
                  const phaseTotalDays = getPhaseDays(phase.id)
                  
                  return (
                    <Card key={phase.id} className={`border-l-4 ${phaseColors[phaseIndex % phaseColors.length]} overflow-hidden shadow-sm`}>
                      {/* Phase Header */}
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${phaseBgColors[phaseIndex % phaseBgColors.length]}`}
                        onClick={() => togglePhase(phase.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                          <Layers className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{phase.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {phase.tasks.length} tasks | {phaseTotalDays} days | {phase.startDate} - {phase.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                          <Badge variant="outline" className="font-mono">{phase.completion}%</Badge>
                        </div>
                      </div>
                      
                      {/* Phase Content - Tasks */}
                      {isExpanded && (
                        <CardContent className="p-0 border-t bg-white">
                          {phase.tasks.length === 0 ? (
                            <div className="p-6 text-center">
                              {addTaskOpen === phase.id ? (
                                <div className="space-y-3 max-w-lg mx-auto">
                                  <Input
                                    placeholder="Task name..."
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setAddTaskOpen(null)
                                        setNewTaskName('')
                                        setNewTaskStartDate('')
                                        setNewTaskEndDate('')
                                      }
                                    }}
                                    className="h-9 text-sm"
                                    autoFocus
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                                      <Input
                                        type="date"
                                        value={newTaskStartDate}
                                        onChange={(e) => setNewTaskStartDate(e.target.value)}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">End Date</Label>
                                      <Input
                                        type="date"
                                        value={newTaskEndDate}
                                        onChange={(e) => setNewTaskEndDate(e.target.value)}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                                      setAddTaskOpen(null)
                                      setNewTaskName('')
                                      setNewTaskStartDate('')
                                      setNewTaskEndDate('')
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button size="sm" className="h-8" onClick={() => handleAddTask(phase.id)} disabled={!newTaskName.trim()}>
                                      Add Task
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  <p className="mb-3">No tasks in this phase</p>
                                  <Button size="sm" variant="outline" onClick={() => setAddTaskOpen(phase.id)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Task
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="divide-y">
                              {phase.tasks.map((task, taskIndex) => {
                                // Get task pricing
                                const mp = pricing?.milestonePricing?.find(m => m.milestoneId === phase.id)
                                const taskPricing = mp?.tasks.find(t => t.taskId === task.id)
                                const taskAssignees = taskPricing?.assignees || []
                                const taskTimeUnit = taskPricing?.timeUnit || 'full'
                                const taskPeriods = taskPricing?.numberOfPeriods || 0
                                const taskTotalDays = taskAssignees.reduce((sum, a) => sum + (a.days || 0), 0)
                                
                                return (
                                  <div key={task.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-start gap-4">
                                      {/* Task Info */}
                                      <div className="flex-shrink-0 w-56">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline" className="font-mono text-xs">{taskIndex + 1}</Badge>
                                          <span className="font-medium">{task.title}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Due: {task.dueDate || 'Not set'}</p>
                                      </div>
                                      
                                      {/* Time Unit Selector */}
                                      <div className="flex-shrink-0 w-40">
                                        <div className="flex items-center gap-1">
                                          <Select
                                            value={taskTimeUnit}
                                            onValueChange={(value: TimeUnit) => updateTaskSettings(projectId, phase.id, task.id, { timeUnit: value })}
                                          >
                                            <SelectTrigger className="h-8 w-20 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="full">Full</SelectItem>
                                              <SelectItem value="week">Weekly</SelectItem>
                                              <SelectItem value="month">Monthly</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {taskTimeUnit !== 'full' && (
                                            <>
                                              <Input
                                                type="number"
                                                value={taskPeriods || ''}
                                                onChange={(e) => updateTaskSettings(projectId, phase.id, task.id, { numberOfPeriods: parseInt(e.target.value) || 0 })}
                                                className="h-8 w-12 text-center text-xs"
                                                placeholder="0"
                                              />
                                              <span className="text-xs text-muted-foreground">{taskTimeUnit === 'week' ? 'wk' : 'mo'}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Team Members */}
                                      <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          {taskAssignees.map((assignee, assigneeIndex) => {
                                            const assoc = getAssociate(assignee.associateId)
                                            if (!assoc) return null
                                            // First assignee or one marked as lead is the lead
                                            const isLead = assignee.isLead || (assigneeIndex === 0 && !taskAssignees.some(a => a.isLead))
                                            return (
                                              <div key={assignee.associateId} className={`inline-flex items-center h-8 bg-white border rounded-full px-1.5 shadow-sm hover:shadow transition-shadow group/chip ${isLead ? 'border-amber-400 ring-1 ring-amber-200' : 'border-slate-200'}`}>
                                                {isLead && (
                                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-0.5 flex-shrink-0" />
                                                )}
                                                <Avatar className="h-5 w-5 flex-shrink-0">
                                                  <AvatarImage src={assoc.avatar || ''} />
                                                  <AvatarFallback className="text-[9px] bg-primary/10">{getAssociateInitials(assoc.name)}</AvatarFallback>
                                                </Avatar>
                                                <input
                                                  type="number"
                                                  value={taskTimeUnit === 'full' ? (assignee.days || '') : (assignee.daysPerPeriod || '')}
                                                  onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0
                                                    if (taskTimeUnit === 'full') {
                                                      updateTaskAssignee(projectId, phase.id, task.id, assignee.associateId, { days: val })
                                                    } else {
                                                      updateTaskAssignee(projectId, phase.id, task.id, assignee.associateId, { daysPerPeriod: val })
                                                    }
                                                  }}
                                                  className="w-6 h-5 text-xs text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                  placeholder="0"
                                                />
                                                <span className="text-[10px] text-muted-foreground">
                                                  {taskTimeUnit === 'full' ? 'd' : `/${taskTimeUnit === 'week' ? 'wk' : 'mo'}`}
                                                </span>
                                                <button
                                                  type="button"
                                                  className="ml-0.5 h-4 w-4 flex items-center justify-center text-slate-400 hover:text-destructive opacity-0 group-hover/chip:opacity-100 transition-opacity"
                                                  onClick={() => removeTaskAssignee(projectId, phase.id, task.id, assignee.associateId)}
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            )
                                          })}
                                          {/* Add Team Member */}
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-2" align="start">
                                              <div className="space-y-1 max-h-64 overflow-auto">
                                                {associates.filter(a => !taskAssignees.some(ta => ta.associateId === a.id)).map(assoc => (
                                                  <Button
                                                    key={assoc.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start h-8 text-xs"
                                                    onClick={() => addTaskAssignee(projectId, phase.id, task.id, assoc.id)}
                                                  >
                                                    <Avatar className="h-5 w-5 mr-2">
                                                      <AvatarImage src={assoc.avatar || ''} />
                                                      <AvatarFallback className="text-[8px]">{getAssociateInitials(assoc.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate">{assoc.name}</span>
                                                  </Button>
                                                ))}
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                      </div>
                                      
                                      {/* Total Days */}
                                      <div className="flex-shrink-0 w-16 text-right">
                                        <Badge variant={taskTotalDays > 0 ? "default" : "secondary"} className="font-mono">
                                          {taskTotalDays}d
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                              
                              {/* Add Task Button */}
                              <div className="px-4 py-3 border-t bg-slate-50/50">
                                {addTaskOpen === phase.id ? (
                                  <div className="space-y-3">
                                    <Input
                                      placeholder="Task name..."
                                      value={newTaskName}
                                      onChange={(e) => setNewTaskName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                          setAddTaskOpen(null)
                                          setNewTaskName('')
                                          setNewTaskStartDate('')
                                          setNewTaskEndDate('')
                                        }
                                      }}
                                      className="h-8 text-sm"
                                      autoFocus
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                                        <Input
                                          type="date"
                                          value={newTaskStartDate}
                                          onChange={(e) => setNewTaskStartDate(e.target.value)}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">End Date</Label>
                                        <Input
                                          type="date"
                                          value={newTaskEndDate}
                                          onChange={(e) => setNewTaskEndDate(e.target.value)}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                                        setAddTaskOpen(null)
                                        setNewTaskName('')
                                        setNewTaskStartDate('')
                                        setNewTaskEndDate('')
                                      }}>
                                        Cancel
                                      </Button>
                                      <Button size="sm" className="h-8" onClick={() => handleAddTask(phase.id)} disabled={!newTaskName.trim()}>
                                        Add Task
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setAddTaskOpen(phase.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Task
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })
              })()}
            </div>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          {(!pricing || assignedAssociates.length === 0) ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Resources Assigned</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Assign team members in the Resourcing Grid tab first to see pricing breakdown
                </p>
                <Button size="lg" onClick={() => setActiveTab('resourcing')}>
                  <Users className="h-4 w-4 mr-2" />
                  Go to Resourcing Grid
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Team Size</p>
                        <p className="text-2xl font-bold">{assignedAssociates.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm">Man Day Cost</p>
                        <p className="text-2xl font-bold">{formatCurrency(totals.totalManDayCost)}</p>
                      </div>
                      <Calculator className="h-8 w-8 text-emerald-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm">Expenses</p>
                        <p className="text-2xl font-bold">{formatCurrency(totals.totalExpenses)}</p>
                      </div>
                      <Plane className="h-8 w-8 text-amber-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-100 text-sm">Net Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(totals.withTax)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-violet-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Man Day Rates Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Team Rates & Days</CardTitle>
                      <CardDescription>Set base rates for each team member</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <div className="min-w-[700px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold w-48">Category</TableHead>
                            {assignedAssociates.map(assoc => (
                              <TableHead key={assoc?.id} className="text-center min-w-[110px]">
                                <div className="flex flex-col items-center gap-2 py-2">
                                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                                    <AvatarImage src={assoc?.avatar || ''} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{assoc ? getAssociateInitials(assoc.name) : ''}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-center">
                                    <p className="text-xs font-medium truncate max-w-[90px]">{assoc?.name.split(' ')[0]}</p>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[90px]">{assoc?.role}</p>
                                  </div>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center font-bold min-w-[120px] bg-primary/5">
                              <span className="text-primary">TOTAL</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Base Rate Row */}
                          <TableRow className="hover:bg-blue-50/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                Base Rate ({currencySymbol}/day)
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const rate = pricing.associateRates.find(ar => ar.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center">
                                  <div className="flex items-center justify-center">
                                    <span className="text-muted-foreground mr-1">{currencySymbol}</span>
                                    <Input
                                      type="number"
                                      value={rate?.baseRate || ''}
                                      onChange={(e) => setAssociateRate(projectId, assoc.id, parseFloat(e.target.value) || 0)}
                                      className="h-9 w-20 text-center font-mono"
                                      placeholder="0"
                                    />
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>
                          
{/* Marked Up Rate Row */}
  <TableRow className="hover:bg-emerald-50/50">
  <TableCell className="font-medium">
  <div className="flex items-center gap-2">
  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
  Marked Up Rate ({currencySymbol}/day)
  </div>
  </TableCell>
  {assignedAssociates.map(assoc => {
  if (!assoc || !pricing) return <TableCell key="empty" />
  const rate = pricing.associateRates.find(ar => ar.associateId === assoc.id)
  return (
  <TableCell key={assoc.id} className="text-center">
  <div className="flex items-center justify-center">
  <span className="text-emerald-600 mr-1">{currencySymbol}</span>
  <Input
  type="number"
  value={rate?.markedUpRate || ''}
  onChange={(e) => setAssociateMarkedUpRate(projectId, assoc.id, parseFloat(e.target.value) || 0)}
  className="h-9 w-20 text-center font-mono bg-emerald-50 border-emerald-200 text-emerald-700"
  placeholder="0"
  />
  </div>
  </TableCell>
  )
  })}
  <TableCell className="text-center bg-primary/5">-</TableCell>
  </TableRow>

                          {/* Divider */}
                          <TableRow>
                            <TableCell colSpan={assignedAssociates.length + 2} className="h-1 bg-slate-100 p-0"></TableCell>
                          </TableRow>
                          
                          {/* Phase Days */}
                          {pricing.phases.map((phase, idx) => {
                            let phaseTotal = 0
                            const phaseColor = PHASE_COLORS[idx % PHASE_COLORS.length]
                            return (
                              <TableRow key={phase.id} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: phaseColor }}></div>
                                    {phase.name}
                                  </div>
                                </TableCell>
                                {assignedAssociates.map(assoc => {
                                  if (!assoc) return <TableCell key="empty" />
                                  let days = 0
                                  phase.workstreams.forEach(ws => {
                                    ws.lineItems.forEach(item => {
                                      const assignee = item.assignees.find(a => a.associateId === assoc.id)
                                      if (assignee) days += assignee.days
                                    })
                                  })
                                  phaseTotal += days
                                  return (
                                    <TableCell key={assoc.id} className="text-center font-mono">
                                      {days > 0 ? (
                                        <span className="inline-flex items-center justify-center h-7 w-10 rounded bg-slate-100 text-sm">
                                          {days}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="text-center bg-primary/5 font-semibold">{phaseTotal}</TableCell>
                              </TableRow>
                            )
                          })}

                          {/* Divider */}
                          <TableRow>
                            <TableCell colSpan={assignedAssociates.length + 2} className="h-1 bg-slate-100 p-0"></TableCell>
                          </TableRow>
                          
                          {/* Total Man Days */}
                          <TableRow className="bg-slate-50 hover:bg-slate-100">
                            <TableCell className="font-bold text-slate-700">Total Days</TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const days = getAssociateTotalDays(pricing, assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center">
                                  <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-slate-200 font-bold text-slate-700">
                                    {days}
                                  </span>
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/10">
                              <span className="inline-flex items-center justify-center h-8 px-4 rounded-full bg-primary text-white font-bold">
                                {totals.totalDays}
                              </span>
                            </TableCell>
                          </TableRow>
                          
                          {/* Total MD Cost */}
                          <TableRow className="bg-emerald-50 hover:bg-emerald-100">
                            <TableCell className="font-bold text-emerald-700">Man Day Cost</TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const days = getAssociateTotalDays(pricing, assoc.id)
                              const rate = pricing.associateRates.find(ar => ar.associateId === assoc.id)
                              const cost = days * (rate?.markedUpRate || 0)
                              return (
                                <TableCell key={assoc.id} className="text-center font-semibold text-emerald-700 font-mono">
                                  {formatCurrency(cost)}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-emerald-100 font-bold text-emerald-800 font-mono">
                              {formatCurrency(totals.totalManDayCost)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Expenses Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Plane className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Travel & Expenses</CardTitle>
                      <CardDescription>Flights, accommodation, and per diem costs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <div className="min-w-[700px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold w-48">Expense Type</TableHead>
                            {assignedAssociates.map(assoc => (
                              <TableHead key={assoc?.id} className="text-center min-w-[110px]">
                                <span className="text-xs font-medium">{assoc?.name.split(' ')[0]}</span>
                              </TableHead>
                            ))}
                            <TableHead className="text-center font-bold min-w-[120px] bg-primary/5">
                              <span className="text-primary">TOTAL</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Flights */}
                          <TableRow className="hover:bg-amber-50/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Plane className="h-4 w-4 text-amber-500" />
                                Number of Flights
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center">
                                  <Input
                                    type="number"
                                    value={expense?.numberOfFlights || ''}
                                    onChange={(e) => updateExpense(projectId, assoc.id, { numberOfFlights: parseInt(e.target.value) || 0 })}
                                    className="h-9 w-16 mx-auto text-center font-mono"
                                    placeholder="0"
                                  />
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>
                          
                          {/* Avg Flight Cost */}
                          <TableRow className="hover:bg-amber-50/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-amber-500" />
                                Avg Flight Cost
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center">
                                  <div className="flex items-center justify-center">
                                    <span className="text-muted-foreground mr-1 text-sm">{currencySymbol}</span>
                                    <Input
                                      type="number"
                                      value={expense?.avgFlightCost || ''}
                                      onChange={(e) => updateExpense(projectId, assoc.id, { avgFlightCost: parseFloat(e.target.value) || 0 })}
                                      className="h-9 w-20 text-center font-mono"
                                      placeholder="0"
                                    />
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>
                          
                          {/* Days Onsite */}
                          <TableRow className="hover:bg-amber-50/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-amber-500" />
                                Days Onsite
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center">
                                  <Input
                                    type="number"
                                    value={expense?.daysOnsite || ''}
                                    onChange={(e) => updateExpense(projectId, assoc.id, { daysOnsite: parseInt(e.target.value) || 0 })}
                                    className="h-9 w-16 mx-auto text-center font-mono"
                                    placeholder="0"
                                  />
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>

                          {/* Divider */}
                          <TableRow>
                            <TableCell colSpan={assignedAssociates.length + 2} className="h-1 bg-slate-100 p-0"></TableCell>
                          </TableRow>
                          
                          {/* Accommodation */}
                          <TableRow className="bg-slate-50/50 hover:bg-slate-100/50">
                            <TableCell className="font-medium text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Accommodation/Day
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center text-sm text-muted-foreground font-mono">
                                  {formatCurrency(expense?.accommodationPerDay || pricing.defaultAccommodation)}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>
                          
                          {/* Per Diem */}
                          <TableRow className="bg-slate-50/50 hover:bg-slate-100/50">
                            <TableCell className="font-medium text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Per Diem/Day
                              </div>
                            </TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              return (
                                <TableCell key={assoc.id} className="text-center text-sm text-muted-foreground font-mono">
                                  {formatCurrency(expense?.perDiemPerDay || pricing.defaultPerDiem)}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-primary/5">-</TableCell>
                          </TableRow>

                          {/* Divider */}
                          <TableRow>
                            <TableCell colSpan={assignedAssociates.length + 2} className="h-1 bg-slate-100 p-0"></TableCell>
                          </TableRow>
                          
                          {/* Total Expenses */}
                          <TableRow className="bg-amber-50 hover:bg-amber-100">
                            <TableCell className="font-bold text-amber-700">Total Expenses</TableCell>
                            {assignedAssociates.map(assoc => {
                              if (!assoc || !pricing) return <TableCell key="empty" />
                              const expense = pricing.expenses.find(e => e.associateId === assoc.id)
                              const cost = expense ? calculateExpenseCost(expense) : 0
                              return (
                                <TableCell key={assoc.id} className="text-center font-semibold text-amber-700 font-mono">
                                  {formatCurrency(cost)}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center bg-amber-100 font-bold text-amber-800 font-mono">
                              {formatCurrency(totals.totalExpenses)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Final Summary */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-violet-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Final Summary</CardTitle>
                      <CardDescription>Project total with tax calculations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-muted-foreground">Man Day Cost</span>
                      <span className="font-semibold font-mono">{formatCurrency(totals.totalManDayCost)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-muted-foreground">Travel & Expenses</span>
                      <span className="font-semibold font-mono">{formatCurrency(totals.totalExpenses)}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 bg-slate-100 rounded-lg px-4 -mx-4">
                      <span className="font-bold text-lg">Subtotal</span>
                      <span className="font-bold text-xl font-mono">{formatCurrency(totals.total)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-muted-foreground">Withholding Tax ({pricing.withholdingTaxPercentage}%)</span>
                      <span className="font-semibold text-red-600 font-mono">-{formatCurrency(totals.total - totals.withTax)}</span>
                    </div>
                    <div className="flex items-center justify-between py-6 bg-gradient-to-r from-primary to-violet-600 text-white rounded-xl px-6 -mx-4 mt-6">
                      <div>
                        <span className="text-primary-foreground/80 text-sm">Net Total</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-2xl">{currencySymbol}</span>
                          <span className="font-bold text-3xl font-mono tracking-tight">
                            {totals.withTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {currency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab - Gantt Chart Style */}
        <TabsContent value="timeline" className="space-y-6">
          {(!pricing || pricing.phases.length === 0 || ganttData.tasks.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <GanttChart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Timeline Data</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Add phases and set dates in the Resourcing Grid to see the timeline
                </p>
                <Button onClick={() => setActiveTab('resourcing')}>
                  <Users className="h-4 w-4 mr-2" />
                  Go to Resourcing Grid
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>
                      {ganttData.minDate && ganttData.maxDate && (
                        <>
                          {ganttData.minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {ganttData.maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="ml-2 text-primary font-medium">({ganttData.totalDays} days)</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <div className="min-w-[1000px]">
                    {/* Gantt Chart */}
                    <div className="border-t">
                      {/* Month Headers */}
                      <div className="flex border-b bg-slate-100">
                        <div className="w-64 shrink-0 p-3 font-semibold border-r">Task</div>
                        <div className="w-24 shrink-0 p-3 font-semibold border-r text-center">Days</div>
                        <div className="flex-1 relative">
                          <div className="flex h-full">
                            {ganttData.months.map((month, idx) => (
                              <div 
                                key={idx} 
                                className="flex-1 p-2 text-center text-sm font-medium border-r last:border-r-0 min-w-[80px]"
                              >
                                {month.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tasks */}
                      <div className="divide-y">
                        {ganttData.tasks.map((task, taskIndex) => {
                          const barStyle = getBarStyle(task.startDate, task.endDate)
                          const showPhaseBadge = taskIndex === 0 || ganttData.tasks[taskIndex - 1]?.phaseId !== task.phaseId
                          
                          return (
                            <div key={task.id} className="flex hover:bg-slate-50 transition-colors">
                              {/* Task Name */}
                              <div className="w-64 shrink-0 p-3 border-r">
                                <div className="flex items-start gap-2">
                                  {showPhaseBadge && (
                                    <Badge 
                                      style={{ backgroundColor: task.phaseColor }} 
                                      className="text-white text-[10px] shrink-0"
                                    >
                                      {task.phaseName}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm font-medium truncate ${showPhaseBadge ? 'mt-1' : ''}`}>{task.name}</p>
                                {task.assignees.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {task.assignees.slice(0, 3).map(a => (
                                      <TooltipProvider key={a.id}>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <div 
                                              className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-semibold"
                                              style={{ backgroundColor: `${task.phaseColor}20`, color: task.phaseColor }}
                                            >
                                              {a.initials}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{a.name} - {a.days}d</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ))}
                                    {task.assignees.length > 3 && (
                                      <span className="text-xs text-muted-foreground">+{task.assignees.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Total Days */}
                              <div className="w-24 shrink-0 p-3 border-r flex items-center justify-center">
                                <Badge variant="secondary" className="font-mono">
                                  {task.totalDays}d
                                </Badge>
                              </div>
                              
                              {/* Gantt Bar Area */}
                              <div className="flex-1 p-2 relative">
                                <div className="h-full flex items-center">
                                  {/* Grid lines for months */}
                                  <div className="absolute inset-0 flex pointer-events-none">
                                    {ganttData.months.map((_, idx) => (
                                      <div key={idx} className="flex-1 border-r border-slate-200 last:border-r-0" />
                                    ))}
                                  </div>
                                  
                                  {/* Bar */}
                                  {task.startDate && task.endDate ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className="absolute h-7 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden"
                                            style={{ 
                                              left: barStyle.left, 
                                              width: barStyle.width,
                                              backgroundColor: task.phaseColor,
                                              minWidth: '40px'
                                            }}
                                          >
                                            <span className="text-white text-xs font-medium px-2 truncate">
                                              {task.assignees.map(a => a.initials).join(', ')}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                          <div className="space-y-1">
                                            <p className="font-semibold">{task.name}</p>
                                            <p className="text-xs">
                                              {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                                            </p>
                                            <p className="text-xs">{task.totalDays} total days</p>
                                            {task.assignees.length > 0 && (
                                              <div className="pt-1 border-t mt-1">
                                                {task.assignees.map(a => (
                                                  <p key={a.id} className="text-xs">{a.name}: {a.days}d</p>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">No dates set</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Phase Dialog */}
      <Dialog open={addPhaseOpen} onOpenChange={(open) => {
        setAddPhaseOpen(open)
        if (!open) {
          setNewPhaseName('')
          setNewPhaseStartDate('')
          setNewPhaseEndDate('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phase Name</Label>
              <Input
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                placeholder="e.g., Phase 1 - Discovery"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newPhaseStartDate}
                  onChange={(e) => setNewPhaseStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newPhaseEndDate}
                  onChange={(e) => setNewPhaseEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPhaseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPhase} disabled={!newPhaseName.trim()}>Add Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pricing Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Markup Percentage (%)</Label>
                <Input
                  type="number"
                  value={pricing?.markupPercentage || 50}
                  onChange={(e) => updatePricingSettings(projectId, { markupPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Withholding Tax (%)</Label>
                <Input
                  type="number"
                  value={pricing?.withholdingTaxPercentage || 5}
                  onChange={(e) => updatePricingSettings(projectId, { withholdingTaxPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Accommodation/Day</Label>
                <Input
                  type="number"
                  value={pricing?.defaultAccommodation || 275}
                  onChange={(e) => updatePricingSettings(projectId, { defaultAccommodation: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Per Diem/Day</Label>
                <Input
                  type="number"
                  value={pricing?.defaultPerDiem || 80}
                  onChange={(e) => updatePricingSettings(projectId, { defaultPerDiem: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
