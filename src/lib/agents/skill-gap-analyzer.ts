import type { ResumeProfile, JobRoleRecommendation, SkillGap } from '@/types/analysis';

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
    console.error('[skill-gap-analyzer] GROQ API error:', response.status, errorText);
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
 * Uses LLM to identify skill gaps by comparing the user's current skills
 * against the requirements of recommended job roles.
 */
export async function analyzeSkillGaps(
  profile: ResumeProfile,
  jobRoles: JobRoleRecommendation[]
): Promise<SkillGap[]> {
  const systemPrompt = `You are an expert career skills analyst. Given a candidate's current skills and their recommended job roles, identify ALL skill gaps - skills they need but don't currently have.

Return ONLY a valid JSON array with this exact structure (no markdown, no code fences, no extra text):
[
  {
    "skill": "Skill Name",
    "importance": "Critical",
    "category": "Technical",
    "learningDifficulty": "Medium",
    "estimatedTimeToLearn": "2-3 months",
    "resources": ["Resource 1", "Resource 2"]
  }
]

Rules:
- importance: Must be exactly one of "Critical", "Important", "Nice to Have"
  - Critical: Skill is essential for most recommended roles
  - Important: Skill is needed for some roles or would significantly boost employability
  - Nice to Have: Skill would be beneficial but isn't required
- category: Group the skill into a category like "Programming Languages", "Cloud & DevOps", "Data & Analytics", "Soft Skills", "Frameworks & Libraries", "Databases", "Design", "Project Management", etc.
- learningDifficulty: Must be exactly one of "Easy", "Medium", "Hard"
  - Easy: Can learn in days to a few weeks
  - Medium: Can learn in 1-3 months
  - Hard: Takes 3+ months of dedicated study
- estimatedTimeToLearn: Human-readable time estimate like "2-3 weeks", "1-2 months", "3-6 months"
- resources: 2-4 specific learning resources (course names, platforms, books, documentation links)
- Identify 8-15 skill gaps covering both technical and soft skills
- Sort by importance: Critical first, then Important, then Nice to Have
- Do NOT include skills the candidate already has`;

  const userContext = JSON.stringify({
    currentSkills: profile.skills,
    education: profile.education.map((e) => e.degree),
    experience: profile.experience.map((e) => `${e.title}: ${e.description}`),
    recommendedRoles: jobRoles.map((r) => ({
      role: r.role,
      matchScore: r.matchScore,
      requiredSkills: r.requiredSkills,
      matchedSkills: r.matchedSkills,
    })),
  });

  const responseText = await callGROQ([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Analyze the skill gaps for this candidate based on their profile and recommended job roles:\n\n${userContext}`,
    },
  ]);

  if (!responseText) {
    throw new Error('No response from LLM for skill gap analysis');
  }

  const cleanedJson = cleanJsonResponse(responseText);

  try {
    const parsed = JSON.parse(cleanedJson);
    const gapsArray = Array.isArray(parsed) ? parsed : parsed.skillGaps || parsed.gaps || [];

    if (!Array.isArray(gapsArray) || gapsArray.length === 0) {
      throw new Error('No skill gaps found in response');
    }

    return gapsArray.map((item: Record<string, unknown>) => ({
      skill: String(item.skill || 'Unknown Skill'),
      importance: ['Critical', 'Important', 'Nice to Have'].includes(item.importance as string)
        ? (item.importance as 'Critical' | 'Important' | 'Nice to Have')
        : 'Important',
      category: String(item.category || 'General'),
      learningDifficulty: ['Easy', 'Medium', 'Hard'].includes(item.learningDifficulty as string)
        ? (item.learningDifficulty as 'Easy' | 'Medium' | 'Hard')
        : 'Medium',
      estimatedTimeToLearn: String(item.estimatedTimeToLearn || 'Unknown'),
      resources: Array.isArray(item.resources) ? item.resources.map(String).slice(0, 4) : [],
    }));
  } catch (parseError) {
    console.error('Failed to parse skill gap analysis:', parseError);
    console.error('Raw response:', responseText);

    // Return a minimal fallback based on required skills from job roles
    const allRequiredSkills = jobRoles.flatMap((r) => r.requiredSkills);
    const currentSkillsLower = profile.skills.map((s) => s.toLowerCase());
    const missingSkills = [...new Set(allRequiredSkills)]
      .filter((s) => !currentSkillsLower.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs)))
      .slice(0, 8);

    return missingSkills.map((skill) => ({
      skill,
      importance: 'Important' as const,
      category: 'Technical',
      learningDifficulty: 'Medium' as const,
      estimatedTimeToLearn: '1-3 months',
      resources: ['Online courses', 'Documentation'],
    }));
  }
}
