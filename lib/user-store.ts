import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser, UserRole } from "./auth-store"

interface UserManagementState {
  users: AuthUser[]
  addUser: (user: Omit<AuthUser, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<AuthUser>) => void
  deleteUser: (id: string) => void
  updateUserRole: (id: string, role: UserRole) => void
  toggleUserActive: (id: string) => void
  getUserById: (id: string) => AuthUser | undefined
  updateUserPermission: (id: string, permissionKey: string, value: boolean) => void
  resetUserPermissions: (id: string) => void
}

// Initial users with more metadata
const initialUsers: AuthUser[] = [
  {
    id: "user-elt-1",
    name: "Alexandra Mitchell",
    email: "alexandra@opshub.com",
    role: "elt",
    avatar: "/professional-woman-executive.png",
    isActive: true,
    createdAt: "2024-01-15T09:00:00Z",
    lastLogin: "2025-01-20T14:30:00Z",
  },
  {
    id: "user-am-1",
    name: "James Wilson",
    email: "james@opshub.com",
    role: "association-manager",
    avatar: "/professional-man-manager.jpg",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
    lastLogin: "2025-01-19T09:15:00Z",
  },
  {
    id: "user-el-1",
    name: "Sarah Chen",
    email: "sarah@opshub.com",
    role: "engagement-lead",
    avatar: "/professional-asian-woman.png",
    associateId: "a1",
    isActive: true,
    createdAt: "2024-03-10T08:00:00Z",
    lastLogin: "2025-01-20T11:00:00Z",
  },
  {
    id: "user-el-2",
    name: "David Kim",
    email: "david@opshub.com",
    role: "engagement-lead",
    avatar: "/professional-asian-man.png",
    associateId: "a4",
    isActive: true,
    createdAt: "2024-03-15T09:30:00Z",
    lastLogin: "2025-01-18T16:45:00Z",
  },
  {
    id: "user-assoc-1",
    name: "Emily Rodriguez",
    email: "emily@opshub.com",
    role: "associate",
    avatar: "/latina-professional-woman.png",
    associateId: "a2",
    isActive: true,
    createdAt: "2024-04-01T08:00:00Z",
    lastLogin: "2025-01-20T08:30:00Z",
  },
  {
    id: "user-assoc-2",
    name: "Marcus Johnson",
    email: "marcus@opshub.com",
    role: "associate",
    avatar: "/professional-african-american-man.png",
    associateId: "a3",
    isActive: true,
    createdAt: "2024-04-15T10:00:00Z",
    lastLogin: "2025-01-17T14:00:00Z",
  },
  {
    id: "user-assoc-3",
    name: "Lisa Park",
    email: "lisa@opshub.com",
    role: "associate",
    associateId: "a5",
    isActive: true,
    createdAt: "2024-05-01T09:00:00Z",
    lastLogin: "2025-01-15T10:30:00Z",
  },
  {
    id: "user-assoc-4",
    name: "Michael Brown",
    email: "michael@opshub.com",
    role: "associate",
    associateId: "a6",
    isActive: false,
    createdAt: "2024-05-20T11:00:00Z",
    lastLogin: "2024-12-01T09:00:00Z",
  },
]

export const useUserStore = create<UserManagementState>()(
  persist(
    (set, get) => ({
      users: initialUsers,

      addUser: (userData) => {
        const newUser: AuthUser = {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isActive: true,
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      updateUserRole: (id, role) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, role } : user
          ),
        }))
      },

      toggleUserActive: (id) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, isActive: !user.isActive } : user
          ),
        }))
      },

      getUserById: (id) => {
        return get().users.find((user) => user.id === id)
      },

      updateUserPermission: (id, permissionKey, value) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? {
                  ...user,
                  customPermissions: {
                    ...user.customPermissions,
                    [permissionKey]: value,
                  },
                }
              : user
          ),
        }))
      },

      resetUserPermissions: (id) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? { ...user, customPermissions: undefined }
              : user
          ),
        }))
      },
    }),
    {
      name: "user-management-storage",
    }
  )
)
