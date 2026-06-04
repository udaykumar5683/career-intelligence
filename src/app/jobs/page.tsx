import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { JobRecommendationList } from '@/components/jobs/JobRecommendationList';
import { JobSearchUI } from '@/components/jobs/JobSearchUI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Search, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Find Jobs | AI Career Intelligence',
  description: 'Discover personalized job recommendations and explore opportunities powered by AI and real-time job market data.',
  keywords: ['job search', 'career opportunities', 'AI job recommendations'],
};

export default async function JobsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get the latest report to show recommendations
  const latestReport = await db.report.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-bold mb-4">
            <Sparkles className="h-4 w-4" />
            AI-POWERED JOB DISCOVERY
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Find Your Next Career Move
          </h1>
          <p className="text-lg text-gray-600">
            We match your AI analysis results with real-world opportunities from live job boards across India.
          </p>
        </div>

        <Tabs defaultValue={latestReport ? "recommendations" : "search"} className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-white p-1 h-14 rounded-2xl shadow-sm border border-gray-100">
              <TabsTrigger 
                value="recommendations" 
                className="rounded-xl px-8 h-12 data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-2 font-bold"
                disabled={!latestReport}
              >
                <Sparkles className="h-4 w-4" /> Recommended for You
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="rounded-xl px-8 h-12 data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-2 font-bold"
              >
                <Search className="h-4 w-4" /> Explore Jobs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recommendations" className="focus-visible:ring-0 outline-none">
            {latestReport ? (
              <JobRecommendationList reportId={latestReport.id} />
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-500">Please analyze your resume first to get personalized recommendations.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="focus-visible:ring-0 outline-none">
            <JobSearchUI />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
