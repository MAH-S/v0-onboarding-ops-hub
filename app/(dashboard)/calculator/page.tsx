import { Suspense } from 'react'
import { CalculatorPageContent } from '@/components/calculator/calculator-page-content'

export default function CalculatorPage() {
  return (
    <Suspense fallback={<CalculatorLoading />}>
      <CalculatorPageContent />
    </Suspense>
  )
}

function CalculatorLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}
