import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the latest report and user streak
    const [latestReport, userRecord] = await Promise.all([
      db.report.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          roadmaps: {
            where: { status: 'active' },
            take: 1,
          },
        },
      }),
      db.user.findUnique({
        where: { id: user.id },
        select: { streak: true, lastActive: true },
      }),
    ]);

    if (!latestReport) {
      return NextResponse.json({ 
        hasAnalysis: false,
        streak: userRecord?.streak || 0 
      });
    }

    // Fetch skill progress
    const skillProgress = await db.skillProgress.findMany({
      where: { userId: user.id },
    });

    // Fetch saved jobs
    const savedJobs = await db.savedJob.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      hasAnalysis: true,
      report: latestReport,
      skillProgress,
      savedJobs,
      streak: userRecord?.streak || 0,
    });
  } catch (error) {
    console.error('[api/dashboard/latest] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
