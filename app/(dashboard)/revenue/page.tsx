import { Suspense } from "react"
import { RevenuePageContent } from "@/components/revenue/revenue-page-content"

export default function RevenuePage() {
  return (
    <Suspense fallback={null}>
      <RevenuePageContent />
    </Suspense>
  )
}
