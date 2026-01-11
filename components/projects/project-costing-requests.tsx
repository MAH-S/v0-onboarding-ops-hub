"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { DollarSign, Clock } from "lucide-react"

interface ProjectCostingRequestsProps {
  projectId: string
}

export function ProjectCostingRequests({ projectId }: ProjectCostingRequestsProps) {
  const { costingRequests, associates } = useAppStore()

  const projectRequests = costingRequests.filter((cr) => cr.projectId === projectId)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Returned":
        return "destructive"
      case "Submitted":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Costing Requests
        </CardTitle>
        <CardDescription>Track costing requests raised by associates</CardDescription>
      </CardHeader>
      <CardContent>
        {projectRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manager Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRequests.map((request) => {
                const requester = associates.find((a) => a.id === request.requestedById)
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">By {requester?.name || "Unknown"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {request.items}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${request.requestedAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className={request.agingDays > 5 ? "text-destructive" : ""}>{request.agingDays}d</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {request.managerNotes || "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No costing requests for this project</div>
        )}
      </CardContent>
    </Card>
  )
}
