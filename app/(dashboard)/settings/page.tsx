"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { Settings, RefreshCw, Link2, Database, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { mondayConnected, lastSyncTime, toggleMondayConnection, syncWithMonday } = useAppStore()
  const [syncing, setSyncing] = useState(false)
  const [projectsBoard, setProjectsBoard] = useState("")
  const [uploadsBoard, setUploadsBoard] = useState("")
  const [milestonesBoard, setMilestonesBoard] = useState("")

  const handleSync = async () => {
    setSyncing(true)
    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    syncWithMonday()
    setSyncing(false)
    toast.success("Successfully synced with monday.com")
  }

  const mockBoards = [
    { id: "board1", name: "Projects Board" },
    { id: "board2", name: "Client Onboarding" },
    { id: "board3", name: "Document Tracker" },
    { id: "board4", name: "Team Tasks" },
    { id: "board5", name: "Milestones & Deadlines" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure monday.com integration and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              monday.com Connection
            </CardTitle>
            <CardDescription>Connect your monday.com workspace for real-time sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {mondayConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Connection Status</p>
                  <p className="text-sm text-muted-foreground">
                    {mondayConnected ? "Connected to monday.com" : "Running in Prototype Mode"}
                  </p>
                </div>
              </div>
              <Switch checked={mondayConnected} onCheckedChange={toggleMondayConnection} />
            </div>

            {mondayConnected && (
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Last Sync</p>
                    <p className="text-sm text-muted-foreground">
                      {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never synced"}
                    </p>
                  </div>
                  <Button onClick={handleSync} disabled={syncing}>
                    {syncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!mondayConnected && (
              <div className="rounded-lg bg-muted p-4 text-center">
                <Badge variant="secondary" className="mb-2">
                  Prototype Mode
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Enable the connection above to configure board mappings and sync data with monday.com
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Board Mappings
            </CardTitle>
            <CardDescription>Map your monday.com boards to Ops Hub modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Projects Board</Label>
              <Select value={projectsBoard} onValueChange={setProjectsBoard} disabled={!mondayConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a board..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Uploads Board</Label>
              <Select value={uploadsBoard} onValueChange={setUploadsBoard} disabled={!mondayConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a board..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Milestones Board</Label>
              <Select value={milestonesBoard} onValueChange={setMilestonesBoard} disabled={!mondayConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a board..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              disabled={!mondayConnected || !projectsBoard || !uploadsBoard || !milestonesBoard}
              onClick={() => toast.success("Board mappings saved (Prototype)")}
            >
              Save Mappings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Application Preferences
          </CardTitle>
          <CardDescription>Configure app behavior and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts for overdue milestones</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Auto-refresh Dashboard</p>
                <p className="text-sm text-muted-foreground">Automatically refresh data every 5 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Show Completed Projects</p>
                <p className="text-sm text-muted-foreground">Display closed projects in the projects list</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Compact View</p>
                <p className="text-sm text-muted-foreground">Use condensed tables and cards</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
