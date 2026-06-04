import type { AnalysisResults } from '@/types/analysis';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getCareerChatResponse(
  messages: ChatMessage[],
  analysisResults: AnalysisResults,
  careerMemory?: any // We'll add type later
) {
  const { profile, jobRoles, skillGaps, placementRisk, roadmap } = analysisResults;

  // Build Career Memory Context String
  let memoryContext = '';
  if (careerMemory) {
    if (careerMemory.reports && careerMemory.reports.length > 0) {
      memoryContext += `\nCAREER HISTORY (LAST ${careerMemory.reports.length} REPORTS):\n`;
      careerMemory.reports.forEach((r, i) => {
        memoryContext += `  Report ${i+1} (${new Date(r.date).toLocaleDateString()}): Score ${r.score}/100, Risk: ${r.placementRisk}\n`;
      });
    }
    if (careerMemory.skillProgress && careerMemory.skillProgress.length > 0) {
      memoryContext += `\nSKILL PROGRESS:\n`;
      careerMemory.skillProgress.forEach((sp: any) => {
        memoryContext += `  - ${sp.skillName}: ${sp.status} (${sp.progress}%)\n`;
      });
    }
    if (careerMemory.savedJobs && careerMemory.savedJobs.length > 0) {
      memoryContext += `\nSAVED JOBS (${careerMemory.savedJobs.length}):\n`;
      careerMemory.savedJobs.forEach((sj: any) => {
        memoryContext += `  - ${sj.title} at ${sj.company}${sj.matchScore ? ` (${sj.matchScore}% match)` : ''}\n`;
      });
    }
  }

  const contextPrompt = `You are an AI Career Copilot. Your goal is to provide personalized, actionable guidance based on the candidate's complete career history and current profile.

CANDIDATE: ${profile?.name || 'Candidate'}
TOP SKILLS: ${Array.isArray(profile?.skills) ? profile.skills.filter(s => s && s.toLowerCase() !== 'null').slice(0, 10).join(', ') : ''}
ROLES: ${Array.isArray(jobRoles) ? jobRoles.slice(0, 3).map(r => r.role).join(', ') : ''}
GAPS: ${Array.isArray(skillGaps) ? skillGaps.filter(s => s?.skill && s.skill.toLowerCase() !== 'null').slice(0, 5).map(s => s.skill).join(', ') : ''}
RISK: ${placementRisk?.overallRisk || 'Medium'}
ROADMAP: ${Array.isArray(roadmap) ? roadmap.slice(0, 3).map(r => r.title).join(' -> ') : ''}
${memoryContext}

INSTRUCTIONS:
1. Be concise. Avoid long-winded explanations.
2. DO NOT repeat greetings (like "Hello", "Hi", "Great to connect").
3. DO NOT repeat previous answers or information already discussed.
4. Focus ONLY on answering the latest user question.
5. Use clean Markdown (bolding, lists).
6. Maintain a professional, helpful "Copilot" persona.
7. If asked about resume or interviews, give 3-5 specific, actionable points.
8. Use the career history and skill progress to provide personalized advice.
9. If there are multiple reports, mention trends (e.g., "Your score increased by X points").

CONVERSATION HISTORY:`;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: contextPrompt,
  };

  // Only send last 6 messages (3 turns) to keep context focused and avoid repetition
  const recentMessages = messages.slice(-6);
  const chatMessages = [systemMessage, ...recentMessages];

  console.log('[career-chat-agent] Sending request to GROQ with messages:', chatMessages);
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[career-chat-agent] GROQ API error response:', errorText);
      throw new Error(`GROQ API request failed: ${response.status} - ${errorText}`);
    }

    return response.body;
  } catch (groqError) {
    console.error('[career-chat-agent] GROQ API failed, using fallback:', groqError);
    // Fallback: create a simple streaming response
    const fallbackMessage = "I'm currently having trouble connecting to my AI backend, but I can still help! Here's what I know about your career so far:\n"
      + (Array.isArray(profile?.skills) && profile.skills.length > 0 ? `- You have skills like ${profile.skills.slice(0,3).join(', ')}\n` : '')
      + (Array.isArray(skillGaps) && skillGaps.length >0 ? `- Consider working on these skills: ${skillGaps.slice(0,3).map(s=>s.skill).join(', ')}\n` : '')
      + "\nPlease try again later for more advanced advice!";
    
    // Create a simple ReadableStream for fallback
    const encoder = new TextEncoder();
    let i = 0;
    const fallbackStream = new ReadableStream({
      async pull(controller) {
        if (i >= fallbackMessage.length) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }
        const chunk = fallbackMessage.slice(i, i+10);
        i += 10;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
      }
    });
    return fallbackStream as any;
  }
}
