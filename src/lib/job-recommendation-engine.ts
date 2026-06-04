import { AnalysisResults } from '@/types/analysis';
import { Job, JobRecommendationResponse } from '@/types/job';
import { AdzunaService } from './adzuna-service';

export class JobRecommendationEngine {
  static async getRecommendations(
    analysisResults: AnalysisResults,
    page: number = 1
  ): Promise<JobRecommendationResponse> {
    const { profile, jobRoles } = analysisResults;
    console.log('[JobRecommendationEngine] Starting recommendation process for:', profile.name);
    
    let rawJobs: Job[] = [];
    let count = 0;
    let searchAttempts = 0;

    const searchStrategies = [
      // Strategy 1: Top 1 role only (simple and focused)
      () => jobRoles[0]?.role || 'Software Developer',
      // Strategy 2: Top 2 roles only
      () => jobRoles.slice(0, 2).map(r => r.role).join(' OR '),
      // Strategy 3: Top 3 skills only
      () => profile.skills.slice(0, 3).join(' OR '),
      // Strategy 4: Broader IT/Software search as last resort
      () => 'Software Developer'
    ];

    while (searchAttempts < searchStrategies.length && rawJobs.length === 0) {
      try {
        const currentQuery = searchStrategies[searchAttempts]();
        console.log(`[JobRecommendationEngine] Search attempt ${searchAttempts + 1} with query: "${currentQuery}"`);

        const result = await AdzunaService.searchJobs(currentQuery, {
          page,
          results_per_page: 15,
          sort_by: 'relevance'
        });

        rawJobs = result.results;
        count = result.count;

        console.log(`[JobRecommendationEngine] Search attempt ${searchAttempts + 1} returned ${rawJobs.length} jobs (total: ${count})`);
      } catch (err) {
        console.error(`[JobRecommendationEngine] Search attempt ${searchAttempts + 1} failed:`, err);
      }

      searchAttempts++;
    }

    // 3. Score and refine jobs
    const userSkills = new Set(profile.skills.map(s => s.toLowerCase()));
    const jobsWithScores = rawJobs.map(job => {
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      const matchingSkills = profile.skills.filter(skill => 
        jobText.includes(skill.toLowerCase())
      );
      
      const missingSkills = jobRoles[0]?.requiredSkills.filter(skill => 
        !userSkills.has(skill.toLowerCase()) && jobText.includes(skill.toLowerCase())
      ) || [];

      // Calculate a basic match score
      const matchScore = Math.min(
        100,
        Math.round((matchingSkills.length / Math.max(1, matchingSkills.length + missingSkills.length)) * 100)
      );

      return {
        ...job,
        matchScore: matchScore || 50, // Default 50 if we can't calculate
        matchingSkills,
        missingSkills: Array.from(new Set(missingSkills)).slice(0, 5),
      };
    });

    // 4. Calculate market insights
    const skillDemand = this.calculateSkillDemand(rawJobs, profile.skills);
    const averageSalary = this.calculateAverageSalary(rawJobs);

    return {
      jobs: jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)),
      total: count,
      marketInsights: {
        topSkills: skillDemand.slice(0, 5).map(s => s.skill),
        skillDemand: skillDemand.slice(0, 10),
        averageSalary,
        salaryGrowthPotential: averageSalary > 1000000 ? 'High' : 'Moderate',
      }
    };
  }

  private static calculateSkillDemand(jobs: Job[], userSkills: string[]) {
    const counts: Record<string, number> = {};
    const commonTech = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'Java', 'TypeScript', 'Cloud'];
    
    jobs.forEach(job => {
      const text = `${job.title} ${job.description}`.toLowerCase();
      [...userSkills, ...commonTech].forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
          counts[skill] = (counts[skill] || 0) + 1;
        }
      });
    });

    // If no common skills found, use default values
    if (Object.keys(counts).length === 0) {
      return commonTech.slice(0, 10).map((skill, idx) => ({
        skill,
        count: 5 - idx,
        percentage: 20 + (10 - idx) * 8
      }));
    }

    return Object.entries(counts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / Math.max(1, jobs.length)) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateAverageSalary(jobs: Job[]): number {
    const salaries = jobs
      .map(j => (j.salary.min && j.salary.max ? (j.salary.min + j.salary.max) / 2 : j.salary.min || j.salary.max))
      .filter((s): s is number => !!s);
    
    if (salaries.length === 0) return 500000; // Fallback to a reasonable default
    return Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
  }
}
