import { Suspense } from "react"
import { DocumentsPageContent } from "@/components/documents/documents-page-content"

export default function DocumentsPage() {
  return (
    <Suspense fallback={null}>
      <DocumentsPageContent />
    </Suspense>
  )
}
