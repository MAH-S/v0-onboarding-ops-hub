"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Flag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Kanban,
  FileText,
  DollarSign,
  Briefcase,
  Calculator,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthStore } from "@/lib/auth-store"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permissionKey:
    | "dashboard"
    | "projects"
    | "projectBoard"
    | "clients"
    | "associates"
    | "documents"
    | "milestones"
    | "revenue"
    | "performance"
    | "settings"
    | "advisory"
    | "calculator"
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permissionKey: "dashboard" },
  { href: "/projects", label: "Projects", icon: FolderKanban, permissionKey: "projects" },
  { href: "/project-board", label: "Project Board", icon: Kanban, permissionKey: "projectBoard" },
  { href: "/clients", label: "Clients", icon: Building2, permissionKey: "clients" },
  { href: "/advisory", label: "Advisory", icon: Briefcase, permissionKey: "advisory" },
  { href: "/associates", label: "Associates", icon: Users, permissionKey: "associates" },
  { href: "/documents", label: "Documents Hub", icon: FileText, permissionKey: "documents" },
  { href: "/milestones", label: "Milestones", icon: Flag, permissionKey: "milestones" },
  { href: "/revenue", label: "Revenue Tracker", icon: DollarSign, permissionKey: "revenue" },
  { href: "/calculator", label: "Calculator", icon: Calculator, permissionKey: "calculator" },
  { href: "/performance", label: "Performance", icon: BarChart3, permissionKey: "performance" },
  { href: "/settings", label: "Settings", icon: Settings, permissionKey: "settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, hasPermission } = useAuthStore()

  const filteredNavItems = navItems.filter((item) => hasPermission(item.permissionKey))

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-2",
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      )
    }

    return <div key={item.href}>{linkContent}</div>
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">OH</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Ops Hub</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "mx-auto")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-2">{filteredNavItems.map(renderNavItem)}</nav>
      </aside>
    </TooltipProvider>
  )
}
