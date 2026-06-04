import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { eventName, data, timestamp } = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Store event in the database (we might need to create an AnalyticsEvent table, but let's log for now)
    console.log('Analytics Event:', {
      eventName,
      userId: user.id,
      data,
      timestamp,
    });

    // Optional: If you have an analytics table, uncomment this
    // await db.analyticsEvent.create({
    //   data: {
    //     eventName,
    //     userId: user.id,
    //     data,
    //     timestamp: new Date(timestamp),
    //   }
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    );
  }
}
