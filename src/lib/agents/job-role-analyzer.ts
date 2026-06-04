import type { ResumeProfile, JobRoleRecommendation } from '@/types/analysis';

/**
 * Helper function to call GROQ API
 */
async function callGROQ(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
  console.log('8. Final prompt sent to GROQ (job role analyzer):', JSON.stringify(messages, null, 2));
  
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
    console.error('[job-role-analyzer] GROQ API error:', response.status, errorText);
    throw new Error(`GROQ API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response content from GROQ');
  }

  console.log('9. GROQ response (job role analyzer):', content);
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
 * Uses LLM to analyze a resume profile and recommend best-fit job roles
 * with match scores, reasons, required/matched skills, and growth potential.
 */
export async function analyzeJobRoles(
  profile: ResumeProfile
): Promise<JobRoleRecommendation[]> {
  const systemPrompt = `You are an expert career advisor and job market analyst. Given a candidate's resume profile, you recommend the best-fit job roles based on their skills, education, experience, and overall background.

You must return ONLY a valid JSON array with 4-5 job role recommendations. Do NOT include any markdown, code fences, or text outside the JSON.

Each recommendation must follow this exact structure:
{
  "role": "Job Role Title",
  "matchScore": 85,
  "reason": "Detailed explanation of why this role is a good fit",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "matchedSkills": ["skill from resume that matches"],
  "growthPotential": "High"
}

Rules:
- matchScore: 0-100 integer representing how well the candidate fits the role
- requiredSkills: Skills typically required for this role in the industry
- matchedSkills: Skills from the candidate's resume that align with the required skills (subset of requiredSkills)
- growthPotential: Must be exactly one of "High", "Medium", or "Low"
- Sort recommendations by matchScore descending (best match first)
- Provide diverse roles across different career paths where applicable
- Be realistic about match scores - not everything should be 90+
- The reason should be 2-3 sentences explaining the fit`;

  const userProfile = JSON.stringify({
    name: profile.name,
    summary: profile.summary,
    skills: profile.skills,
    education: profile.education.map((e) => `${e.degree} from ${e.institution} (${e.year})`),
    experience: profile.experience.map(
      (e) => `${e.title} at ${e.company} (${e.duration}): ${e.description}`
    ),
    certifications: profile.certifications,
    languages: profile.languages,
    projects: profile.projects,
  });

  const responseText = await callGROQ([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Analyze this candidate profile and recommend 4-5 best-fit job roles:\n\n${userProfile}` },
  ]);

  if (!responseText) {
    throw new Error('No response from LLM for job role analysis');
  }

  const cleanedJson = cleanJsonResponse(responseText);

  try {
    const parsed = JSON.parse(cleanedJson);

    // Handle both array and object-with-array responses
    const rolesArray = Array.isArray(parsed) ? parsed : parsed.roles || parsed.recommendations || [];

    if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
      throw new Error('No role recommendations found in response');
    }

    return rolesArray.map((role: Record<string, unknown>) => ({
      role: String(role.role || 'Unknown Role'),
      matchScore: typeof role.matchScore === 'number' ? Math.min(100, Math.max(0, Math.round(role.matchScore))) : 50,
      reason: String(role.reason || 'No reason provided'),
      requiredSkills: Array.isArray(role.requiredSkills) ? role.requiredSkills.map(String) : [],
      matchedSkills: Array.isArray(role.matchedSkills) ? role.matchedSkills.map(String) : [],
      growthPotential: ['High', 'Medium', 'Low'].includes(role.growthPotential as string)
        ? (role.growthPotential as 'High' | 'Medium' | 'Low')
        : 'Medium',
    }));
  } catch (parseError) {
    console.error('Failed to parse job role analysis:', parseError);
    console.error('Raw response:', responseText);

    // Return fallback recommendations
    return [
      {
        role: 'General Software Developer',
        matchScore: 50,
        reason: 'Based on the available information from your resume, a general software development role may be suitable. More specific recommendations require additional skill details.',
        requiredSkills: ['Programming', 'Problem Solving', 'Communication'],
        matchedSkills: profile.skills.slice(0, 3),
        growthPotential: 'Medium',
      },
    ];
  }
}
