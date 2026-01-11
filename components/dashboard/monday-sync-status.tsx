"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { RefreshCw } from "lucide-react"

export function MondaySyncStatus() {
  const { mondayConnected, lastSyncTime } = useAppStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          monday.com Sync
        </CardTitle>
        <CardDescription>Integration status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={mondayConnected ? "default" : "secondary"}>
              {mondayConnected ? "Connected" : "Prototype Mode"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm">{lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
