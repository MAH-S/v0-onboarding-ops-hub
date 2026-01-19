"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore, type ROLE_PERMISSIONS } from "@/lib/auth-store"

// Map routes to permission keys
const ROUTE_PERMISSIONS: Record<string, keyof typeof ROLE_PERMISSIONS.elt> = {
  "/": "dashboard",
  "/projects": "projects",
  "/project-board": "projectBoard",
  "/clients": "clients",
  "/associates": "associates",
  "/documents": "documents",
  "/milestones": "milestones",
  "/performance": "performance",
  "/settings": "settings",
  "/advisory": "advisory",
  "/revenue": "revenue",
  "/calculator": "calculator",
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, hasPermission } = useAuthStore()

  useEffect(() => {
    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Check route permission
    const baseRoute = "/" + (pathname.split("/")[1] || "")
    const permissionKey = ROUTE_PERMISSIONS[baseRoute]

    if (permissionKey && !hasPermission(permissionKey)) {
      // User doesn't have permission for this route
      // Redirect to first available route
      if (hasPermission("dashboard")) {
        router.push("/")
      } else if (hasPermission("projects")) {
        router.push("/projects")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, pathname, hasPermission, router])

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
