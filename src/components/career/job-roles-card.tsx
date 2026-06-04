'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, TrendingUp, Minus, TrendingDown, Target } from 'lucide-react'
import type { JobRoleRecommendation } from '@/types/analysis'

interface JobRolesCardProps {
  roles: JobRoleRecommendation[]
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getScoreBarBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-red-100 dark:bg-red-900/30'
}

function getGrowthIcon(growth: 'High' | 'Medium' | 'Low') {
  switch (growth) {
    case 'High':
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    case 'Medium':
      return <Minus className="h-4 w-4 text-amber-500" />
    case 'Low':
      return <TrendingDown className="h-4 w-4 text-red-500" />
  }
}

function getGrowthColor(growth: 'High' | 'Medium' | 'Low'): string {
  switch (growth) {
    case 'High':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'Medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'Low':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }
}

export function JobRolesCard({ roles }: JobRolesCardProps) {
  const [sortAsc, setSortAsc] = useState(false)
  const sorted = [...roles].sort((a, b) =>
    sortAsc ? a.matchScore - b.matchScore : b.matchScore - a.matchScore
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600" />
              Recommended Job Roles
            </CardTitle>
            <CardDescription className="mt-1">
              {roles.length} roles matched based on your profile
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortAsc(!sortAsc)}
            className="gap-1.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortAsc ? 'Low→High' : 'High→Low'}
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="max-h-[600px]">
        <CardContent className="space-y-4">
          {sorted.map((role, idx) => (
            <Card key={idx} className="border shadow-none">
              <CardContent className="p-4 space-y-3">
                {/* Header: Role name + Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground">{role.role}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {role.reason}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(role.matchScore)}`}>
                      {role.matchScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Match
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className={`h-2 w-full rounded-full ${getScoreBarBg(role.matchScore)}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBg(role.matchScore)}`}
                    style={{ width: `${role.matchScore}%` }}
                  />
                </div>

                {/* Growth potential */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Growth:</span>
                  <Badge
                    variant="secondary"
                    className={`gap-1 ${getGrowthColor(role.growthPotential)}`}
                  >
                    {getGrowthIcon(role.growthPotential)}
                    {role.growthPotential}
                  </Badge>
                </div>

                {/* Matched Skills */}
                {role.matchedSkills.length > 0 && (
                  <div>
                    <span className="mb-1 block text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.matchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills (missing) */}
                {role.requiredSkills.length > 0 && (
                  <div>
                    <span className="mb-1 block text-xs font-medium text-amber-600 dark:text-amber-400">
                      ⚠ Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
