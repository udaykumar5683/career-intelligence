import { AdzunaJob, Job, JobSearchFilters } from '@/types/job';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

export class AdzunaService {
  private static async fetchAdzuna<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    console.log('[AdzunaService] Fetching from endpoint:', endpoint, 'with params:', params);
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      throw new Error('Adzuna API credentials are not configured');
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.append('app_id', ADZUNA_APP_ID);
    url.searchParams.append('app_key', ADZUNA_APP_KEY);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    console.log('[AdzunaService] Calling URL:', url.toString());

    const response = await fetch(url.toString());
    console.log('[AdzunaService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Adzuna API error [${response.status}]:`, errorText);
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[AdzunaService] Response data keys:', Object.keys(data));
    if ('results' in data && Array.isArray(data.results)) {
      console.log(`[AdzunaService] Found ${data.results.length} results`);
    }
    return data as T;
  }

  static async searchJobs(
    query: string,
    filters: JobSearchFilters = {},
    country: string = 'in'
  ): Promise<{ results: Job[]; count: number }> {
    const page = filters.page || 1;
    const endpoint = `${country}/search/${page}`;
    
    const params: Record<string, any> = {
      what: query,
      where: filters.location,
      distance: filters.distance,
      category: filters.category,
      salary_min: filters.salaryMin,
      results_per_page: filters.results_per_page || 10,
      sort_by: filters.sort_by || 'relevance',
    };

    if (filters.fullTime) params.full_time = 1;
    if (filters.permanent) params.permanent = 1;
    if (filters.contract) params.contract = 1;

    const data = await this.fetchAdzuna<{ results: AdzunaJob[]; count: number }>(endpoint, params);

    return {
      results: data.results.map(job => this.mapToJob(job)),
      count: data.count,
    };
  }

  private static mapToJob(adzunaJob: AdzunaJob): Job {
    const isRemote = 
      adzunaJob.title.toLowerCase().includes('remote') || 
      adzunaJob.description.toLowerCase().includes('remote') ||
      adzunaJob.location.display_name.toLowerCase().includes('remote');

    return {
      id: adzunaJob.id,
      title: adzunaJob.title.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML tags
      company: adzunaJob.company.display_name,
      location: adzunaJob.location.display_name,
      salary: {
        min: adzunaJob.salary_min,
        max: adzunaJob.salary_max,
        formatted: this.formatSalary(adzunaJob.salary_min, adzunaJob.salary_max),
        isPredicted: adzunaJob.salary_is_predicted === '1',
      },
      description: adzunaJob.description.replace(/<\/?[^>]+(>|$)/g, ""),
      url: adzunaJob.redirect_url,
      postedDate: adzunaJob.created,
      isRemote,
      category: adzunaJob.category.label,
      type: adzunaJob.contract_time === 'full_time' ? 'Full-time' : 'Part-time',
    };
  }

  private static formatSalary(min?: number, max?: number): string {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) {
      if (min === max) return `₹${min.toLocaleString()}`;
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    }
    if (min) return `From ₹${min.toLocaleString()}`;
    return `Up to ₹${max!.toLocaleString()}`;
  }
}
