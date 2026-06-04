'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TrendingUp,
  Minus,
  TrendingDown,
  BarChart3,
  MapPin,
  Building2,
  Lightbulb,
} from 'lucide-react'
import type { MarketResearchResult } from '@/types/analysis'

interface MarketResearchCardProps {
  research: MarketResearchResult[]
}

function getDemandColor(level: 'Very High' | 'High' | 'Medium' | 'Low'): string {
  switch (level) {
    case 'Very High':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'High':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
    case 'Medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'Low':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }
}

function getDemandDot(level: 'Very High' | 'High' | 'Medium' | 'Low'): string {
  switch (level) {
    case 'Very High':
      return 'bg-emerald-500'
    case 'High':
      return 'bg-teal-500'
    case 'Medium':
      return 'bg-amber-500'
    case 'Low':
      return 'bg-red-500'
  }
}

function getTrendIcon(trend: 'Growing' | 'Stable' | 'Declining') {
  switch (trend) {
    case 'Growing':
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    case 'Stable':
      return <Minus className="h-4 w-4 text-amber-500" />
    case 'Declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />
  }
}

function getTrendLabel(trend: 'Growing' | 'Stable' | 'Declining'): string {
  switch (trend) {
    case 'Growing':
      return '↗ Growing'
    case 'Stable':
      return '→ Stable'
    case 'Declining':
      return '↘ Declining'
  }
}

function getTrendColor(trend: 'Growing' | 'Stable' | 'Declining'): string {
  switch (trend) {
    case 'Growing':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'Stable':
      return 'text-amber-600 dark:text-amber-400'
    case 'Declining':
      return 'text-red-600 dark:text-red-400'
  }
}

export function MarketResearchCard({ research }: MarketResearchCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Job Market Research
        </CardTitle>
        <CardDescription>
          Market insights for {research.length} recommended roles
        </CardDescription>
      </CardHeader>

      <ScrollArea className="max-h-[600px]">
        <CardContent className="space-y-4">
          {research.map((item, idx) => (
            <Card key={idx} className="border shadow-none">
              <CardContent className="p-4 space-y-3">
                {/* Role name + demand level */}
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-foreground">{item.role}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${getDemandDot(item.demandLevel)}`} />
                    <Badge variant="secondary" className={getDemandColor(item.demandLevel)}>
                      {item.demandLevel}
                    </Badge>
                  </div>
                </div>

                {/* Trend & Openings */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`flex items-center gap-1 font-medium ${getTrendColor(item.trend)}`}>
                    {getTrendIcon(item.trend)}
                    {getTrendLabel(item.trend)}
                  </span>
                  {item.averageOpenings && (
                    <span className="text-muted-foreground">
                      ~{item.averageOpenings} openings
                    </span>
                  )}
                </div>

                {/* Hiring Companies */}
                {item.hiringCompanies.length > 0 && (
                  <div>
                    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      Top Hiring Companies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.hiringCompanies.map((company) => (
                        <Badge
                          key={company}
                          variant="outline"
                          className="text-xs"
                        >
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Locations */}
                {item.topLocations.length > 0 && (
                  <div>
                    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Top Locations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.topLocations.map((loc) => (
                        <Badge
                          key={loc}
                          variant="secondary"
                          className="bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400"
                        >
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insight */}
                {item.keyInsight && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Key Insight
                    </div>
                    <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                      {item.keyInsight}
                    </p>
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
