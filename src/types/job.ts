export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  description: string;
  redirect_url: string;
  created: string;
  category: {
    label: string;
    tag: string;
  };
  contract_type?: string;
  contract_time?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min?: number;
    max?: number;
    formatted: string;
    isPredicted: boolean;
  };
  description: string;
  url: string;
  postedDate: string;
  type?: string; // Full-time, Part-time, etc.
  isRemote: boolean;
  category: string;
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
}

export interface JobSearchFilters {
  location?: string;
  distance?: number;
  category?: string;
  salaryMin?: number;
  fullTime?: boolean;
  permanent?: boolean;
  contract?: boolean;
  results_per_page?: number;
  page?: number;
  sort_by?: 'relevance' | 'date' | 'salary';
}

export interface JobRecommendationResponse {
  jobs: Job[];
  total: number;
  marketInsights: {
    topSkills: string[];
    skillDemand: Array<{ skill: string; count: number; percentage: number }>;
    averageSalary: number;
    salaryGrowthPotential: string;
  };
}
