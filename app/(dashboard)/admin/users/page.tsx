"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  UserCog, 
  Plus, 
  MoreHorizontal, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  Pencil, 
  Trash2,
  Users,
  Crown,
  Briefcase,
  User,
  Settings,
  RotateCcw,
  Check,
  X,
  Lock,
  Unlock
} from "lucide-react"
import { toast } from "sonner"
import { useUserStore } from "@/lib/user-store"
import { useAuthStore, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, type UserRole, type AuthUser, type RolePermissions } from "@/lib/auth-store"
import { useAppStore } from "@/lib/store"
import Loading from "./loading"

// Permission categories for better organization
const PERMISSION_CATEGORIES = {
  navigation: {
    label: "Navigation Access",
    description: "Control which pages users can access",
    permissions: [
      { key: "dashboard", label: "Dashboard", description: "View main dashboard" },
      { key: "projects", label: "Projects", description: "Access projects list" },
      { key: "projectBoard", label: "Project Board", description: "View project kanban board" },
      { key: "clients", label: "Clients", description: "Access client management" },
      { key: "associates", label: "Associates", description: "View associates list" },
      { key: "documents", label: "Documents", description: "Access document storage" },
      { key: "milestones", label: "Milestones", description: "View project milestones" },
      { key: "performance", label: "Performance", description: "Access performance metrics" },
      { key: "settings", label: "Settings", description: "Access system settings" },
      { key: "revenue", label: "Revenue", description: "View revenue reports" },
      { key: "advisory", label: "Advisory", description: "Access advisory features" },
      { key: "calculator", label: "Calculator", description: "Use pricing calculator" },
      { key: "userManagement", label: "User Management", description: "Manage user accounts" },
      { key: "newBusiness", label: "New Business", description: "Access new business pipeline" },
      { key: "brokerOnboarding", label: "Broker Onboarding", description: "Access broker onboarding" },
    ]
  },
  projects: {
    label: "Project Permissions",
    description: "Control project-related actions",
    permissions: [
      { key: "createProject", label: "Create Projects", description: "Create new projects" },
      { key: "editProject", label: "Edit Projects", description: "Modify project details" },
      { key: "deleteProject", label: "Delete Projects", description: "Remove projects" },
      { key: "viewAllProjects", label: "View All Projects", description: "See all projects in system" },
      { key: "viewOwnProjectsOnly", label: "View Own Projects Only", description: "Limited to assigned projects" },
      { key: "viewAssignedTasksOnly", label: "View Assigned Tasks Only", description: "Limited to assigned tasks" },
    ]
  },
  clients: {
    label: "Client Permissions",
    description: "Control client-related actions",
    permissions: [
      { key: "createClient", label: "Create Clients", description: "Add new clients" },
      { key: "editClient", label: "Edit Clients", description: "Modify client information" },
    ]
  },
  team: {
    label: "Team Permissions",
    description: "Control team management actions",
    permissions: [
      { key: "createAssociate", label: "Create Associates", description: "Add new associates" },
      { key: "editAssociate", label: "Edit Associates", description: "Modify associate profiles" },
      { key: "manageTeam", label: "Manage Team", description: "Assign team members to projects" },
    ]
  },
  admin: {
    label: "Admin Permissions",
    description: "Control administrative functions",
    permissions: [
      { key: "manageUsers", label: "Manage Users", description: "Add, edit, delete users" },
      { key: "managePermissions", label: "Manage Permissions", description: "Change user permissions" },
    ]
  }
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams()
  const { users, addUser, updateUser, deleteUser, updateUserRole, toggleUserActive, updateUserPermission, resetUserPermissions } = useUserStore()
  const { user: currentUser, hasPermission } = useAuthStore()
  const { associates } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPermissionsSheetOpen, setIsPermissionsSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null)
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "associate" as UserRole,
    associateId: "",
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    byRole: {
      elt: users.filter(u => u.role === "elt").length,
      "association-manager": users.filter(u => u.role === "association-manager").length,
      "engagement-lead": users.filter(u => u.role === "engagement-lead").length,
      associate: users.filter(u => u.role === "associate").length,
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "elt": return "bg-purple-100 text-purple-800 border-purple-200"
      case "association-manager": return "bg-blue-100 text-blue-800 border-blue-200"
      case "engagement-lead": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "associate": return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "elt": return <Crown className="h-3 w-3" />
      case "association-manager": return <Shield className="h-3 w-3" />
      case "engagement-lead": return <Briefcase className="h-3 w-3" />
      case "associate": return <User className="h-3 w-3" />
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  // Get effective permission value (custom override or role default)
  const getEffectivePermission = (user: AuthUser, permKey: string): boolean => {
    if (user.customPermissions && permKey in user.customPermissions) {
      return user.customPermissions[permKey as keyof RolePermissions] as boolean
    }
    return ROLE_PERMISSIONS[user.role][permKey as keyof RolePermissions] as boolean
  }

  // Check if permission is customized
  const isPermissionCustomized = (user: AuthUser, permKey: string): boolean => {
    return user.customPermissions !== undefined && permKey in user.customPermissions
  }

  // Count customized permissions
  const getCustomPermissionCount = (user: AuthUser): number => {
    if (!user.customPermissions) return 0
    return Object.keys(user.customPermissions).length
  }

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }
    
    addUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      associateId: formData.associateId || undefined,
      isActive: true,
    })
    
    setFormData({ name: "", email: "", role: "associate", associateId: "" })
    setIsAddDialogOpen(false)
    toast.success(`User ${formData.name} added successfully`)
  }

  const handleEditUser = () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }
    
    updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      associateId: formData.associateId || undefined,
    })
    
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    toast.success(`User ${formData.name} updated successfully`)
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return
    
    deleteUser(selectedUser.id)
    setIsDeleteDialogOpen(false)
    toast.success(`User ${selectedUser.name} deleted`)
    setSelectedUser(null)
  }

  const handlePermissionToggle = (permKey: string, currentValue: boolean) => {
    if (!selectedUser) return
    updateUserPermission(selectedUser.id, permKey, !currentValue)
    // Update local selected user state
    setSelectedUser({
      ...selectedUser,
      customPermissions: {
        ...selectedUser.customPermissions,
        [permKey]: !currentValue
      }
    })
  }

  const handleResetPermissions = () => {
    if (!selectedUser) return
    resetUserPermissions(selectedUser.id)
    setSelectedUser({
      ...selectedUser,
      customPermissions: undefined
    })
    toast.success("Permissions reset to role defaults")
  }

  const openEditDialog = (user: AuthUser) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      associateId: user.associateId || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: AuthUser) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const openPermissionsSheet = (user: AuthUser) => {
    setSelectedUser(user)
    setIsPermissionsSheetOpen(true)
  }

  // Check if current user can manage users
  if (!hasPermission("userManagement")) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access user management.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elt">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-purple-600" />
                          Executive Leadership Team
                        </div>
                      </SelectItem>
                      <SelectItem value="association-manager">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Association Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="engagement-lead">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-emerald-600" />
                          Engagement Lead
                        </div>
                      </SelectItem>
                      <SelectItem value="associate">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          Associate
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[formData.role]}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="associate">Link to Associate (Optional)</Label>
                  <Select value={formData.associateId} onValueChange={(value) => setFormData({ ...formData, associateId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an associate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {associates.map((assoc) => (
                        <SelectItem key={assoc.id} value={assoc.id}>
                          {assoc.name} - {assoc.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-100">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-100">
                  <UserX className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                  <p className="text-sm text-muted-foreground">Inactive Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byRole.elt}</p>
                  <p className="text-sm text-muted-foreground">Admins (ELT)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="elt">ELT</SelectItem>
                      <SelectItem value="association-manager">Association Manager</SelectItem>
                      <SelectItem value="engagement-lead">Engagement Lead</SelectItem>
                      <SelectItem value="associate">Associate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const customCount = getCustomPermissionCount(user)
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                              <span className="flex items-center gap-1.5">
                                {getRoleIcon(user.role)}
                                {ROLE_LABELS[user.role]}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-transparent"
                              onClick={() => openPermissionsSheet(user)}
                            >
                              <Settings className="h-3.5 w-3.5 mr-1.5" />
                              Edit Access
                              {customCount > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-amber-100 text-amber-700">
                                  {customCount} custom
                                </Badge>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={() => {
                                  toggleUserActive(user.id)
                                  toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`)
                                }}
                                disabled={user.id === currentUser?.id}
                              />
                              <span className={user.isActive ? "text-emerald-600" : "text-slate-500"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openPermissionsSheet(user)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(user)}
                                  disabled={user.id === currentUser?.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>Overview of default permissions by role. Edit individual user permissions from the Users tab.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Permission</TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Crown className="h-4 w-4 text-purple-600" />
                            <span className="text-xs">ELT</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-xs">Assoc. Manager</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Briefcase className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs">Eng. Lead</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <User className="h-4 w-4 text-slate-600" />
                            <span className="text-xs">Associate</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(PERMISSION_CATEGORIES).map(([catKey, category]) => (
                        <>
                          <TableRow key={catKey} className="bg-muted/50">
                            <TableCell colSpan={5} className="font-semibold text-sm">
                              {category.label}
                            </TableCell>
                          </TableRow>
                          {category.permissions.map((perm) => (
                            <TableRow key={perm.key}>
                              <TableCell className="text-sm">{perm.label}</TableCell>
                              {(["elt", "association-manager", "engagement-lead", "associate"] as UserRole[]).map(role => (
                                <TableCell key={role} className="text-center">
                                  {ROLE_PERMISSIONS[role][perm.key as keyof typeof ROLE_PERMISSIONS.elt] ? (
                                    <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-slate-300 mx-auto" />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elt">Executive Leadership Team</SelectItem>
                    <SelectItem value="association-manager">Association Manager</SelectItem>
                    <SelectItem value="engagement-lead">Engagement Lead</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[formData.role]}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-associate">Link to Associate</Label>
                <Select value={formData.associateId} onValueChange={(value) => setFormData({ ...formData, associateId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an associate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {associates.map((assoc) => (
                      <SelectItem key={assoc.id} value={assoc.id}>
                        {assoc.name} - {assoc.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Sheet */}
        <Sheet open={isPermissionsSheetOpen} onOpenChange={setIsPermissionsSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                {selectedUser && (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{selectedUser.name}</p>
                      <Badge variant="outline" className={`${getRoleBadgeColor(selectedUser.role)} mt-1`}>
                        {ROLE_LABELS[selectedUser.role]}
                      </Badge>
                    </div>
                  </>
                )}
              </SheetTitle>
              <SheetDescription>
                Customize individual permissions. Changes override the default role permissions.
              </SheetDescription>
            </SheetHeader>
            
            {selectedUser && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    {getCustomPermissionCount(selectedUser) > 0 ? (
                      <span className="text-amber-600 font-medium">
                        {getCustomPermissionCount(selectedUser)} custom permission{getCustomPermissionCount(selectedUser) !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      "Using default role permissions"
                    )}
                  </div>
                  {getCustomPermissionCount(selectedUser) > 0 && (
                    <Button variant="outline" size="sm" onClick={handleResetPermissions}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Reset to Defaults
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-6 pr-4">
                    {Object.entries(PERMISSION_CATEGORIES).map(([catKey, category]) => (
                      <div key={catKey}>
                        <div className="mb-3">
                          <h4 className="font-semibold text-sm">{category.label}</h4>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                        <div className="space-y-2">
                          {category.permissions.map((perm) => {
                            const effectiveValue = getEffectivePermission(selectedUser, perm.key)
                            const isCustom = isPermissionCustomized(selectedUser, perm.key)
                            const roleDefault = ROLE_PERMISSIONS[selectedUser.role][perm.key as keyof RolePermissions]
                            
                            return (
                              <div
                                key={perm.key}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  isCustom ? 'bg-amber-50 border-amber-200' : 'bg-background'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{perm.label}</span>
                                    {isCustom && (
                                      <Badge variant="outline" className="h-5 text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                  {isCustom && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      Role default: {roleDefault ? 'Allowed' : 'Denied'}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={effectiveValue}
                                    onCheckedChange={() => handlePermissionToggle(perm.key, effectiveValue)}
                                  />
                                  {effectiveValue ? (
                                    <Unlock className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Suspense>
  )
}
