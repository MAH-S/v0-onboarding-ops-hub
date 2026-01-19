"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  useAuthStore,
  DEMO_USERS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  type UserRole,
} from "@/lib/auth-store"
import {
  Shield,
  Users,
  Briefcase,
  User,
  Check,
  ChevronRight,
  LayoutDashboard,
  FolderKanban,
  Building2,
  FileText,
  Flag,
  BarChart3,
  Settings,
  Kanban,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ROLE_ICONS: Record<UserRole, typeof Shield> = {
  elt: Shield,
  "association-manager": Users,
  "engagement-lead": Briefcase,
  associate: User,
}

const ROLE_COLORS: Record<UserRole, string> = {
  elt: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "association-manager": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "engagement-lead": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  associate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "projectBoard", label: "Project Board", icon: Kanban },
  { key: "clients", label: "Clients", icon: Building2 },
  { key: "associates", label: "Associates", icon: Users },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "milestones", label: "Milestones", icon: Flag },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const filteredUsers = selectedRole ? DEMO_USERS.filter((u) => u.role === selectedRole) : []

  const handleLogin = () => {
    const user = DEMO_USERS.find((u) => u.id === selectedUser)
    if (user) {
      login(user)
      // Redirect based on role
      if (user.role === "associate") {
        router.push("/projects")
      } else {
        router.push("/")
      }
    }
  }

  const roles: UserRole[] = ["elt", "association-manager", "engagement-lead", "associate"]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">OH</span>
            </div>
            <h1 className="text-3xl font-bold">Onboarding Ops Hub</h1>
          </div>
          <p className="text-muted-foreground">Select your role to continue</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Your Role</CardTitle>
              <CardDescription>Choose the role that matches your access level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => {
                const Icon = ROLE_ICONS[role]
                const isSelected = selectedRole === role
                const permissions = ROLE_PERMISSIONS[role]
                const accessCount = NAV_ITEMS.filter((item) => permissions[item.key as keyof typeof permissions]).length

                return (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role)
                      setSelectedUser(null)
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", ROLE_COLORS[role])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ROLE_LABELS[role]}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{ROLE_DESCRIPTIONS[role]}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Access to {accessCount} modules</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* User Selection & Access Preview */}
          <div className="space-y-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle>2. Select User</CardTitle>
                <CardDescription>
                  {selectedRole ? `Choose a ${ROLE_LABELS[selectedRole]} account` : "Select a role first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedRole ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select a role to see available users</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No users available for this role</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                          selectedUser === user.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        {selectedUser === user.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Access Preview */}
            {selectedRole && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Access Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {NAV_ITEMS.map((item) => {
                      const hasAccess =
                        ROLE_PERMISSIONS[selectedRole][item.key as keyof (typeof ROLE_PERMISSIONS)[typeof selectedRole]]
                      return (
                        <Badge
                          key={item.key}
                          variant={hasAccess ? "default" : "outline"}
                          className={cn("gap-1", !hasAccess && "opacity-40")}
                        >
                          <item.icon className="h-3 w-3" />
                          {item.label}
                        </Badge>
                      )
                    })}
                  </div>

                  {selectedRole === "engagement-lead" && (
                    <p className="text-xs text-muted-foreground mt-3">
                      * You will only see projects where you are the lead
                    </p>
                  )}
                  {selectedRole === "associate" && (
                    <p className="text-xs text-muted-foreground mt-3">
                      * You will only see projects and tasks assigned to you
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Login Button */}
            <Button className="w-full h-12 text-base" disabled={!selectedUser} onClick={handleLogin}>
              Continue to Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
