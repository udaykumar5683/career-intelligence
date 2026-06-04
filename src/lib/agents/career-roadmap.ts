import type {
  ResumeProfile,
  JobRoleRecommendation,
  SkillGap,
  PlacementRisk,
  RoadmapStep,
} from '@/types/analysis';

/**
 * Cleans LLM JSON responses by removing markdown code fences if present
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Helper function to call GROQ API
 */
async function callGROQ(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[career-roadmap] GROQ API error:', response.status, errorText);
    throw new Error(`GROQ API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response content from GROQ');
  }

  return content;
}

/**
 * Uses GROQ LLM to build a comprehensive career improvement roadmap based on
 * all previous analysis results.
 */
export async function buildCareerRoadmap(
  profile: ResumeProfile,
  jobRoles: JobRoleRecommendation[],
  skillGaps: SkillGap[],
  placementRisk: PlacementRisk
): Promise<RoadmapStep[]> {
  const systemPrompt = `You are an expert career development coach and learning path designer. Given a candidate's profile, recommended job roles, skill gaps, and placement risk assessment, create a comprehensive career improvement roadmap.

Return ONLY a valid JSON array with 4-6 roadmap phases with this exact structure (no markdown, no code fences, no extra text):
[
  {
    "phase": 1,
    "title": "Phase Title",
    "duration": "1-2 months",
    "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
    "milestone": "Clear, measurable achievement to reach by end of phase",
    "priority": "Critical"
  }
]

Rules:
- phase: Sequential integer starting from 1
- title: Descriptive phase title (e.g., "Foundation Building", "Core Skills Development", "Specialization & Projects")
- duration: Human-readable duration estimate (e.g., "2-3 weeks", "1-2 months", "3-4 months")
- tasks: 3-6 specific, actionable tasks for this phase
  - Each task should be concrete and achievable
  - Include both learning tasks and practical application tasks
  - Reference specific skills from the skill gaps where relevant
- milestone: A clear, measurable achievement that marks completion of the phase
- priority: Must be exactly one of "Critical", "High", "Medium"
  - Critical: Must be done first, blocks other progress
  - High: Very important, should be prioritized
  - Medium: Important but can be flexible on timing
- Phase 1 should focus on the most critical skill gaps and quick wins
- Later phases should build progressively toward the target roles
- Include a mix of technical skill building, project work, and job search preparation
- The last phase should focus on job application and interview preparation
- Make the roadmap realistic and achievable`;

  const analysisContext = JSON.stringify({
    profile: {
      name: profile.name,
      currentSkills: profile.skills,
      experience: profile.experience.map((e) => `${e.title} at ${e.company}`),
      education: profile.education.map((e) => e.degree),
    },
    targetRoles: jobRoles.map((r) => ({
      role: r.role,
      matchScore: r.matchScore,
      matchedSkills: r.matchedSkills,
      requiredSkills: r.requiredSkills,
    })),
    skillGaps: skillGaps.map((g) => ({
      skill: g.skill,
      importance: g.importance,
      category: g.category,
      difficulty: g.learningDifficulty,
      timeToLearn: g.estimatedTimeToLearn,
    })),
    placementRisk: {
      overallRisk: placementRisk.overallRisk,
      overallScore: placementRisk.overallScore,
      strengths: placementRisk.strengths,
      weaknesses: placementRisk.weaknesses,
    },
  });

  const responseText = await callGROQ([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Create a career improvement roadmap for this candidate based on their complete analysis:\n\n${analysisContext}`,
    },
  ]);

  if (!responseText) {
    throw new Error('No response from LLM for career roadmap');
  }

  const cleanedJson = cleanJsonResponse(responseText);

  try {
    const parsed = JSON.parse(cleanedJson);
    const roadmapArray = Array.isArray(parsed) ? parsed : parsed.roadmap || parsed.phases || [];

    if (!Array.isArray(roadmapArray) || roadmapArray.length === 0) {
      throw new Error('No roadmap steps found in response');
    }

    return roadmapArray.map((item: Record<string, unknown>, index: number) => ({
      phase: typeof item.phase === 'number' ? item.phase : index + 1,
      title: String(item.title || `Phase ${index + 1}`),
      duration: String(item.duration || '1-2 months'),
      tasks: Array.isArray(item.tasks) ? item.tasks.map(String).slice(0, 6) : ['Continue skill development'],
      milestone: String(item.milestone || 'Complete phase objectives'),
      priority: ['Critical', 'High', 'Medium'].includes(item.priority as string)
        ? (item.priority as 'Critical' | 'High' | 'Medium')
        : index === 0 ? 'Critical' : 'High',
    }));
  } catch (parseError) {
    console.error('Failed to parse career roadmap:', parseError);
    console.error('Raw response:', responseText);

    // Return a basic fallback roadmap
    const criticalSkills = skillGaps.filter((g) => g.importance === 'Critical');
    const importantSkills = skillGaps.filter((g) => g.importance === 'Important');

    return [
      {
        phase: 1,
        title: 'Critical Skills Foundation',
        duration: '1-2 months',
        tasks: criticalSkills.slice(0, 4).map((g) => `Learn ${g.skill} (${g.estimatedTimeToLearn})`) || ['Identify and start learning critical missing skills'],
        milestone: 'Complete foundational learning for critical skill gaps',
        priority: 'Critical' as const,
      },
      {
        phase: 2,
        title: 'Skills Deepening & Practice',
        duration: '2-3 months',
        tasks: importantSkills.slice(0, 4).map((g) => `Build proficiency in ${g.skill}`) || ['Practice and apply newly learned skills'],
        milestone: 'Build working proficiency in important skill areas',
        priority: 'High' as const,
      },
      {
        phase: 3,
        title: 'Project Building & Portfolio',
        duration: '1-2 months',
        tasks: [
          'Build portfolio projects showcasing new skills',
          'Document learning and achievements',
          'Get peer feedback on projects',
        ],
        milestone: 'Complete 2-3 portfolio-ready projects',
        priority: 'High' as const,
      },
      {
        phase: 4,
        title: 'Job Application & Interview Prep',
        duration: '1-2 months',
        tasks: [
          'Optimize resume for target roles',
          'Practice technical interviews',
          'Apply to relevant positions',
          'Network with industry professionals',
        ],
        milestone: 'Secure interviews for target roles',
        priority: 'Medium' as const,
      },
    ];
  }
}
