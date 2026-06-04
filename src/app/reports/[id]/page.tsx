import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ReportDetailsClient from './ReportDetailsClient';
import { ReportActions } from './ReportActions';

import { Navbar } from "@/components/layout/navbar";

export default async function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch report from Prisma
  const report = await db.report.findUnique({
    where: { 
      id: id,
      userId: user.id // Ensure user owns the report
    },
  });

  if (!report) {
    notFound();
  }

  // Parse analysisResult
  let results;
  try {
    results = typeof report.analysisResult === 'string' 
      ? JSON.parse(report.analysisResult) 
      : report.analysisResult;
    // Make sure the id is set on the results
    results.id = id;
  } catch (error) {
    console.error("Error parsing analysis results:", error);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Report</h1>
        <p className="mt-4">The report data is corrupted or in an invalid format.</p>
        <Link href="/reports">
          <Button variant="outline" className="mt-8 gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ReportActions reportId={id} />
        <ReportDetailsClient results={results} />
      </div>
    </div>
  );
}
