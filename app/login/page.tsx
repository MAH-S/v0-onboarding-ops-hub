"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore, DEMO_USERS, ROLE_PERMISSIONS, ROLE_LABELS, type UserRole } from "@/lib/auth-store"
import { useUserStore } from "@/lib/user-store"
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  LayoutDashboard,
  FolderKanban,
  Target,
  UserCheck,
  Kanban,
  Building2,
  Briefcase,
  Users,
  FileText,
  Flag,
  DollarSign,
  Calculator,
  BarChart3,
  Settings,
  UserCog,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

const ALL_PAGES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "newBusiness", label: "New Business", icon: Target },
  { key: "brokerOnboarding", label: "Broker Onboarding", icon: UserCheck },
  { key: "projectBoard", label: "Project Board", icon: Kanban },
  { key: "clients", label: "Clients", icon: Building2 },
  { key: "advisory", label: "Advisory", icon: Briefcase },
  { key: "associates", label: "Associates", icon: Users },
  { key: "documents", label: "Documents Hub", icon: FileText },
  { key: "milestones", label: "Milestones", icon: Flag },
  { key: "revenue", label: "Revenue Tracker", icon: DollarSign },
  { key: "calculator", label: "Calculator", icon: Calculator },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "userManagement", label: "User Management", icon: UserCog },
] as const

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const { users } = useUserStore()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("elt")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  const navigateAfterLogin = () => {
    router.replace("/")
    router.refresh()
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      setError("No account found with this email address")
      setIsLoading(false)
      return
    }

    if (!user.isActive) {
      setError("Your account has been deactivated. Please contact an administrator.")
      setIsLoading(false)
      return
    }

    login({ ...user, lastLogin: new Date().toISOString() })
    toast.success(`Welcome back, ${user.name}!`)
    navigateAfterLogin()
  }

  const handleDemoLogin = (user: typeof DEMO_USERS[0]) => {
    setIsLoading(true)
    login({ ...user, isActive: true, lastLogin: new Date().toISOString() })
    toast.success(`Logged in as ${user.name}`)
    navigateAfterLogin()
  }

  const getRolePermissions = (role: UserRole) => ROLE_PERMISSIONS[role]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Side - Login Form */}
        <div className="space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              OH
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding Ops Hub</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials or use a demo account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-11 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Quick Demo Login</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.slice(0, 4).map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 justify-start bg-transparent"
                    onClick={() => handleDemoLogin(user)}
                    disabled={isLoading}
                  >
                    <div className="text-left">
                      <p className="text-xs font-medium truncate">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace('-', ' ')}</p>
                    </div>
                  </Button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="text-center lg:text-left text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Right Side - Access Preview */}
        <Card className="border-0 shadow-lg hidden lg:block">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Role Access Preview</CardTitle>
            <CardDescription>See which pages each role can access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="elt" className="text-xs">ELT</TabsTrigger>
                <TabsTrigger value="association-manager" className="text-xs">Manager</TabsTrigger>
                <TabsTrigger value="engagement-lead" className="text-xs">Lead</TabsTrigger>
                <TabsTrigger value="associate" className="text-xs">Associate</TabsTrigger>
              </TabsList>
              
              {(["elt", "association-manager", "engagement-lead", "associate"] as UserRole[]).map((role) => (
                <TabsContent key={role} value={role} className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{ROLE_LABELS[role]}</h4>
                    <Badge variant="outline" className="text-xs">
                      {ALL_PAGES.filter(p => getRolePermissions(role)[p.key as keyof typeof ROLE_PERMISSIONS.elt]).length} / {ALL_PAGES.length} pages
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5 max-h-[320px] overflow-y-auto pr-2">
                    {ALL_PAGES.map((page) => {
                      const hasAccess = getRolePermissions(role)[page.key as keyof typeof ROLE_PERMISSIONS.elt]
                      const Icon = page.icon
                      return (
                        <div 
                          key={page.key}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm ${
                            hasAccess 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="flex-1 truncate text-xs">{page.label}</span>
                          {hasAccess ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {role === "elt" && "Full administrative access to all system features and pages."}
                      {role === "association-manager" && "Manages clients, associates, and business operations."}
                      {role === "engagement-lead" && "Leads project teams with limited administrative access."}
                      {role === "associate" && "Basic access for viewing assigned project tasks only."}
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
