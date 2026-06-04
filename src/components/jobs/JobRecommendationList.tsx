'use client';

import { useState, useEffect } from 'react';
import { Job, JobRecommendationResponse } from '@/types/job';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle,
  Briefcase,
  User,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface JobRecommendationListProps {
  reportId: string;
}

// Helper to track analytics events (we can expand this later)
const trackEvent = async (eventName: string, data: Record<string, any> = {}) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, data, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.error('Analytics tracking error:', e);
  }
};

export function JobRecommendationList({ reportId }: JobRecommendationListProps) {
  const [data, setData] = useState<JobRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jobs/recommended?reportId=${reportId}`);
        if (!response.ok) throw new Error('Failed to load recommendations');
        const result = await response.json();
        setData(result);
        // Also fetch report to get profile data
        const reportResponse = await fetch(`/api/reports/${reportId}`);
        if (reportResponse.ok) {
          const report = await reportResponse.json();
          setProfile(report.analysisResult?.profile);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (reportId) fetchJobs();
  }, [reportId]);

  // Track empty state view when applicable
  useEffect(() => {
    if (!isLoading && data && data.jobs.length === 0) {
      trackEvent('NO_MATCHING_JOBS_SHOWN', {
        skillsCount: profile?.skills?.length || 0,
        preferredLocation: profile?.location || '',
        salaryRange: profile?.salaryExpectation || '',
      });
    }
  }, [isLoading, data, profile]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Check if profile is incomplete
  const isProfileIncomplete = !profile || profile.skills?.length === 0;

  if (!data || data.jobs.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-muted-foreground/30">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
            {isProfileIncomplete ? (
              <>
                <CardTitle className="text-xl">Complete your profile to receive personalized job recommendations</CardTitle>
                <CardDescription>
                  We need more information about your skills and experience to find the best jobs for you.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl">No matching live jobs found at the moment</CardTitle>
                <CardDescription>
                  We couldn't find any active jobs matching your current skills, preferred location, or salary expectations.
                  <br />
                  Try updating your skill tags, preferred job location, and salary range to improve your matching opportunities.
                </CardDescription>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => {
                  trackEvent('NO_MATCHING_JOBS_UPDATE_PROFILE_CLICK');
                  // Navigate to profile (we don't have a /profile page yet, so let's go to dashboard for now)
                  window.location.href = '/dashboard';
                }}
                className="w-full sm:w-auto"
              >
                <User className="h-4 w-4 mr-2" />
                Update My Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  trackEvent('NO_MATCHING_JOBS_VIEW_ALL_CLICK');
                  window.location.href = '/jobs';
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                Browse All Live Jobs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Market Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <Trophy className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase">Avg. Market Salary</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{(data.marketInsights.averageSalary / 100000).toFixed(1)}L - ₹{(data.marketInsights.averageSalary * 1.2 / 100000).toFixed(1)}L</p>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Growth Potential</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.marketInsights.salaryGrowthPotential}</p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase">Open Roles</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.total.toLocaleString()}+</p>
          </div>
        </div>
      </div>

      {/* Top Skills Demand */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            High Demand Skills in Matching Jobs
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.marketInsights.skillDemand.slice(0, 5).map(skill => (
            <div key={skill.skill} className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-700 dark:text-gray-300">{skill.skill}</span>
                <span className="text-teal-600 dark:text-teal-400">{skill.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full" 
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Recommended for You</h3>
          <Link href="/jobs">
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700 font-semibold">
              See All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
