"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Associate } from "@/lib/mock-data"
import { Zap, Star, TrendingUp } from "lucide-react"

interface AssociateSkillsProps {
  associate: Associate
}

export function AssociateSkills({ associate }: AssociateSkillsProps) {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-emerald-500"
      case "advanced":
        return "bg-blue-500"
      case "intermediate":
        return "bg-amber-500"
      case "beginner":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getSkillLevelPercent = (level: string) => {
    switch (level) {
      case "expert":
        return 100
      case "advanced":
        return 75
      case "intermediate":
        return 50
      case "beginner":
        return 25
      default:
        return 0
    }
  }

  const getSkillLevelBadge = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "advanced":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "intermediate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "beginner":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return ""
    }
  }

  // Group skills by level
  const expertSkills = associate.skills?.filter((s) => s.level === "expert") || []
  const advancedSkills = associate.skills?.filter((s) => s.level === "advanced") || []
  const intermediateSkills = associate.skills?.filter((s) => s.level === "intermediate") || []
  const beginnerSkills = associate.skills?.filter((s) => s.level === "beginner") || []

  return (
    <div className="space-y-6">
      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Core Strengths
          </CardTitle>
          <CardDescription>Key areas where this associate excels</CardDescription>
        </CardHeader>
        <CardContent>
          {associate.strengths && associate.strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {associate.strengths.map((strength, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1"
                >
                  <Star className="h-3 w-3 mr-1.5 fill-amber-500 text-amber-500" />
                  {strength}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No strengths recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Skills Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Skills Matrix
          </CardTitle>
          <CardDescription>Technical and professional competencies with experience levels</CardDescription>
        </CardHeader>
        <CardContent>
          {associate.skills && associate.skills.length > 0 ? (
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex flex-wrap gap-3 pb-4 border-b">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Expert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Advanced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Intermediate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-xs text-muted-foreground">Beginner</span>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                {associate.skills
                  .sort((a, b) => {
                    const order = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 }
                    return order[a.level] - order[b.level]
                  })
                  .map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <Badge variant="outline" className={getSkillLevelBadge(skill.level)}>
                            {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {skill.yearsExp} {skill.yearsExp === 1 ? "year" : "years"} exp
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${getSkillLevelColor(skill.level)}`}
                          style={{ width: `${getSkillLevelPercent(skill.level)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Skills Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-500">{expertSkills.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Expert Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{advancedSkills.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Advanced Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{intermediateSkills.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Intermediate Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">{beginnerSkills.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Beginner Skills</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Areas */}
      {beginnerSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Development Areas
            </CardTitle>
            <CardDescription>Skills with room for growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[...beginnerSkills, ...intermediateSkills].map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
