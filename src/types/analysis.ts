// ============================================
// AI Placement Risk & Career Intelligence Platform
// Type Definitions
// ============================================

export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  certifications: string[];
  languages: string[];
  projects: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface JobRoleRecommendation {
  role: string;
  matchScore: number; // 0-100
  reason: string;
  requiredSkills: string[];
  matchedSkills: string[];
  growthPotential: 'High' | 'Medium' | 'Low';
}

export interface MarketResearchResult {
  role: string;
  demandLevel: 'Very High' | 'High' | 'Medium' | 'Low';
  hiringCompanies: string[];
  averageOpenings: string;
  trend: 'Growing' | 'Stable' | 'Declining';
  topLocations: string[];
  keyInsight: string;
}

export interface SkillGap {
  skill: string;
  importance: 'Critical' | 'Important' | 'Nice to Have';
  category: string;
  learningDifficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTimeToLearn: string;
  resources: string[];
}

export interface PlacementRisk {
  overallRisk: 'Low' | 'Medium' | 'High';
  overallScore: number; // 0-100
  withinThreeMonths: number; // percentage
  withinSixMonths: number; // percentage
  withinTwelveMonths: number; // percentage;
  strengths: string[];
  weaknesses: string[];
  explanation: string;
}

export interface SalaryEstimate {
  role: string;
  entryLevel: SalaryRange;
  midLevel: SalaryRange;
  seniorLevel: SalaryRange;
  currency: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  factors: string[];
}

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
}

export interface RoadmapStep {
  phase: number;
  title: string;
  duration: string;
  tasks: string[];
  milestone: string;
  priority: 'Critical' | 'High' | 'Medium';
}

export interface AnalysisResults {
  id?: string;
  profile: ResumeProfile;
  jobRoles: JobRoleRecommendation[];
  marketResearch: MarketResearchResult[];
  skillGaps: SkillGap[];
  placementRisk: PlacementRisk;
  salaryEstimates: SalaryEstimate[];
  roadmap: RoadmapStep[];
}

export type AnalysisStage = 
  | 'idle'
  | 'uploading'
  | 'ocr'
  | 'parsing'
  | 'analyzing-roles'
  | 'researching-market'
  | 'analyzing-skills'
  | 'predicting-risk'
  | 'estimating-salary'
  | 'building-roadmap'
  | 'complete'
  | 'error';

export interface AnalysisProgress {
  stage: AnalysisStage;
  message: string;
  progress: number; // 0-100
}

export const STAGE_CONFIG: Record<AnalysisStage, { label: string; icon: string; description: string }> = {
  idle: { label: 'Ready', icon: '📋', description: 'Upload your resume to begin' },
  uploading: { label: 'Uploading', icon: '📤', description: 'Sending your resume...' },
  ocr: { label: 'OCR Scanning', icon: '📷', description: 'Scanning image for text...' },
  parsing: { label: 'Resume Parser', icon: '🔍', description: 'Extracting skills, education & experience' },
  'analyzing-roles': { label: 'Job Role Analyzer', icon: '🎯', description: 'Finding best-fit job roles' },
  'researching-market': { label: 'Market Researcher', icon: '📊', description: 'Analyzing job market trends' },
  'analyzing-skills': { label: 'Skill Gap Analyzer', icon: '📐', description: 'Identifying missing skills' },
  'predicting-risk': { label: 'Risk Predictor', icon: '⚠️', description: 'Calculating placement probability' },
  'estimating-salary': { label: 'Salary Estimator', icon: '💰', description: 'Estimating salary ranges' },
  'building-roadmap': { label: 'Career Roadmap', icon: '🗺️', description: 'Building improvement plan' },
  complete: { label: 'Complete', icon: '✅', description: 'Analysis complete!' },
  error: { label: 'Error', icon: '❌', description: 'Something went wrong' },
};
