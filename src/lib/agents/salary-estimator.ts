import type { ResumeProfile, JobRoleRecommendation, SalaryEstimate } from '@/types/analysis';

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
    console.error('[salary-estimator] GROQ API error:', response.status, errorText);
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
 * Uses GROQ LLM to estimate salary ranges for recommended job roles.
 */
export async function estimateSalaries(
  profile: ResumeProfile,
  jobRoles: JobRoleRecommendation[]
): Promise<SalaryEstimate[]> {
  const roleList = jobRoles.map((r) => `- ${r.role} (match score: ${r.matchScore}%)`).join('\n');

  const systemPrompt = `You are a compensation and salary analyst. Estimate realistic salary ranges for the given job roles based on your knowledge of current market rates.

Return ONLY a valid JSON array with this exact structure (no markdown, no code fences, no extra text):
[
  {
    "role": "Job Role Title",
    "entryLevel": { "min": 45000, "max": 65000, "median": 55000 },
    "midLevel": { "min": 70000, "max": 100000, "median": 85000 },
    "seniorLevel": { "min": 110000, "max": 160000, "median": 135000 },
    "currency": "USD",
    "confidenceLevel": "Low",
    "factors": ["Factor 1", "Factor 2", "Factor 3"]
  }
]

Rules:
- Salary values must be annual, in whole numbers (no decimals)
- min < median < max for each level
- entryLevel ranges should be lower than midLevel, which should be lower than seniorLevel
- currency: Use appropriate currency code (USD, EUR, GBP, INR, etc.) based on location
- confidenceLevel: Must be exactly one of "High", "Medium", "Low"
- factors: 3-5 factors that influence salary for this role
- If the candidate's location is mentioned, adjust salary ranges accordingly`;

  try {
    const responseText = await callGROQ([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Estimate salary ranges for the following roles based on your knowledge:\n\n${roleList}\n\nCandidate Location: ${profile.location || 'Not specified'}`,
      },
    ]);

    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);
    const salaryArray = Array.isArray(parsed) ? parsed : parsed.salaries || parsed.salaryEstimates || [];

    if (!Array.isArray(salaryArray) || salaryArray.length === 0) {
      throw new Error('No salary estimates found in LLM response');
    }

    return salaryArray.map((item: Record<string, unknown>) => {
      const parseRange = (range: unknown): { min: number; max: number; median: number } => {
        if (typeof range === 'object' && range !== null) {
          const r = range as Record<string, unknown>;
          return {
            min: typeof r.min === 'number' ? Math.round(r.min) : 40000,
            max: typeof r.max === 'number' ? Math.round(r.max) : 80000,
            median: typeof r.median === 'number' ? Math.round(r.median) : 60000,
          };
        }
        return { min: 40000, max: 80000, median: 60000 };
      };

      return {
        role: String(item.role || 'Unknown Role'),
        entryLevel: parseRange(item.entryLevel),
        midLevel: parseRange(item.midLevel),
        seniorLevel: parseRange(item.seniorLevel),
        currency: String(item.currency || 'USD'),
        confidenceLevel: ['High', 'Medium', 'Low'].includes(item.confidenceLevel as string)
          ? (item.confidenceLevel as 'High' | 'Medium' | 'Low')
          : 'Low',
        factors: Array.isArray(item.factors) ? item.factors.map(String).slice(0, 5) : ['Estimate without live market data'],
      };
    });
  } catch (error) {
    console.error('[salary-estimator] Failed to estimate salaries:', error);
    return jobRoles.map((role) => ({
      role: role.role,
      entryLevel: { min: 40000, max: 65000, median: 52000 },
      midLevel: { min: 65000, max: 100000, median: 82000 },
      seniorLevel: { min: 100000, max: 160000, median: 130000 },
      currency: 'USD',
      confidenceLevel: 'Low' as const,
      factors: ['Estimate based on general market data', 'Location not specified', 'Experience level varies'],
    }));
  }
}
