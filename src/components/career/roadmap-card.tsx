'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  Map,
  Clock,
  CheckCircle2,
  Circle,
  Flag,
  ChevronDown,
} from 'lucide-react'
import type { RoadmapStep } from '@/types/analysis'

interface RoadmapCardProps {
  roadmap: RoadmapStep[]
}

function getPriorityColor(priority: 'Critical' | 'High' | 'Medium'): string {
  switch (priority) {
    case 'Critical':
      return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
    case 'High':
      return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700'
    case 'Medium':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
  }
}

function getPriorityDot(priority: 'Critical' | 'High' | 'Medium'): string {
  switch (priority) {
    case 'Critical':
      return 'bg-red-500'
    case 'High':
      return 'bg-amber-500'
    case 'Medium':
      return 'bg-emerald-500'
  }
}

function getPhaseBorderColor(priority: 'Critical' | 'High' | 'Medium'): string {
  switch (priority) {
    case 'Critical':
      return 'border-red-300 dark:border-red-700'
    case 'High':
      return 'border-amber-300 dark:border-amber-700'
    case 'Medium':
      return 'border-emerald-300 dark:border-emerald-700'
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-teal-600" />
          Learning & Action Roadmap
        </CardTitle>
        <CardDescription>
          Your personalized {roadmap.length}-phase improvement plan
        </CardDescription>
      </CardHeader>

      <ScrollArea className="max-h-[650px]">
        <CardContent>
          <motion.div
            className="relative space-y-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {roadmap.map((step, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="relative flex gap-4 pb-6">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    {/* Phase number circle */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${getPhaseBorderColor(step.priority)} bg-background text-sm font-bold text-foreground shadow-sm`}
                    >
                      {step.phase}
                    </div>
                    {/* Connecting line */}
                    {idx < roadmap.length - 1 && (
                      <div className="mt-1 h-full w-0.5 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="rounded-lg border p-4 space-y-3">
                      {/* Phase header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {step.title}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${getPriorityColor(step.priority)}`}
                        >
                          {step.priority}
                        </Badge>
                      </div>

                      {/* Tasks checklist */}
                      {step.tasks.length > 0 && (
                        <div>
                          <span className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Tasks
                          </span>
                          <ul className="space-y-1.5">
                            {step.tasks.map((task, tIdx) => (
                              <li
                                key={tIdx}
                                className="flex items-start gap-2 text-sm text-foreground"
                              >
                                <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Milestone */}
                      {step.milestone && (
                        <div className="flex items-start gap-2 rounded-md bg-teal-50 p-2.5 dark:bg-teal-950/20">
                          <Flag className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-teal-600 dark:text-teal-400">
                              Milestone
                            </span>
                            <p className="text-sm text-teal-800 dark:text-teal-200">
                              {step.milestone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
