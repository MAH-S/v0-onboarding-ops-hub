import { Suspense } from "react"
import { AdvisoryPageContent } from "@/components/advisory/advisory-page-content"

export default function AdvisoryPage() {
  return (
    <Suspense fallback={null}>
      <AdvisoryPageContent />
    </Suspense>
  )
}
