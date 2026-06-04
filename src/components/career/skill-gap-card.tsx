'use client'

import { useMemo } from 'react'
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  BookOpen,
  Puzzle,
} from 'lucide-react'
import type { SkillGap } from '@/types/analysis'

interface SkillGapCardProps {
  skillGaps: SkillGap[]
}

const chartConfig = {
  importance: {
    label: 'Importance',
    color: '#f59e0b',
  },
} satisfies ChartConfig

function getImportanceColor(importance: 'Critical' | 'Important' | 'Nice to Have'): string {
  switch (importance) {
    case 'Critical':
      return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
    case 'Important':
      return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700'
    case 'Nice to Have':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
  }
}

function getImportanceBarColor(importance: 'Critical' | 'Important' | 'Nice to Have'): string {
  switch (importance) {
    case 'Critical':
      return '#ef4444'
    case 'Important':
      return '#f59e0b'
    case 'Nice to Have':
      return '#10b981'
  }
}

function getDifficultyColor(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'Medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'Hard':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }
}

function getImportanceValue(importance: 'Critical' | 'Important' | 'Nice to Have'): number {
  switch (importance) {
    case 'Critical':
      return 3
    case 'Important':
      return 2
    case 'Nice to Have':
      return 1
  }
}

export function SkillGapCard({ skillGaps }: SkillGapCardProps) {
  // Group skills by category
  const grouped = useMemo(() => {
    const map = new Map<string, SkillGap[]>()
    for (const gap of skillGaps) {
      const list = map.get(gap.category) || []
      list.push(gap)
      map.set(gap.category, list)
    }
    // Sort each group: Critical first, then Important, then Nice to Have
    const order = { Critical: 0, Important: 1, 'Nice to Have': 2 }
    for (const [, list] of map) {
      list.sort((a, b) => order[a.importance] - order[b.importance])
    }
    return map
  }, [skillGaps])

  // Chart data: each skill with importance value for bar chart
  const chartData = useMemo(() => {
    return skillGaps.map((gap) => ({
      name: gap.skill.length > 15 ? gap.skill.slice(0, 15) + '…' : gap.skill,
      fullName: gap.skill,
      importance: getImportanceValue(gap.importance),
      importanceLabel: gap.importance,
      color: getImportanceBarColor(gap.importance),
    }))
  }, [skillGaps])

  const totalGaps = skillGaps.length
  const criticalCount = skillGaps.filter((s) => s.importance === 'Critical').length
  const importantCount = skillGaps.filter((s) => s.importance === 'Important').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-amber-600" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          {totalGaps} skills to develop &middot; {criticalCount} critical &middot; {importantCount} important
        </CardDescription>
      </CardHeader>

      <ScrollArea className="max-h-[700px]">
        <CardContent className="space-y-6">
          {/* Skill Gap Chart */}
          {chartData.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Skill Importance Overview
              </h4>
              <ChartContainer config={chartConfig} className="h-[200px] w-full" style={{ aspectRatio: undefined }}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v: number) => v === 1 ? 'Nice' : v === 2 ? 'Important' : v === 3 ? 'Critical' : ''} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string, props: { payload?: { fullName?: string; importanceLabel?: string } }) => {
                      if (props.payload) {
                        return [props.payload.importanceLabel, props.payload.fullName || name]
                      }
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Accordion by Category */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Skills by Category
            </h4>
            <Accordion type="multiple" defaultValue={Array.from(grouped.keys())}>
              {Array.from(grouped.entries()).map(([category, gaps]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-sm font-medium">
                    <span className="flex items-center gap-2">
                      {category}
                      <Badge variant="secondary" className="text-xs">
                        {gaps.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {gaps.map((gap, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border p-3 space-y-2"
                        >
                          {/* Skill name + badges */}
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-medium text-foreground">
                              {gap.skill}
                            </h5>
                            <div className="flex shrink-0 gap-1">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${getImportanceColor(gap.importance)}`}
                              >
                                {gap.importance}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] ${getDifficultyColor(gap.learningDifficulty)}`}
                              >
                                {gap.learningDifficulty}
                              </Badge>
                            </div>
                          </div>

                          {/* Time to learn */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Est. {gap.estimatedTimeToLearn}</span>
                          </div>

                          {/* Learning Resources */}
                          {gap.resources.length > 0 && (
                            <div>
                              <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                <BookOpen className="h-3 w-3" />
                                Resources
                              </span>
                              <div className="space-y-1">
                                {gap.resources.map((res, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400"
                                  >
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{res}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
