"use client"

import React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuthStore, type UserRole } from "@/lib/auth-store"
import { useUserStore } from "@/lib/user-store"
import { useAppStore } from "@/lib/store"
import { Eye, EyeOff, UserPlus, AlertCircle, Check, X } from "lucide-react"
import { toast } from "sonner"

interface PasswordRequirement {
  label: string
  met: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const { users, addUser } = useUserStore()
  const { associates } = useAppStore()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Password validation requirements
  const passwordRequirements: PasswordRequirement[] = useMemo(() => {
    const pwd = formData.password
    return [
      { label: "At least 8 characters", met: pwd.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(pwd) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(pwd) },
      { label: "Contains a number", met: /[0-9]/.test(pwd) },
      { label: "Contains special character (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
    ]
  }, [formData.password])

  const passwordStrength = useMemo(() => {
    const metCount = passwordRequirements.filter(r => r.met).length
    return (metCount / passwordRequirements.length) * 100
  }, [passwordRequirements])

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 80) return "bg-amber-500"
    return "bg-green-500"
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 80) return "Medium"
    return "Strong"
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Please enter your full name"
    }
    if (formData.name.trim().split(' ').length < 2) {
      return "Please enter your full name (first and last)"
    }
    if (!formData.email.trim()) {
      return "Please enter your email address"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address"
    }
    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      return "An account with this email already exists"
    }
    if (!formData.password) {
      return "Please enter a password"
    }
    if (passwordStrength < 80) {
      return "Please create a stronger password that meets all requirements"
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match"
    }
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    // Generate new user ID
    const newUserId = `user-${Date.now()}`
    const newAssociateId = `assoc-${Date.now()}`
    
    // Default role for new registrations is "associate"
    const defaultRole: UserRole = "associate"

    // Create the user
    addUser({
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      role: defaultRole,
      associateId: newAssociateId,
      isActive: true,
    })

    // Get the newly created user
    const newUser = {
      id: newUserId,
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      role: defaultRole,
      associateId: newAssociateId,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    // Log the user in
    login(newUser)
    
    toast.success("Account created successfully! Please complete your profile.")
    
    // Redirect to associate profile setup
    router.push(`/associates/new?userId=${newUserId}&name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            OH
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">Join Onboarding Ops Hub to get started</p>
        </div>

        {/* Registration Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Fill in your details to create a new account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  autoComplete="name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength < 40 ? 'text-red-500' : 
                        passwordStrength < 80 ? 'text-amber-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    {/* Requirements List */}
                    <div className="grid grid-cols-1 gap-1 pt-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-slate-300" />
                          )}
                          <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
