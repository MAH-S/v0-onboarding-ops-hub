import { Suspense } from 'react'
import { ProjectCalculatorDetail } from '@/components/calculator/project-calculator-detail'

export default async function CalculatorDetailPage({ 
  params 
}: { 
  params: Promise<{ projectId: string }> 
}) {
  const { projectId } = await params
  
  return (
    <Suspense fallback={<DetailLoading />}>
      <ProjectCalculatorDetail projectId={projectId} />
    </Suspense>
  )
}

function DetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-12 w-full bg-muted animate-pulse rounded" />
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}
