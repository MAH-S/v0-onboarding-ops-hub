"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Associate } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import { Mail, Phone, MapPin, Building2, Calendar, User, Globe, Award, FileText } from "lucide-react"
import { format } from "date-fns"

interface AssociateProfileInfoProps {
  associate: Associate
}

export function AssociateProfileInfo({ associate }: AssociateProfileInfoProps) {
  const { associates } = useAppStore()
  const manager = associate.managerId ? associates.find((a) => a.id === associate.managerId) : null

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "partially-available":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "unavailable":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available"
      case "partially-available":
        return "Partially Available"
      case "unavailable":
        return "Unavailable"
      default:
        return availability
    }
  }

  return (
    <div className="space-y-6">
      {/* Bio & Contact */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {associate.bio && <p className="text-sm text-muted-foreground leading-relaxed">{associate.bio}</p>}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getAvailabilityColor(associate.availability)}>
                {getAvailabilityLabel(associate.availability)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Capacity: {associate.activeProjects}/{associate.maxCapacity} projects
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{associate.email}</span>
            </div>
            {associate.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{associate.phone}</span>
              </div>
            )}
            {associate.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{associate.location}</span>
              </div>
            )}
            {associate.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{associate.department}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employment Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="secondary">{associate.role}</Badge>
            </div>
            {associate.startDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="text-sm">{format(new Date(associate.startDate), "MMM d, yyyy")}</span>
              </div>
            )}
            {associate.startDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tenure</span>
                <span className="text-sm">
                  {Math.floor(
                    (new Date().getTime() - new Date(associate.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365),
                  )}{" "}
                  years,{" "}
                  {Math.floor(
                    ((new Date().getTime() - new Date(associate.startDate).getTime()) % (1000 * 60 * 60 * 24 * 365)) /
                      (1000 * 60 * 60 * 24 * 30),
                  )}{" "}
                  months
                </span>
              </div>
            )}
            {manager && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reports To</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={manager.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {manager.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{manager.name}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {associate.languages && associate.languages.length > 0 ? (
              <div className="space-y-2">
                {associate.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{lang.language}</span>
                    <Badge
                      variant="outline"
                      className={
                        lang.proficiency === "native"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : lang.proficiency === "fluent"
                            ? "bg-blue-500/10 text-blue-500"
                            : lang.proficiency === "conversational"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-muted text-muted-foreground"
                      }
                    >
                      {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No languages recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </CardTitle>
          <CardDescription>Professional certifications and credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {associate.certifications && associate.certifications.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {associate.certifications.map((cert, index) => {
                const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date()
                const isExpiringSoon =
                  cert.expiryDate &&
                  new Date(cert.expiryDate) > new Date() &&
                  new Date(cert.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isExpired
                        ? "border-red-500/30 bg-red-500/5"
                        : isExpiringSoon
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      </div>
                      {isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>Issued: {format(new Date(cert.date), "MMM yyyy")}</span>
                      {cert.expiryDate && (
                        <span className="ml-2">Expires: {format(new Date(cert.expiryDate), "MMM yyyy")}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No certifications recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {associate.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{associate.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
