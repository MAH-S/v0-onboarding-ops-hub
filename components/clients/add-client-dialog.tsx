"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Plus,
  Building2,
  Globe,
  Users,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  Tag,
  Check,
  ChevronRight,
  ChevronLeft,
  Trash2,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientStatus, ClientTier, ClientContact, Client } from "@/lib/mock-data"

interface AddClientDialogProps {
  children?: React.ReactNode
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Energy",
  "Real Estate",
  "Transportation",
  "Media & Entertainment",
  "Consulting",
  "Legal",
  "Government",
  "Non-Profit",
  "Other",
]

const STEPS = [
  { id: 1, title: "Company Info", description: "Basic company details" },
  { id: 2, title: "Address", description: "Location information" },
  { id: 3, title: "Contacts", description: "Key people" },
  { id: 4, title: "Contract", description: "Engagement details" },
  { id: 5, title: "Review", description: "Confirm details" },
]

export function AddClientDialog({ children }: AddClientDialogProps) {
  const { addClient } = useAppStore()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Company Info
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [domain, setDomain] = useState("")
  const [website, setWebsite] = useState("")
  const [employeeCount, setEmployeeCount] = useState("")
  const [foundedYear, setFoundedYear] = useState("")
  const [description, setDescription] = useState("")
  const [tier, setTier] = useState<ClientTier>("mid-market")
  const [status, setStatus] = useState<ClientStatus>("prospect")

  // Step 2: Address
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [zip, setZip] = useState("")

  // Step 3: Contacts
  const [contacts, setContacts] = useState<Omit<ClientContact, "id">[]>([])
  const [newContactName, setNewContactName] = useState("")
  const [newContactRole, setNewContactRole] = useState("")
  const [newContactEmail, setNewContactEmail] = useState("")
  const [newContactPhone, setNewContactPhone] = useState("")

  // Step 4: Contract
  const [contractStart, setContractStart] = useState("")
  const [contractEnd, setContractEnd] = useState("")
  const [totalRevenue, setTotalRevenue] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setCurrentStep(1)
    setCompanyName("")
    setIndustry("")
    setDomain("")
    setWebsite("")
    setEmployeeCount("")
    setFoundedYear("")
    setDescription("")
    setTier("mid-market")
    setStatus("prospect")
    setStreet("")
    setCity("")
    setState("")
    setCountry("")
    setZip("")
    setContacts([])
    setNewContactName("")
    setNewContactRole("")
    setNewContactEmail("")
    setNewContactPhone("")
    setContractStart("")
    setContractEnd("")
    setTotalRevenue("")
    setTags([])
    setNewTag("")
    setNotes("")
  }

  const handleAddContact = () => {
    if (!newContactName || !newContactEmail) return
    const isPrimary = contacts.length === 0
    setContacts([
      ...contacts,
      {
        name: newContactName,
        role: newContactRole,
        email: newContactEmail,
        phone: newContactPhone || undefined,
        isPrimary,
      },
    ])
    setNewContactName("")
    setNewContactRole("")
    setNewContactEmail("")
    setNewContactPhone("")
  }

  const handleRemoveContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index)
    // If we removed the primary contact, make the first one primary
    if (contacts[index].isPrimary && newContacts.length > 0) {
      newContacts[0].isPrimary = true
    }
    setContacts(newContacts)
  }

  const handleSetPrimaryContact = (index: number) => {
    setContacts(
      contacts.map((c, i) => ({
        ...c,
        isPrimary: i === index,
      })),
    )
  }

  const handleAddTag = () => {
    if (!newTag || tags.includes(newTag)) return
    setTags([...tags, newTag])
    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return companyName.trim() !== "" && industry !== ""
      case 2:
        return city.trim() !== "" && country.trim() !== ""
      case 3:
        return true // Contacts are optional
      case 4:
        return true // Contract details are optional for prospects
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = () => {
    const clientId = `client-${Date.now()}`
    const newClient: Client = {
      id: clientId,
      name: companyName,
      industry,
      domain: domain || undefined,
      website: website || undefined,
      employeeCount: employeeCount ? Number.parseInt(employeeCount) : undefined,
      foundedYear: foundedYear ? Number.parseInt(foundedYear) : undefined,
      description,
      status,
      tier,
      address: {
        street,
        city,
        state,
        country,
        zip,
      },
      contacts: contacts.map((c, i) => ({ ...c, id: `contact-${clientId}-${i}` })),
      contractStart: contractStart || undefined,
      contractEnd: contractEnd || undefined,
      totalRevenue: totalRevenue ? Number.parseFloat(totalRevenue) : 0,
      outstandingBalance: 0,
      healthScore: status === "prospect" ? 0 : 75,
      notes,
      tags,
      createdAt: new Date().toISOString(),
    }

    addClient(newClient)
    toast.success("Client created successfully", {
      description: `${companyName} has been added to your client directory.`,
    })
    setOpen(false)
    resetForm()
  }

  const getTierBadge = (t: ClientTier) => {
    const styles: Record<ClientTier, string> = {
      enterprise: "bg-purple-600 text-white",
      "mid-market": "bg-amber-600 text-white",
      startup: "bg-cyan-600 text-white",
    }
    return styles[t]
  }

  const getStatusBadge = (s: ClientStatus) => {
    const styles: Record<ClientStatus, string> = {
      active: "bg-emerald-600 text-white",
      prospect: "bg-blue-600 text-white",
      inactive: "bg-gray-500 text-white",
      churned: "bg-red-600 text-white",
    }
    return styles[s]
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your directory. Fill in the details across each step.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : currentStep > step.id
                          ? "bg-primary/20 text-primary border-primary"
                          : "bg-muted text-muted-foreground border-muted",
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-8 sm:w-16 mx-2 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="e.g., SaaS, E-commerce"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Employee Count</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="employeeCount"
                      type="number"
                      placeholder="e.g., 500"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="foundedYear"
                      type="number"
                      placeholder="e.g., 2015"
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Client Tier</Label>
                  <Select value={tier} onValueChange={(v) => setTier(v as ClientTier)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="mid-market">Mid-Market</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the company..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span>Company Location</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street, Suite 100"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" placeholder="California" value={state} onChange={(e) => setState(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" placeholder="94102" value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contacts */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Users className="h-5 w-5" />
                <span>Key Contacts</span>
              </div>

              {/* Existing Contacts */}
              {contacts.length > 0 && (
                <div className="space-y-3">
                  {contacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contact.name}</span>
                            {contact.isPrimary && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {contact.role} &bull; {contact.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!contact.isPrimary && (
                          <Button variant="ghost" size="sm" onClick={() => handleSetPrimaryContact(index)}>
                            Set Primary
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveContact(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Contact Form */}
              <div className="p-4 rounded-lg border border-dashed space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UserPlus className="h-4 w-4" />
                  Add a Contact
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactName"
                        placeholder="John Smith"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Role</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactRole"
                        placeholder="CEO, CTO, Project Manager..."
                        value={newContactRole}
                        onChange={(e) => setNewContactRole(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactPhone"
                        placeholder="+1 (555) 123-4567"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddContact}
                  disabled={!newContactName || !newContactEmail}
                  className="w-full bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No contacts added yet. The first contact will be set as the primary contact.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Contract */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractStart">Contract Start Date</Label>
                  <Input
                    id="contractStart"
                    type="date"
                    value={contractStart}
                    onChange={(e) => setContractStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractEnd">Contract End Date</Label>
                  <Input
                    id="contractEnd"
                    type="date"
                    value={contractEnd}
                    onChange={(e) => setContractEnd(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalRevenue">Total Contract Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="totalRevenue"
                      type="number"
                      placeholder="0.00"
                      value={totalRevenue}
                      onChange={(e) => setTotalRevenue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="tags"
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" onClick={handleAddTag} disabled={!newTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this client..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {industry} {domain && `• ${domain}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusBadge(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                    <Badge className={getTierBadge(tier)}>
                      {tier === "mid-market" ? "Mid-Market" : tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </Badge>
                  </div>
                </div>

                {description && <p className="text-sm text-muted-foreground">{description}</p>}

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm">{[city, state, country].filter(Boolean).join(", ")}</p>
                    {street && <p className="text-xs text-muted-foreground">{street}</p>}
                  </div>
                  {website && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Website</p>
                      <p className="text-sm">{website}</p>
                    </div>
                  )}
                  {employeeCount && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Employees</p>
                      <p className="text-sm">{Number.parseInt(employeeCount).toLocaleString()}</p>
                    </div>
                  )}
                  {foundedYear && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Founded</p>
                      <p className="text-sm">{foundedYear}</p>
                    </div>
                  )}
                </div>

                {contacts.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Contacts ({contacts.length})
                      </p>
                      <div className="space-y-2">
                        {contacts.map((contact, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{contact.name}</span>
                            {contact.role && <span className="text-muted-foreground">({contact.role})</span>}
                            {contact.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {(contractStart || totalRevenue) && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {contractStart && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contract Period</p>
                          <p className="text-sm">
                            {contractStart} {contractEnd && `to ${contractEnd}`}
                          </p>
                        </div>
                      )}
                      {totalRevenue && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contract Value</p>
                          <p className="text-sm font-medium">${Number.parseFloat(totalRevenue).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator className="shrink-0" />

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-between shrink-0 bg-background">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
                <Check className="mr-2 h-4 w-4" />
                Create Client
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
