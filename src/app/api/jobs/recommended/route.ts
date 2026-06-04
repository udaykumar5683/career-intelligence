import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JobRecommendationEngine } from '@/lib/job-recommendation-engine';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('[jobs/recommended] Request for reportId:', reportId, 'page:', page);

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch the report
    const report = await db.report.findUnique({
      where: { id: reportId, userId: user.id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Parse analysisResult if it's a string
    let analysisResult = report.analysisResult;
    if (typeof analysisResult === 'string') {
      try {
        analysisResult = JSON.parse(analysisResult);
        console.log('[jobs/recommended] Parsed analysisResult from string');
      } catch (e) {
        console.error('[jobs/recommended] Failed to parse analysisResult string:', e);
        throw new Error('Invalid analysis result format');
      }
    }

    // Validate analysisResult structure
    if (!analysisResult?.profile || !analysisResult?.jobRoles) {
      console.error('[jobs/recommended] analysisResult missing required fields:', analysisResult);
      throw new Error('Analysis result is incomplete');
    }

    console.log('[jobs/recommended] Starting recommendation engine with profile:', analysisResult.profile.name);

    // 2. Get recommendations
    const recommendations = await JobRecommendationEngine.getRecommendations(
      analysisResult,
      page
    );

    console.log('[jobs/recommended] Successfully returned', recommendations.jobs.length, 'jobs');

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('Job recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job recommendations' },
      { status: 500 }
    );
  }
}
