"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/lib/store"
import { Users, UserCheck, UserX, Palmtree, Clock } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export default function AssociatesPage() {
  const { associates } = useAppStore()

  const stats = useMemo(() => {
    const today = new Date()

    let available = 0
    let busy = 0
    let onVacation = 0
    let partiallyAvailable = 0

    associates.forEach((associate) => {
      // Check if on vacation today
      const isOnVacation = associate.timeOff?.some((timeOff) => {
        const start = new Date(timeOff.startDate)
        const end = new Date(timeOff.endDate)
        return today >= start && today <= end && timeOff.approved
      })

      if (isOnVacation) {
        onVacation++
      } else if (associate.availability === "available") {
        available++
      } else if (associate.availability === "partially-available") {
        partiallyAvailable++
      } else {
        busy++
      }
    })

    return {
      total: associates.length,
      available,
      busy,
      onVacation,
      partiallyAvailable,
    }
  }, [associates])

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-amber-600"
    return "text-red-600"
  }

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 75) return "Good"
    return "Needs Improvement"
  }

  const getAvailabilityBadge = (associate: (typeof associates)[0]) => {
    const today = new Date()
    const isOnVacation = associate.timeOff?.some((timeOff) => {
      const start = new Date(timeOff.startDate)
      const end = new Date(timeOff.endDate)
      return today >= start && today <= end && timeOff.approved
    })

    if (isOnVacation) {
      return <Badge className="bg-purple-600 text-white">On Vacation</Badge>
    }
    if (associate.availability === "available") {
      return <Badge className="bg-green-600 text-white">Available</Badge>
    }
    if (associate.availability === "partially-available") {
      return <Badge className="bg-amber-600 text-white">Partial</Badge>
    }
    return <Badge className="bg-red-600 text-white">Busy</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Associates</h1>
        <p className="text-muted-foreground">Manage team members and track performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Associates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready for new projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Available</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.partiallyAvailable}</div>
            <p className="text-xs text-muted-foreground">Limited capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.busy}</div>
            <p className="text-xs text-muted-foreground">At full capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Vacation</CardTitle>
            <Palmtree className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.onVacation}</div>
            <p className="text-xs text-muted-foreground">Currently away</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Associates
          </CardTitle>
          <CardDescription>{associates.length} team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Active Projects</TableHead>
                <TableHead className="text-right">Open Tasks</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead className="text-right">Avg Cycle</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associates.map((associate) => (
                <TableRow key={associate.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/associates/${associate.id}`} className="flex items-center gap-3">
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
                        <p className="font-medium hover:underline">{associate.name}</p>
                        <p className="text-xs text-muted-foreground">{associate.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{associate.role}</Badge>
                  </TableCell>
                  <TableCell>{getAvailabilityBadge(associate)}</TableCell>
                  <TableCell className="text-right">{associate.activeProjects}</TableCell>
                  <TableCell className="text-right">{associate.openTasks}</TableCell>
                  <TableCell className="text-right">
                    {associate.milestonesOverdue > 0 ? (
                      <span className="text-destructive">{associate.milestonesOverdue}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{associate.avgCycleTime}d</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={associate.performanceScore} className="h-2 w-16" />
                      <span className={`text-sm font-medium ${getPerformanceColor(associate.performanceScore)}`}>
                        {associate.performanceScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({getPerformanceLabel(associate.performanceScore)})
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
