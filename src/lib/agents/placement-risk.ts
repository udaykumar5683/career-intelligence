import type { ResumeProfile, JobRoleRecommendation, SkillGap, PlacementRisk } from '@/types/analysis';

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
    console.error('[placement-risk] GROQ API error:', response.status, errorText);
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
 * Uses LLM to predict placement risk based on the candidate's profile,
 * recommended job roles, and identified skill gaps.
 */
export async function predictPlacementRisk(
  profile: ResumeProfile,
  jobRoles: JobRoleRecommendation[],
  skillGaps: SkillGap[]
): Promise<PlacementRisk> {
  const systemPrompt = `You are an expert career placement risk analyst. Given a candidate's profile, recommended job roles, and identified skill gaps, predict their placement risk and probability of securing a job.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no extra text):
{
  "overallRisk": "Medium",
  "overallScore": 65,
  "withinThreeMonths": 25,
  "withinSixMonths": 55,
  "withinTwelveMonths": 80,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "explanation": "Detailed 3-5 sentence explanation of the placement risk assessment"
}

Rules:
- overallRisk: Must be exactly one of "Low", "Medium", "High"
  - Low: Strong match for multiple roles, few critical skill gaps, high market demand
  - Medium: Decent match with some skill gaps, moderate market demand
  - High: Significant skill gaps, low match scores, or declining market demand
- overallScore: 0-100 integer representing overall employability
  - 80-100: Excellent placement prospects
  - 60-79: Good prospects with some effort needed
  - 40-59: Moderate prospects, significant improvement needed
  - 0-39: Challenging placement prospects
- withinThreeMonths: 0-100 integer representing probability of getting placed within 3 months
- withinSixMonths: 0-100 integer representing probability of getting placed within 6 months
- withinTwelveMonths: 0-100 integer representing probability of getting placed within 12 months
- Probabilities should increase with time (3mo <= 6mo <= 12mo)
- strengths: 3-5 specific strengths from the candidate's profile
- weaknesses: 3-5 specific areas of concern
- explanation: Comprehensive assessment considering skills, experience, market conditions, and skill gaps`;

  const analysisContext = JSON.stringify({
    profile: {
      name: profile.name,
      skillsCount: profile.skills.length,
      skills: profile.skills,
      experienceCount: profile.experience.length,
      experience: profile.experience.map((e) => `${e.title} at ${e.company} (${e.duration})`),
      education: profile.education.map((e) => `${e.degree} from ${e.institution}`),
      certifications: profile.certifications,
      languages: profile.languages,
    },
    jobRoles: jobRoles.map((r) => ({
      role: r.role,
      matchScore: r.matchScore,
      growthPotential: r.growthPotential,
      matchedSkillsCount: r.matchedSkills.length,
      requiredSkillsCount: r.requiredSkills.length,
    })),
    skillGaps: {
      total: skillGaps.length,
      critical: skillGaps.filter((g) => g.importance === 'Critical').length,
      important: skillGaps.filter((g) => g.importance === 'Important').length,
      niceToHave: skillGaps.filter((g) => g.importance === 'Nice to Have').length,
      details: skillGaps.map((g) => ({
        skill: g.skill,
        importance: g.importance,
        difficulty: g.learningDifficulty,
        timeToLearn: g.estimatedTimeToLearn,
      })),
    },
  });

  const responseText = await callGROQ([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Predict the placement risk for this candidate:\n\n${analysisContext}`,
    },
  ]);

  if (!responseText) {
    throw new Error('No response from LLM for placement risk prediction');
  }

  const cleanedJson = cleanJsonResponse(responseText);

  try {
    const parsed = JSON.parse(cleanedJson);

    // Validate and constrain values
    const overallScore = typeof parsed.overallScore === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.overallScore)))
      : 50;

    const withinThreeMonths = typeof parsed.withinThreeMonths === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.withinThreeMonths)))
      : 20;

    const withinSixMonths = typeof parsed.withinSixMonths === 'number'
      ? Math.min(100, Math.max(withinThreeMonths, Math.round(parsed.withinSixMonths)))
      : 50;

    const withinTwelveMonths = typeof parsed.withinTwelveMonths === 'number'
      ? Math.min(100, Math.max(withinSixMonths, Math.round(parsed.withinTwelveMonths)))
      : 75;

    // Determine overallRisk from score if not valid
    const overallRisk: 'Low' | 'Medium' | 'High' = ['Low', 'Medium', 'High'].includes(parsed.overallRisk)
      ? parsed.overallRisk
      : overallScore >= 70 ? 'Low' : overallScore >= 40 ? 'Medium' : 'High';

    return {
      overallRisk,
      overallScore,
      withinThreeMonths,
      withinSixMonths,
      withinTwelveMonths,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 5) : ['Profile available for analysis'],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String).slice(0, 5) : ['Insufficient data for detailed analysis'],
      explanation: String(parsed.explanation || 'Placement risk assessment based on available profile data and market analysis.'),
    };
  } catch (parseError) {
    console.error('Failed to parse placement risk prediction:', parseError);
    console.error('Raw response:', responseText);

    // Compute a fallback based on available data
    const avgMatchScore = jobRoles.length > 0
      ? jobRoles.reduce((sum, r) => sum + r.matchScore, 0) / jobRoles.length
      : 50;
    const criticalGaps = skillGaps.filter((g) => g.importance === 'Critical').length;
    const overallScore = Math.max(10, Math.min(90, Math.round(avgMatchScore - criticalGaps * 5)));

    return {
      overallRisk: overallScore >= 70 ? 'Low' : overallScore >= 40 ? 'Medium' : 'High',
      overallScore,
      withinThreeMonths: Math.max(5, overallScore - 30),
      withinSixMonths: Math.max(15, overallScore - 10),
      withinTwelveMonths: Math.min(95, overallScore + 15),
      strengths: profile.skills.slice(0, 4).map((s) => `Strong skill: ${s}`),
      weaknesses: skillGaps.slice(0, 3).map((g) => `Missing: ${g.skill} (${g.importance})`),
      explanation: 'Automated assessment based on match scores and skill gap analysis. A detailed explanation could not be generated.',
    };
  }
}
