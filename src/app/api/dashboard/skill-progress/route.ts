import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillName, status, progress, category } = await request.json();

    if (!skillName) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const updatedSkill = await db.skillProgress.upsert({
      where: {
        userId_skillName: {
          userId: user.id,
          skillName: skillName,
        },
      },
      update: {
        status: status || undefined,
        progress: progress !== undefined ? progress : undefined,
        category: category || undefined,
      },
      create: {
        userId: user.id,
        skillName: skillName,
        status: status || 'pending',
        progress: progress || 0,
        category: category || 'Technical',
      },
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error('[api/dashboard/skill-progress] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
