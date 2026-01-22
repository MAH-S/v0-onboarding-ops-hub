import { create } from "zustand"
import { persist } from "zustand/middleware"

// Role definitions with access levels
export type UserRole = "elt" | "association-manager" | "engagement-lead" | "associate"

export interface RolePermissions {
  // Navigation access
  dashboard: boolean
  projects: boolean
  projectBoard: boolean
  clients: boolean
  associates: boolean
  documents: boolean
  milestones: boolean
  performance: boolean
  settings: boolean
  revenue: boolean
  advisory: boolean
  calculator: boolean
  userManagement: boolean // Admin page for user management
  newBusiness: boolean // New Business Acquisition pipeline
  brokerOnboarding: boolean // Broker Onboarding page

  // Feature access
  createProject: boolean
  editProject: boolean
  deleteProject: boolean
  createClient: boolean
  editClient: boolean
  createAssociate: boolean
  editAssociate: boolean
  manageTeam: boolean
  viewAllProjects: boolean
  viewOwnProjectsOnly: boolean // For engagement leads
  viewAssignedTasksOnly: boolean // For associates
  manageUsers: boolean // Can add/edit/delete users
  managePermissions: boolean // Can change user roles
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // ELT - Full access to everything
  elt: {
    dashboard: true,
    projects: true,
    projectBoard: true,
    clients: true,
    associates: true,
    documents: true,
    milestones: true,
    performance: true,
    settings: true,
    revenue: true,
    advisory: true,
    calculator: true,
    userManagement: true,
    newBusiness: true,
    brokerOnboarding: true,
    createProject: true,
    editProject: true,
    deleteProject: true,
    createClient: true,
    editClient: true,
    createAssociate: true,
    editAssociate: true,
    manageTeam: true,
    viewAllProjects: true,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: false,
    manageUsers: true,
    managePermissions: true,
  },

  // Association Manager - Client access, associate profiles, team management
  "association-manager": {
    dashboard: true,
    projects: true,
    projectBoard: false,
    clients: true,
    associates: true,
    documents: true,
    milestones: true,
    performance: true,
    settings: false,
    revenue: true,
    advisory: true,
    calculator: true,
    userManagement: false,
    newBusiness: true,
    brokerOnboarding: true,
    createProject: true,
    editProject: true,
    deleteProject: false,
    createClient: true,
    editClient: true,
    createAssociate: true,
    editAssociate: true,
    manageTeam: true,
    viewAllProjects: true,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: false,
    manageUsers: false,
    managePermissions: false,
  },

  // Engagement Lead - Only manage projects they lead
  "engagement-lead": {
    dashboard: true,
    projects: true,
    projectBoard: false,
    clients: false,
    associates: false,
    documents: true,
    milestones: true,
    performance: false,
    settings: false,
    revenue: false,
    advisory: false,
    calculator: false,
    userManagement: false,
    newBusiness: false,
    brokerOnboarding: false,
    createProject: false,
    editProject: true,
    deleteProject: false,
    createClient: false,
    editClient: false,
    createAssociate: false,
    editAssociate: false,
    manageTeam: true,
    viewAllProjects: false,
    viewOwnProjectsOnly: true,
    viewAssignedTasksOnly: false,
    manageUsers: false,
    managePermissions: false,
  },

  // Associate - View assigned projects, task page only
  associate: {
    dashboard: false,
    projects: true,
    projectBoard: false,
    clients: false,
    associates: false,
    documents: false,
    milestones: false,
    performance: false,
    settings: false,
    revenue: false,
    advisory: false,
    calculator: false,
    userManagement: false,
    newBusiness: false,
    brokerOnboarding: false,
    createProject: false,
    editProject: false,
    deleteProject: false,
    createClient: false,
    editClient: false,
    createAssociate: false,
    editAssociate: false,
    manageTeam: false,
    viewAllProjects: false,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: true,
    manageUsers: false,
    managePermissions: false,
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  elt: "Executive Leadership Team",
  "association-manager": "Association Manager",
  "engagement-lead": "Engagement Lead",
  associate: "Associate",
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  elt: "Full access to all features and settings",
  "association-manager": "Client access, associate profiles, team creation & assignment",
  "engagement-lead": "Manage projects you lead - full control within your projects",
  associate: "View assigned projects and tasks",
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  associateId?: string // Link to Associate record if applicable
  isActive?: boolean
  createdAt?: string
  lastLogin?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
  hasPermission: (permission: keyof RolePermissions) => boolean
  canAccessProject: (projectOwnerId: string, assignedAssociates: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => {
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return ROLE_PERMISSIONS[user.role][permission]
      },

      canAccessProject: (projectOwnerId, assignedAssociates) => {
        const { user } = get()
        if (!user) return false

        const permissions = ROLE_PERMISSIONS[user.role]

        // Full access roles
        if (permissions.viewAllProjects) return true

        // Engagement leads - can access projects they own
        if (permissions.viewOwnProjectsOnly) {
          return user.associateId === projectOwnerId
        }

        // Associates - can access projects they're assigned to
        if (permissions.viewAssignedTasksOnly) {
          return user.associateId ? assignedAssociates.includes(user.associateId) : false
        }

        return false
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Demo users for login page
export const DEMO_USERS: AuthUser[] = [
  {
    id: "user-elt-1",
    name: "Alexandra Mitchell",
    email: "alexandra@opshub.com",
    role: "elt",
    avatar: "/professional-woman-executive.png",
  },
  {
    id: "user-am-1",
    name: "James Wilson",
    email: "james@opshub.com",
    role: "association-manager",
    avatar: "/professional-man-manager.jpg",
  },
  {
    id: "user-el-1",
    name: "Sarah Chen",
    email: "sarah@opshub.com",
    role: "engagement-lead",
    avatar: "/professional-asian-woman.png",
    associateId: "a1", // Links to Sarah Chen in associates
  },
  {
    id: "user-el-2",
    name: "David Kim",
    email: "david@opshub.com",
    role: "engagement-lead",
    avatar: "/professional-asian-man.png",
    associateId: "a4", // Links to David Kim in associates
  },
  {
    id: "user-assoc-1",
    name: "Emily Rodriguez",
    email: "emily@opshub.com",
    role: "associate",
    avatar: "/latina-professional-woman.png",
    associateId: "a2", // Links to Emily Rodriguez in associates
  },
  {
    id: "user-assoc-2",
    name: "Marcus Johnson",
    email: "marcus@opshub.com",
    role: "associate",
    avatar: "/professional-african-american-man.png",
    associateId: "a3", // Links to Marcus Johnson in associates
  },
]
