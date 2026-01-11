"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import { Users } from "lucide-react"

export function AssociateWorkload() {
  const { associates } = useAppStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Associate Workload
        </CardTitle>
        <CardDescription>Open tasks and average cycle time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {associates.map((associate) => (
            <Link
              key={associate.id}
              href={`/associates/${associate.id}`}
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={associate.avatar || "/placeholder.svg"} alt={associate.name} />
                  <AvatarFallback>
                    {associate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{associate.name}</p>
                  <p className="text-xs text-muted-foreground">{associate.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="font-medium">{associate.openTasks}</p>
                  <p className="text-xs text-muted-foreground">Open Tasks</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{associate.avgCycleTime}d</p>
                  <p className="text-xs text-muted-foreground">Avg Cycle</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
