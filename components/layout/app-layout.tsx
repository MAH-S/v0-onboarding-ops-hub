"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { CopilotDrawer } from "@/components/copilot/copilot-drawer"
import { CopilotMinibar } from "@/components/copilot/copilot-minibar"
import { AuthGuard } from "@/components/auth/auth-guard"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64 transition-all duration-300 peer-data-[collapsed=true]:pl-16">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
        <CopilotDrawer />
        <CopilotMinibar />
      </div>
    </AuthGuard>
  )
}
