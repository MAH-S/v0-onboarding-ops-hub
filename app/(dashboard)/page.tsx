import { KPICards } from "@/components/dashboard/kpi-cards"
import { ProjectsAtRisk } from "@/components/dashboard/projects-at-risk"
import { AssociateWorkload } from "@/components/dashboard/associate-workload"
import { MondaySyncStatus } from "@/components/dashboard/monday-sync-status"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your onboarding operations</p>
      </div>

      <KPICards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectsAtRisk />
        </div>
        <div className="space-y-6">
          <MondaySyncStatus />
          <QuickActions />
        </div>
      </div>

      <AssociateWorkload />
    </div>
  )
}
