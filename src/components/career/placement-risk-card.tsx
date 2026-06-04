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
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import type { PlacementRisk } from '@/types/analysis'

interface PlacementRiskCardProps {
  risk: PlacementRisk
}

const chartConfig = {
  score: {
    label: 'Score',
    color: '#10b981',
  },
  remaining: {
    label: 'Remaining',
    color: '#e5e7eb',
  },
} satisfies ChartConfig

function getRiskColor(risk: 'Low' | 'Medium' | 'High'): string {
  switch (risk) {
    case 'Low':
      return '#10b981'
    case 'Medium':
      return '#f59e0b'
    case 'High':
      return '#ef4444'
  }
}

function getRiskBg(risk: 'Low' | 'Medium' | 'High'): string {
  switch (risk) {
    case 'Low':
      return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
    case 'Medium':
      return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
    case 'High':
      return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
  }
}

function getRiskBadge(risk: 'Low' | 'Medium' | 'High'): string {
  switch (risk) {
    case 'Low':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'Medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
}

function getProbabilityBarColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function getProbabilityBarBg(pct: number): string {
  if (pct >= 70) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (pct >= 40) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-red-100 dark:bg-red-900/30'
}

// Custom SVG gauge component
function RiskGauge({ score, risk }: { score: number; risk: 'Low' | 'Medium' | 'High' }) {
  const color = getRiskColor(risk)
  const data = [
    { name: 'score', value: score },
    { name: 'remaining', value: 100 - score },
  ]

  return (
    <div className="relative mx-auto h-48 w-48">
      <ChartContainer config={chartConfig} className="h-full w-full" style={{ aspectRatio: undefined }}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" className="dark:fill-gray-800" />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export function PlacementRiskCard({ risk }: PlacementRiskCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const probabilities = [
    { label: 'Within 3 months', value: risk.withinThreeMonths },
    { label: 'Within 6 months', value: risk.withinSixMonths },
    { label: 'Within 12 months', value: risk.withinTwelveMonths },
  ]

  return (
    <Card className={getRiskBg(risk.overallRisk)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" style={{ color: getRiskColor(risk.overallRisk) }} />
          Placement Risk Assessment
        </CardTitle>
        <CardDescription>
          Your placement probability analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Gauge + Badge */}
        <div className="flex flex-col items-center gap-3">
          <RiskGauge score={risk.overallScore} risk={risk.overallRisk} />
          <Badge
            className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${getRiskBadge(risk.overallRisk)}`}
          >
            {risk.overallRisk} Risk
          </Badge>
        </div>

        {/* Probability Bars */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            Placement Probability
          </h4>
          {probabilities.map((prob) => (
            <div key={prob.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{prob.label}</span>
                <span className="font-semibold text-foreground">{prob.value}%</span>
              </div>
              <div className={`h-2.5 w-full rounded-full ${getProbabilityBarBg(prob.value)}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getProbabilityBarColor(prob.value)}`}
                  style={{ width: `${prob.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Strengths */}
          {risk.strengths.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Strengths
              </h5>
              <ul className="space-y-1.5">
                {risk.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-emerald-900 dark:text-emerald-200">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {risk.weaknesses.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/20">
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                Areas to Improve
              </h5>
              <ul className="space-y-1.5">
                {risk.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="text-red-900 dark:text-red-200">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detailed Explanation (Collapsible) */}
        {risk.explanation && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-muted-foreground"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
                {isOpen ? 'Hide' : 'Show'} Detailed Explanation
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {risk.explanation}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
