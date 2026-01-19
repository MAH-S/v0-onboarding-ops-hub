"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { FileText } from "lucide-react"
import Link from "next/link"

interface AssociateUploadsProps {
  associateId: string
}

export function AssociateUploads({ associateId }: AssociateUploadsProps) {
  const { uploads, projects, associates } = useAppStore()

  const associateUploads = uploads.filter((u) => u.uploadedById === associateId)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Uploaded Documents
        </CardTitle>
        <CardDescription>{associateUploads.length} documents uploaded</CardDescription>
      </CardHeader>
      <CardContent>
        {associateUploads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Associate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associateUploads.map((upload) => {
                const project = projects.find((p) => p.id === upload.projectId)
                const associate = associates.find((a) => a.id === upload.associateId)
                return (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">{upload.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {project ? (
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {associate ? (
                        <Link href={`/associates/${associate.id}`} className="flex items-center gap-2 hover:underline">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={associate.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {associate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{associate.name}</span>
                        </Link>
                      ) : (
                        upload.associate || "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {upload.currency} {upload.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{upload.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(upload.status)}>{upload.status}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No documents uploaded by this associate</div>
        )}
      </CardContent>
    </Card>
  )
}
