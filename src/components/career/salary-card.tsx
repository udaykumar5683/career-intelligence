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
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Info, TrendingUp } from 'lucide-react'
import type { SalaryEstimate, SalaryRange } from '@/types/analysis'

interface SalaryCardProps {
  estimates: SalaryEstimate[]
}

const chartConfig = {
  min: {
    label: 'Min',
    color: '#99f6e4',
  },
  median: {
    label: 'Median',
    color: '#14b8a6',
  },
  max: {
    label: 'Max',
    color: '#0d9488',
  },
} satisfies ChartConfig

function getConfidenceColor(level: 'High' | 'Medium' | 'Low'): string {
  switch (level) {
    case 'High':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'Medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'Low':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }
}

function formatSalary(value: number, currency: string): string {
  if (currency === 'USD' || currency === '$') {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `${currency}${(value / 1000).toFixed(0)}K`
}

function SalaryRangeBar({
  range,
  globalMin,
  globalMax,
  currency,
  level,
}: {
  range: SalaryRange
  globalMin: number
  globalMax: number
  currency: string
  level: string
}) {
  const span = globalMax - globalMin || 1
  const leftPct = ((range.min - globalMin) / span) * 100
  const widthPct = ((range.max - range.min) / span) * 100
  const medianPct = ((range.median - globalMin) / span) * 100

  const levelColor =
    level === 'Entry'
      ? 'bg-teal-400 dark:bg-teal-500'
      : level === 'Mid'
        ? 'bg-amber-400 dark:bg-amber-500'
        : 'bg-emerald-500 dark:bg-emerald-600'

  const medianColor =
    level === 'Entry'
      ? 'bg-teal-600 dark:bg-teal-300'
      : level === 'Mid'
        ? 'bg-amber-600 dark:bg-amber-300'
        : 'bg-emerald-700 dark:bg-emerald-300'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{level} Level</span>
        <span className="text-muted-foreground">
          {formatSalary(range.min, currency)} – {formatSalary(range.max, currency)}{' '}
          <span className="font-medium text-foreground">
            (Median: {formatSalary(range.median, currency)})
          </span>
        </span>
      </div>
      <div className="relative h-4 w-full rounded-full bg-muted">
        {/* Range bar */}
        <div
          className={`absolute top-0 h-full rounded-full opacity-40 ${levelColor}`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        {/* Median marker */}
        <div
          className={`absolute top-0 h-full w-1 rounded-full ${medianColor}`}
          style={{ left: `${medianPct}%` }}
        />
      </div>
    </div>
  )
}

export function SalaryCard({ estimates }: SalaryCardProps) {
  // Find global min/max for consistent range bars
  const allValues = estimates.flatMap((e) => [
    e.entryLevel.min,
    e.entryLevel.max,
    e.midLevel.min,
    e.midLevel.max,
    e.seniorLevel.min,
    e.seniorLevel.max,
  ])
  const globalMin = Math.min(...allValues)
  const globalMax = Math.max(...allValues)

  // Chart data: each estimate contributes 3 bars
  const chartData = estimates.flatMap((e) => [
    {
      role: `${e.role} (Entry)`,
      min: e.entryLevel.min / 1000,
      median: e.entryLevel.median / 1000,
      max: e.entryLevel.max / 1000,
      fill: '#99f6e4',
    },
    {
      role: `${e.role} (Mid)`,
      min: e.midLevel.min / 1000,
      median: e.midLevel.median / 1000,
      max: e.midLevel.max / 1000,
      fill: '#5eead4',
    },
    {
      role: `${e.role} (Senior)`,
      min: e.seniorLevel.min / 1000,
      median: e.seniorLevel.median / 1000,
      max: e.seniorLevel.max / 1000,
      fill: '#14b8a6',
    },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Salary Estimations
        </CardTitle>
        <CardDescription>
          Estimated salary ranges for {estimates.length} roles
        </CardDescription>
      </CardHeader>

      <ScrollArea className="max-h-[600px]">
        <CardContent className="space-y-5">
          {/* Summary Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Median Salary Comparison (K)
              </h4>
              <ChartContainer config={chartConfig} className="h-[220px] w-full" style={{ aspectRatio: undefined }}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}K`} />
                  <YAxis dataKey="role" type="category" width={120} tick={{ fontSize: 10 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value}K`, '']}
                  />
                  <Bar dataKey="median" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Detailed range bars per role */}
          {estimates.map((estimate, idx) => (
            <Card key={idx} className="border shadow-none">
              <CardContent className="p-4 space-y-4">
                {/* Role header */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-foreground">{estimate.role}</h4>
                  <Badge variant="secondary" className={getConfidenceColor(estimate.confidenceLevel)}>
                    {estimate.confidenceLevel} confidence
                  </Badge>
                </div>

                {/* Currency */}
                <div className="text-xs text-muted-foreground">
                  Currency: {estimate.currency}
                </div>

                {/* Range bars */}
                <div className="space-y-3">
                  <SalaryRangeBar
                    range={estimate.entryLevel}
                    globalMin={globalMin}
                    globalMax={globalMax}
                    currency={estimate.currency}
                    level="Entry"
                  />
                  <SalaryRangeBar
                    range={estimate.midLevel}
                    globalMin={globalMin}
                    globalMax={globalMax}
                    currency={estimate.currency}
                    level="Mid"
                  />
                  <SalaryRangeBar
                    range={estimate.seniorLevel}
                    globalMin={globalMin}
                    globalMax={globalMax}
                    currency={estimate.currency}
                    level="Senior"
                  />
                </div>

                {/* Key Factors */}
                {estimate.factors.length > 0 && (
                  <div>
                    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      Key Factors
                    </span>
                    <ul className="space-y-1">
                      {estimate.factors.map((factor, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-teal-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
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
