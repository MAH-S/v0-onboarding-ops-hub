"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Plus,
  User,
} from "lucide-react"
import type { Client, ClientTier, ClientContact } from "@/lib/mock-data"

const ADVISORY_SERVICES = [
  "Strategic Planning",
  "Technology Assessment",
  "Executive Coaching",
  "Board Advisory",
  "Compliance Advisory",
  "Process Optimization",
  "Staff Training",
  "Investor Relations",
  "Financial Modeling",
  "Growth Strategy",
  "Risk Management",
  "Digital Transformation",
]

const STEPS = [
  { id: 1, name: "Company Info" },
  { id: 2, name: "Contact" },
  { id: 3, name: "Retainer Setup" },
  { id: 4, name: "Review" },
]

export function AddAdvisoryClientDialog() {
  const { addClient, associates } = useAppStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  // Company info
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [tier, setTier] = useState<ClientTier>("mid-market")
  const [website, setWebsite] = useState("")

  // Contact
  const [contactName, setContactName] = useState("")
  const [contactRole, setContactRole] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  // Retainer
  const [monthlyFee, setMonthlyFee] = useState("")
  const [hoursIncluded, setHoursIncluded] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [advisorId, setAdvisorId] = useState("")

  const resetForm = () => {
    setStep(1)
    setName("")
    setIndustry("")
    setDescription("")
    setTier("mid-market")
    setWebsite("")
    setContactName("")
    setContactRole("")
    setContactEmail("")
    setContactPhone("")
    setMonthlyFee("")
    setHoursIncluded("")
    setStartDate("")
    setEndDate("")
    setSelectedServices([])
    setAdvisorId("")
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim() && industry.trim()
      case 2:
        return contactName.trim() && contactEmail.trim()
      case 3:
        return monthlyFee && hoursIncluded && startDate && selectedServices.length > 0
      default:
        return true
    }
  }

  const toggleService = (service: string) => {
    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]))
  }

  const handleCreate = () => {
    const contact: ClientContact = {
      id: `cc-${Date.now()}`,
      name: contactName,
      role: contactRole,
      email: contactEmail,
      phone: contactPhone || undefined,
      isPrimary: true,
    }

    const newClient: Client = {
      id: `c${Date.now()}`,
      name,
      industry,
      description,
      status: "active",
      tier,
      clientType: "advisory",
      website: website || undefined,
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zip: "",
      },
      contacts: [contact],
      contractStart: startDate,
      contractEnd: endDate || undefined,
      totalRevenue: 0,
      outstandingBalance: 0,
      healthScore: 85,
      notes: "",
      tags: ["Advisory"],
      createdAt: new Date().toISOString().split("T")[0],
      retainer: {
        monthlyFee: Number.parseFloat(monthlyFee),
        startDate,
        endDate: endDate || undefined,
        hoursIncluded: Number.parseInt(hoursIncluded),
        hoursUsed: 0,
        services: selectedServices,
        advisorId: advisorId || undefined,
        status: "active",
      },
    }

    addClient(newClient)
    toast.success("Advisory client created successfully")
    setOpen(false)
    resetForm()
  }

  const selectedAdvisor = associates.find((a) => a.id === advisorId)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Briefcase className="h-4 w-4" />
          Add Advisory Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Advisory Client</DialogTitle>
          <DialogDescription>Set up a retained monthly support engagement</DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2 py-4 shrink-0">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > s.id
                      ? "bg-emerald-600 text-white"
                      : step === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{s.name}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${step > s.id ? "bg-emerald-600" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Separator className="shrink-0" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1 min-h-0">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the advisory engagement..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Add the primary contact for this advisory client</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactRole">Role/Title</Label>
                  <Input
                    id="contactRole"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="e.g., CEO, CFO"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Monthly Retainer Fee *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyFee"
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      placeholder="10000"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursIncluded">Hours Included/Month *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hoursIncluded"
                      type="number"
                      value={hoursIncluded}
                      onChange={(e) => setHoursIncluded(e.target.value)}
                      placeholder="20"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned Advisor</Label>
                <Select value={advisorId} onValueChange={setAdvisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an advisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {associates.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          <span>{a.name}</span>
                          <span className="text-muted-foreground">- {a.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Services Included *</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                  {ADVISORY_SERVICES.map((service) => (
                    <Badge
                      key={service}
                      variant={selectedServices.includes(service) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleService(service)}
                    >
                      {selectedServices.includes(service) && <Check className="h-3 w-3 mr-1" />}
                      {service}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{selectedServices.length} service(s) selected</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground">{industry}</p>
                  </div>
                  <Badge className="ml-auto bg-purple-600 text-white">Advisory</Badge>
                </div>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primary Contact
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">{contactName}</p>
                    <p className="text-sm text-muted-foreground">{contactRole}</p>
                    <p className="text-sm">{contactEmail}</p>
                    {contactPhone && <p className="text-sm">{contactPhone}</p>}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Retainer Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Fee</span>
                      <span className="font-medium">${Number.parseFloat(monthlyFee || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hours/Month</span>
                      <span className="font-medium">{hoursIncluded} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="font-medium">{startDate}</span>
                    </div>
                    {endDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Date</span>
                        <span className="font-medium">{endDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAdvisor && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Assigned Advisor</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedAdvisor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedAdvisor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedAdvisor.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3">Services Included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="shrink-0" />

        {/* Footer */}
        <div className="flex justify-between pt-4 shrink-0">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Advisory Client
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
