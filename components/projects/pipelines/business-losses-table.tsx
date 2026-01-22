"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBusinessAcquisitionStore, ACQUISITION_STAGES, type BusinessLead } from "@/lib/business-acquisition-store"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import {
  ThumbsDown,
  Building2,
  DollarSign,
  Calendar,
  Search,
  ExternalLink,
  User,
  FileText,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react"

export function BusinessLossesTable() {
  const router = useRouter()
  const { getLostLeads } = useBusinessAcquisitionStore()
  const { associates } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterReason, setFilterReason] = useState("all")
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  const lostLeads = getLostLeads()
  
  // Filter leads
  const filteredLeads = lostLeads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesReason = filterReason === "all" || lead.lossReason === filterReason
    return matchesSearch && matchesReason
  })
  
  // Get unique loss reasons for filter
  const lossReasons = [...new Set(lostLeads.map(l => l.lossReason).filter(Boolean))]
  
  // Calculate loss analytics
  const totalLostValue = lostLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
  const avgLostValue = lostLeads.length > 0 ? totalLostValue / lostLeads.length : 0
  
  const reasonCounts = lostLeads.reduce((acc, lead) => {
    const reason = lead.lossReason || "Unknown"
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]
  
  const handleViewDetails = (lead: BusinessLead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }
  
  const getOwner = (ownerId: string) => {
    return associates.find(a => a.id === ownerId)
  }

  return (
    <div className="space-y-4">
      {/* Analytics Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Total Lost Opportunities</p>
          <p className="text-2xl font-bold text-red-700">{lostLeads.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Total Lost Value</p>
          <p className="text-2xl font-bold text-red-700">${(totalLostValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Avg Deal Size</p>
          <p className="text-2xl font-bold text-red-700">${(avgLostValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Top Loss Reason</p>
          <p className="text-2xl font-bold text-red-700">{topReason?.[0] || "N/A"}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lost opportunities..."
            className="pl-9"
          />
        </div>
        <Select value={filterReason} onValueChange={setFilterReason}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            {lossReasons.map(reason => (
              <SelectItem key={reason} value={reason!}>{reason}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ThumbsDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No lost opportunities found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Loss Reason</TableHead>
                <TableHead>Lost To</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date Lost</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map(lead => {
                const owner = getOwner(lead.leadOwnerId)
                return (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(lead)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
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
                      <span className="font-mono text-sm">${lead.estimatedValue.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {lead.lossReason || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.competitorWon || "Unknown"}
                      </span>
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
                        {lead.lossDate ? format(new Date(lead.lossDate), "MMM d, yyyy") : '-'}
                      </span>
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
                  <ThumbsDown className="h-5 w-5 text-red-500" />
                  {selectedLead.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {selectedLead.companyName} | {selectedLead.industry}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Loss Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Estimated Value</p>
                      <p className="text-lg font-semibold">${selectedLead.estimatedValue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date Lost</p>
                      <p className="text-sm font-medium">
                        {selectedLead.lossDate ? format(new Date(selectedLead.lossDate), "MMMM d, yyyy") : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                    <h4 className="font-medium text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Why We Lost
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-red-600">Primary Reason</p>
                        <p className="font-medium text-red-800">{selectedLead.lossReason || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-600">Won By</p>
                        <p className="font-medium text-red-800">{selectedLead.competitorWon || 'Unknown competitor'}</p>
                      </div>
                    </div>
                    {selectedLead.lossNotes && (
                      <div>
                        <p className="text-xs text-red-600">Additional Notes</p>
                        <p className="text-sm text-red-800 mt-1">{selectedLead.lossNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedLead.description || 'No description'}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="pt-4">
                  <div className="space-y-3">
                    {selectedLead.stageHistory.map((update, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          update.stage === 'loss' ? 'bg-red-500' : 'bg-primary'
                        } text-white`}>
                          {update.stage === 'loss' ? <ThumbsDown className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
