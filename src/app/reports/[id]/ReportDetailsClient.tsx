'use client';

import { ResultsDashboard } from '@/components/career/results-dashboard';
import { useRouter } from 'next/navigation';
import type { AnalysisResults } from '@/types/analysis';

interface ReportDetailsClientProps {
  results: AnalysisResults;
}

export default function ReportDetailsClient({ results }: ReportDetailsClientProps) {
  const router = useRouter();

  const handleReset = () => {
    // In the details view, "New Analysis" or "Reset" should probably take the user 
    // back to the home page to upload a new resume.
    router.push('/');
  };

  return <ResultsDashboard results={results} onReset={handleReset} />;
}
