"use client"

import React from "react"
import { Suspense } from "react"
import Loading from "./loading"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Associate } from "@/lib/mock-data"

const ROLES = [
  "Senior Consultant",
  "Consultant",
  "Associate Consultant",
  "Analyst",
  "Project Manager",
  "Engagement Lead",
  "Technical Lead",
  "Business Analyst",
]

const DEPARTMENTS = [
  "Consulting",
  "Advisory",
  "Operations",
  "Technology",
  "Strategy",
  "Finance",
]

export default function NewAssociatePage() {
  const router = useRouter()
  const { addAssociate } = useAppStore()
  const { user } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Pre-fill from registration
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    location: "",
    bio: "",
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.role) return "Please select a role"
    if (!formData.department) return "Please select a department"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    const newAssociate: Associate = {
      id: `assoc-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      avatar: "",
      availability: "available",
      activeProjects: 0,
      openTasks: 0,
      milestonesOverdue: 0,
      avgCycleTime: 0,
      performanceScore: 80,
      phone: formData.phone || undefined,
      location: formData.location || undefined,
      bio: formData.bio || undefined,
      skills: [],
      certifications: [],
      languages: ["English"],
      education: [],
      hourlyRate: 150,
      utilization: 0,
      billableHours: 0,
      totalHours: 0,
      startDate: new Date().toISOString().split("T")[0],
    }

    addAssociate(newAssociate)
    setSuccess(true)
    toast.success("Profile created successfully!")

    // Redirect after short delay
    setTimeout(() => {
      router.push("/associates")
    }, 1500)

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Profile Created!</h2>
            <p className="text-muted-foreground mb-4">
              Your associate profile has been set up successfully. Redirecting to the team page...
            </p>
            <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <NewAssociatePageContent />
    </Suspense>
  )
}

function NewAssociatePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addAssociate } = useAppStore()
  const { user } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Pre-fill from registration
  const [formData, setFormData] = useState({
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    role: "",
    department: "",
    phone: "",
    location: "",
    bio: "",
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.role) return "Please select a role"
    if (!formData.department) return "Please select a department"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    const newAssociate: Associate = {
      id: `assoc-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      avatar: "",
      availability: "available",
      activeProjects: 0,
      openTasks: 0,
      milestonesOverdue: 0,
      avgCycleTime: 0,
      performanceScore: 80,
      phone: formData.phone || undefined,
      location: formData.location || undefined,
      bio: formData.bio || undefined,
      skills: [],
      certifications: [],
      languages: ["English"],
      education: [],
      hourlyRate: 150,
      utilization: 0,
      billableHours: 0,
      totalHours: 0,
      startDate: new Date().toISOString().split("T")[0],
    }

    addAssociate(newAssociate)
    setSuccess(true)
    toast.success("Profile created successfully!")

    // Redirect after short delay
    setTimeout(() => {
      router.push("/associates")
    }, 1500)

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/associates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground">Fill in your details to set up your associate profile</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10">
                {formData.name ? getInitials(formData.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{formData.name || "Your Name"}</h3>
              <p className="text-sm text-muted-foreground">{formData.role || "Select Role"}</p>
            </div>
            {formData.department && (
              <Badge variant="secondary">{formData.department}</Badge>
            )}
            {formData.email && (
              <p className="text-xs text-muted-foreground">{formData.email}</p>
            )}
            {formData.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formData.location}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be visible to your team members and managers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Role *
                  </Label>
                  <Select value={formData.role} onValueChange={(v) => handleInputChange("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(v) => handleInputChange("department", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a bit about yourself, your expertise, and interests..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/associates">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
