import type { MarketResearchResult } from '@/types/analysis';

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
    console.error('[market-researcher] GROQ API error:', response.status, errorText);
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
 * Uses GROQ LLM to research job market trends for recommended roles.
 */
export async function researchMarket(
  jobRoleNames: string[]
): Promise<MarketResearchResult[]> {
  const roleList = jobRoleNames.map((r) => `- ${r}`).join('\n');

  const systemPrompt = `You are a job market research analyst. Based on your knowledge of current job market trends, provide structured market research results for the given roles.

Return ONLY a valid JSON array with this exact structure (no markdown, no code fences, no extra text):
[
  {
    "role": "Job Role Title",
    "demandLevel": "High",
    "hiringCompanies": ["Company1", "Company2", "Company3"],
    "averageOpenings": "Approximate number or range like '10,000+' or '5,000-8,000'",
    "trend": "Growing",
    "topLocations": ["City1", "City2", "City3"],
    "keyInsight": "A concise, valuable insight about this role's market outlook"
  }
]

Rules:
- demandLevel: Must be exactly one of "Very High", "High", "Medium", "Low"
- hiringCompanies: List 3-6 well-known companies that typically hire for this role
- averageOpenings: String with approximate number of open positions
- trend: Must be exactly one of "Growing", "Stable", "Declining"
- topLocations: List 3-5 geographic locations with highest demand
- keyInsight: 1-2 sentence actionable insight about market outlook
- Provide one result per role`;

  try {
    const responseText = await callGROQ([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Provide market research for the following roles based on your knowledge:\n\n${roleList}` },
    ]);

    const cleanedJson = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedJson);
    const resultsArray = Array.isArray(parsed) ? parsed : parsed.results || parsed.marketResearch || [];

    if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
      throw new Error('No market research results found in LLM response');
    }

    return resultsArray.map((item: Record<string, unknown>) => ({
      role: String(item.role || 'Unknown Role'),
      demandLevel: ['Very High', 'High', 'Medium', 'Low'].includes(item.demandLevel as string)
        ? (item.demandLevel as 'Very High' | 'High' | 'Medium' | 'Low')
        : 'Medium',
      hiringCompanies: Array.isArray(item.hiringCompanies) ? item.hiringCompanies.map(String).slice(0, 6) : [],
      averageOpenings: String(item.averageOpenings || 'N/A'),
      trend: ['Growing', 'Stable', 'Declining'].includes(item.trend as string)
        ? (item.trend as 'Growing' | 'Stable' | 'Declining')
        : 'Stable',
      topLocations: Array.isArray(item.topLocations) ? item.topLocations.map(String).slice(0, 5) : [],
      keyInsight: String(item.keyInsight || 'No insight available'),
    }));
  } catch (error) {
    console.error('[market-researcher] Failed to research market:', error);
    return jobRoleNames.map((role) => ({
      role,
      demandLevel: 'Medium' as const,
      hiringCompanies: ['Google', 'Microsoft', 'Amazon'],
      averageOpenings: '5,000+',
      trend: 'Growing' as const,
      topLocations: ['San Francisco', 'New York', 'Seattle'],
      keyInsight: 'Market research data could not be retrieved. This role generally has steady demand in the tech industry.',
    }));
  }
}
