import { Suspense } from "react"
import { ProjectRevenueDetail } from "@/components/revenue/project-revenue-detail"

interface PageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectRevenuePage({ params }: PageProps) {
  const { projectId } = await params

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ProjectRevenueDetail projectId={projectId} />
    </Suspense>
  )
}
