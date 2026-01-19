"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Pause,
  Play,
  RefreshCw,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Client } from "@/lib/mock-data"

interface ClientRetainerTabProps {
  client: Client
}

export function ClientRetainerTab({ client }: ClientRetainerTabProps) {
  const { associates } = useAppStore()

  if (!client.retainer) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Retainer Setup</h3>
          <p className="text-muted-foreground">This client does not have an active retainer agreement.</p>
        </CardContent>
      </Card>
    )
  }

  const { retainer } = client
  const advisor = associates.find((a) => a.id === retainer.advisorId)
  const hoursUsedPercent = (retainer.hoursUsed / retainer.hoursIncluded) * 100
  const hoursRemaining = Math.max(0, retainer.hoursIncluded - retainer.hoursUsed)
  const isOverHours = retainer.hoursUsed > retainer.hoursIncluded

  const startDate = new Date(retainer.startDate)
  const endDate = retainer.endDate ? new Date(retainer.endDate) : null
  const today = new Date()

  const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = endDate
    ? Math.max(0, Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const getStatusBadge = () => {
    switch (retainer.status) {
      case "active":
        return <Badge className="bg-emerald-600 text-white">Active</Badge>
      case "paused":
        return <Badge className="bg-amber-600 text-white">Paused</Badge>
      case "expired":
        return <Badge className="bg-gray-500 text-white">Expired</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card
        className={cn(
          "border-l-4",
          retainer.status === "active" && "border-l-emerald-500",
          retainer.status === "paused" && "border-l-amber-500",
          retainer.status === "expired" && "border-l-gray-500",
        )}
      >
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {retainer.status === "active" ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : retainer.status === "paused" ? (
              <Pause className="h-8 w-8 text-amber-500" />
            ) : (
              <Clock className="h-8 w-8 text-gray-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Retainer Status</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {retainer.status === "active" && `Active for ${daysActive} days`}
                {retainer.status === "paused" && "Retainer is currently paused"}
                {retainer.status === "expired" && "Retainer has expired"}
                {daysRemaining !== null && retainer.status === "active" && ` • ${daysRemaining} days remaining`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {retainer.status === "active" && (
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {retainer.status === "paused" && (
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {retainer.status === "expired" && (
              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Fee</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(retainer.monthlyFee)}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", isOverHours && "text-red-500")}>
              {retainer.hoursUsed} / {retainer.hoursIncluded}
            </div>
            <Progress
              value={Math.min(hoursUsedPercent, 100)}
              className={cn("h-2 mt-2", isOverHours && "[&>div]:bg-red-500")}
            />
            {isOverHours && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {retainer.hoursUsed - retainer.hoursIncluded} hours over limit
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Remaining</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", hoursRemaining === 0 ? "text-amber-500" : "text-emerald-600")}>
              {hoursRemaining}
            </div>
            <p className="text-xs text-muted-foreground">Hours available this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(client.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Since engagement start</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Retainer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Retainer Details</CardTitle>
            <CardDescription>Agreement terms and timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Start Date</span>
                </div>
                <span className="font-medium">{formatDate(retainer.startDate)}</span>
              </div>
              {retainer.endDate && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>End Date</span>
                  </div>
                  <span className="font-medium">{formatDate(retainer.endDate)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Monthly Fee</span>
                </div>
                <span className="font-medium">{formatCurrency(retainer.monthlyFee)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Hours Included</span>
                </div>
                <span className="font-medium">{retainer.hoursIncluded} hours/month</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Effective Rate</span>
                </div>
                <span className="font-medium">{formatCurrency(retainer.monthlyFee / retainer.hoursIncluded)}/hour</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Advisor */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Advisor</CardTitle>
            <CardDescription>Primary point of contact</CardDescription>
          </CardHeader>
          <CardContent>
            {advisor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {advisor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{advisor.name}</h3>
                    <p className="text-muted-foreground">{advisor.role}</p>
                    <Badge variant="outline" className="mt-1">
                      {advisor.availability === "available"
                        ? "Available"
                        : advisor.availability === "partially-available"
                          ? "Partial"
                          : "Busy"}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span> {advisor.email}
                  </p>
                  {advisor.phone && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Phone:</span> {advisor.phone}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No advisor assigned</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  Assign Advisor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Included</CardTitle>
          <CardDescription>Scope of advisory engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {retainer.services.map((service) => (
              <Badge key={service} variant="secondary" className="text-sm py-1 px-3">
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
