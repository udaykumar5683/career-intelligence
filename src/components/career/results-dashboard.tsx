'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileCard } from '@/components/career/profile-card'
import { JobRolesCard } from '@/components/career/job-roles-card'
import { MarketResearchCard } from '@/components/career/market-research-card'
import { SkillGapCard } from '@/components/career/skill-gap-card'
import { PlacementRiskCard } from '@/components/career/placement-risk-card'
import { SalaryCard } from '@/components/career/salary-card'
import { RoadmapCard } from '@/components/career/roadmap-card'
import {
  Download,
  RotateCcw,
  User,
  Briefcase,
  Puzzle,
  DollarSign,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import type { AnalysisResults } from '@/types/analysis'
import { toast } from 'sonner'
import { downloadPDF } from '@/lib/report-pdf-utils'
import { CareerChat } from './career-chat'

import { JobRecommendationList } from '@/components/jobs/JobRecommendationList'

interface ResultsDashboardProps {
  results: AnalysisResults
  onReset: () => void
}

export function ResultsDashboard({ results, onReset }: ResultsDashboardProps) {
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    setDownloading(true);
    // Small delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 300));
    await downloadPDF(results, toast);
    setDownloading(false);
  };



  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 sm:px-4 pb-20">
      {/* Header with actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Career Intelligence Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Analysis for {results.profile.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-50"
            onClick={() => router.push('/jobs')}
          >
            <Briefcase className="h-4 w-4" />
            Find Matching Jobs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? 'Generating...' : 'Download Report'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 pb-2 pt-1 backdrop-blur-sm">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Job Roles & Market</span>
              <span className="sm:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5 text-xs sm:text-sm">
              <Puzzle className="h-4 w-4" />
              <span className="hidden sm:inline">Skill Analysis</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="salary-roadmap" className="gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Salary & Roadmap</span>
              <span className="sm:hidden">Salary</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5 text-xs sm:text-sm bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Live Job Board</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs sm:text-sm bg-teal-50 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Career Mentor</span>
              <span className="sm:hidden">AI Chat</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview - Profile + Placement Risk */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProfileCard profile={results.profile} roles={results.jobRoles} />
            <PlacementRiskCard risk={results.placementRisk} />
          </div>
        </TabsContent>

        {/* Tab 2: Job Roles & Market */}
        <TabsContent value="roles">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <JobRolesCard roles={results.jobRoles} />
            <MarketResearchCard research={results.marketResearch} />
          </div>
        </TabsContent>

        {/* Tab 3: Skill Analysis */}
        <TabsContent value="skills">
          <SkillGapCard skillGaps={results.skillGaps} />
        </TabsContent>

        {/* Tab 4: Salary & Roadmap */}
        <TabsContent value="salary-roadmap">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SalaryCard estimates={results.salaryEstimates} />
            <RoadmapCard roadmap={results.roadmap} />
          </div>
        </TabsContent>

        {/* Tab 5: Live Job Board */}
        <TabsContent value="jobs" className="mt-4">
          {results.id ? (
            <JobRecommendationList reportId={results.id} />
          ) : (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-blue-500" />
              <div className="space-y-2">
                <CardTitle>Analysis Required</CardTitle>
                <p className="text-muted-foreground max-w-md">
                  Please save your analysis result to enable real-time job matching from our live board.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Tab 6: AI Chat Assistant */}
        <TabsContent value="chat" className="mt-4">
          {results.id ? (
            <CareerChat 
              reportId={results.id} 
              userName={results.profile.name} 
            />
          ) : (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <div className="space-y-2">
                <CardTitle>Persistence Required</CardTitle>
                <p className="text-muted-foreground max-w-md">
                  The AI Career Mentor requires your report to be saved in the database to maintain context. 
                  Please ensure your database connection is configured to enable interactive chat.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
