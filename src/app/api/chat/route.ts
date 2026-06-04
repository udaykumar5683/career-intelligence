import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { addChatMessage, getChatSession } from '@/lib/chat-service';
import { getCareerChatResponse } from '@/lib/agents/career-chat-agent';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Career Memory System - Gather all user data
    const [reports, skillProgress, savedJobs, roadmaps] = await Promise.all([
      db.report.findMany({ 
        where: { userId: user.id }, 
        orderBy: { createdAt: 'desc' },
        take: 5 // Last 5 reports
      }),
      db.skillProgress.findMany({ where: { userId: user.id } }),
      db.savedJob.findMany({ where: { userId: user.id } }),
      db.userRoadmap.findMany({ where: { userId: user.id } })
    ]);

    const careerMemory = {
      reports: reports.map(r => ({
        id: r.id,
        date: r.createdAt,
        score: r.overallScore,
        placementRisk: r.placementRisk
      })),
      skillProgress,
      savedJobs,
      roadmaps
    };

    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return new Response(JSON.stringify({ error: 'Missing sessionId or message' }), { status: 400 });
    }

    // Get the session and verify ownership
    const session = await getChatSession(sessionId, user.id);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
    }

    // Use default empty analysis result if no report
    const analysisResult = session.report?.analysisResult || {
      profile: { name: 'Candidate', skills: [], summary: '' },
      jobRoles: [],
      skillGaps: [],
      placementRisk: { overallRisk: 'Medium', overallScore: 50 },
      roadmap: []
    };

    // Save the user message
    await addChatMessage(sessionId, 'user', message);

    // Prepare messages for AI context (including history)
    const history = session.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    
    // Add current message to history for AI
    history.push({ role: 'user', content: message });

    console.log('[api/chat] Sending request to AI with history length:', history.length);

    // Get AI response stream
    console.log('[api/chat] Requesting completion from GROQ...');
    const completion = await getCareerChatResponse(
      history,
      analysisResult as any,
      careerMemory
    );

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let chunkBuffer = '';

        try {
          console.log('[api/chat] Starting stream loop...');
          
          if (completion) {
            const reader = completion.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunkStr = decoder.decode(value, { stream: true });
              chunkBuffer += chunkStr;
              const lines = chunkBuffer.split('\n');
              chunkBuffer = lines.pop() || '';
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6).trim();
                  if (dataStr === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    if (content) {
                      fullResponse += content;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch (e) {
                    // ignore invalid JSON
                  }
                }
              }
            }
          }

          // Final flush of remaining buffer
          if (chunkBuffer.trim()) {
            try {
              if (chunkBuffer.startsWith('{') && chunkBuffer.endsWith('}')) {
                const content = extractContentFromJSON(JSON.parse(chunkBuffer));
                if (content) fullResponse += content;
              }
            } catch (e) {}
          }

          if (fullResponse) {
            await addChatMessage(sessionId, 'assistant', fullResponse);
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
