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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
  User
} from "lucide-react"
import { toast } from "sonner"
import { useUserStore } from "@/lib/user-store"
import { useAuthStore, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, type UserRole, type AuthUser } from "@/lib/auth-store"
import { useAppStore } from "@/lib/store"
import Loading from "./loading"

export default function AdminUsersPage() {
  const searchParams = useSearchParams()
  const { users, addUser, updateUser, deleteUser, updateUserRole, toggleUserActive } = useUserStore()
  const { user: currentUser, hasPermission } = useAuthStore()
  const { associates } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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

  // Check if current user can manage users
  if (!hasPermission("userManagement")) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access user management.</p>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Linked Associate</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const linkedAssociate = associates.find(a => a.id === user.associateId)
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
                            {linkedAssociate ? (
                              <span className="text-sm">{linkedAssociate.name}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
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
                                <DropdownMenuItem>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Change Role
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
                <CardDescription>View and understand permissions for each role</CardDescription>
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
                      {[
                        { key: "dashboard", label: "Dashboard" },
                        { key: "projects", label: "Projects" },
                        { key: "projectBoard", label: "Project Board" },
                        { key: "clients", label: "Clients" },
                        { key: "associates", label: "Associates" },
                        { key: "documents", label: "Documents" },
                        { key: "milestones", label: "Milestones" },
                        { key: "revenue", label: "Revenue" },
                        { key: "performance", label: "Performance" },
                        { key: "settings", label: "Settings" },
                        { key: "calculator", label: "Calculator" },
                        { key: "userManagement", label: "User Management" },
                        { key: "createProject", label: "Create Projects" },
                        { key: "editProject", label: "Edit Projects" },
                        { key: "deleteProject", label: "Delete Projects" },
                        { key: "manageTeam", label: "Manage Team" },
                        { key: "manageUsers", label: "Manage Users" },
                        { key: "managePermissions", label: "Manage Permissions" },
                      ].map((perm) => (
                        <TableRow key={perm.key}>
                          <TableCell className="font-medium">{perm.label}</TableCell>
                          {(["elt", "association-manager", "engagement-lead", "associate"] as UserRole[]).map(role => (
                            <TableCell key={role} className="text-center">
                              {ROLE_PERMISSIONS[role][perm.key as keyof typeof ROLE_PERMISSIONS.elt] ? (
                                <Badge variant="default" className="bg-emerald-500">Yes</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-muted-foreground">No</Badge>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
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
