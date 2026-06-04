import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ReportsGrid } from '@/components/career/reports-grid';
import { ShieldCheck, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: 'My Reports | AI Career Intelligence',
  description: 'View and manage your AI-generated career intelligence reports, including skill analysis, salary predictions, and career roadmaps.',
  keywords: ['career reports', 'AI analysis', 'skill assessment'],
};

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch reports from Prisma
  const reports = await db.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log('[reports page] Fetched reports:', reports.map(r => ({ id: r.id, candidateName: r.candidateName })));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My Career Reports</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your AI-generated career intelligence reports
            </p>
          </div>
          
          <Link href="/">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/20">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="bg-background p-4 rounded-2xl shadow-sm mb-4">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground text-center max-w-xs mb-8">
              Upload your resume on the home page to generate your first career intelligence report.
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        ) : (
          <ReportsGrid initialReports={JSON.parse(JSON.stringify(reports))} />
        )}
      </div>
    </div>
  );
}
