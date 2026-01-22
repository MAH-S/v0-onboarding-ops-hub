"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBusinessAcquisitionStore, ACQUISITION_STAGES, type BusinessLead } from "@/lib/business-acquisition-store"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import {
  Trophy,
  Building2,
  DollarSign,
  Calendar,
  Search,
  ExternalLink,
  User,
  FileText,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export function BusinessWinsTable() {
  const router = useRouter()
  const { getWonLeads } = useBusinessAcquisitionStore()
  const { associates, projects } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  const wonLeads = getWonLeads()
  
  // Filter leads
  const filteredLeads = wonLeads.filter(lead => {
    return lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  })
  
  // Calculate win analytics
  const totalWonValue = wonLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
  const avgWonValue = wonLeads.length > 0 ? totalWonValue / wonLeads.length : 0
  const thisMonthWins = wonLeads.filter(l => {
    if (!l.winDate) return false
    const winDate = new Date(l.winDate)
    const now = new Date()
    return winDate.getMonth() === now.getMonth() && winDate.getFullYear() === now.getFullYear()
  }).length
  
  const handleViewDetails = (lead: BusinessLead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }
  
  const getOwner = (ownerId: string) => {
    return associates.find(a => a.id === ownerId)
  }
  
  const getProject = (projectId?: string) => {
    if (!projectId) return null
    return projects.find(p => p.id === projectId)
  }

  return (
    <div className="space-y-4">
      {/* Analytics Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Total Won Deals</p>
          <p className="text-2xl font-bold text-emerald-700">{wonLeads.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Total Won Value</p>
          <p className="text-2xl font-bold text-emerald-700">${(totalWonValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Avg Deal Size</p>
          <p className="text-2xl font-bold text-emerald-700">${(avgWonValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Wins This Month</p>
          <p className="text-2xl font-bold text-emerald-700">{thisMonthWins}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search won opportunities..."
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Table */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No won opportunities found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date Won</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map(lead => {
                const owner = getOwner(lead.leadOwnerId)
                const project = getProject(lead.convertedProjectId)
                return (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(lead)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {lead.companyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-emerald-600 font-medium">
                        ${lead.estimatedValue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={owner?.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {owner?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{owner?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.winDate ? format(new Date(lead.winDate), "MMM d, yyyy") : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project ? (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-sm"
                          onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}`) }}
                        >
                          {project.name}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Not Created</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(lead) }}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                  {selectedLead.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {selectedLead.companyName} | {selectedLead.industry}
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-800">Deal Won!</p>
                      <p className="text-sm text-emerald-600">
                        Won on {selectedLead.winDate ? format(new Date(selectedLead.winDate), "MMMM d, yyyy") : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">
                    ${selectedLead.estimatedValue.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Lead Owner</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={getOwner(selectedLead.leadOwnerId)?.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {getOwner(selectedLead.leadOwnerId)?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{getOwner(selectedLead.leadOwnerId)?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="text-sm">{selectedLead.source || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedLead.description || 'No description'}</p>
                  </div>
                  
                  {selectedLead.convertedProjectId && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Converted Project</p>
                      <Button 
                        variant="outline" 
                        onClick={() => { setDetailOpen(false); router.push(`/projects/${selectedLead.convertedProjectId}`) }}
                      >
                        View Project
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="pt-4">
                  <div className="space-y-3">
                    {selectedLead.stageHistory.map((update, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          update.stage === 'win' ? 'bg-emerald-500' : 'bg-primary'
                        } text-white`}>
                          {update.stage === 'win' ? <Trophy className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
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
                
                <TabsContent value="contacts" className="pt-4">
                  {selectedLead.contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No contacts recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedLead.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
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
              </Tabs>
              
              <DialogFooter>
                {!selectedLead.convertedProjectId && (
                  <Button onClick={() => { setDetailOpen(false); router.push('/broker-onboarding') }}>
                    Start Onboarding
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
