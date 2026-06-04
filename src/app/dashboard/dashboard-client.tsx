'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/providers/auth-provider';
import { ResultsDashboard } from '@/components/career/results-dashboard';
import { ResumeUpload } from '@/components/career/resume-upload';
import { AnalysisProgress } from '@/components/career/analysis-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  PlusCircle, 
  Loader2, 
  Briefcase, 
  TrendingUp, 
  Award, 
  Clock,
  ChevronRight,
  FileText,
  Search,
  CheckCircle2,
  Circle,
  Zap
} from 'lucide-react';
import type { AnalysisResults, AnalysisStage } from '@/types/analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { SkillTracker } from '@/components/dashboard/skill-tracker';
import { Navbar } from '@/components/layout/navbar';

export default function DashboardClient() {
  const { user, loading: authLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [appState, setAppState] = useState<'dashboard' | 'analyzing' | 'history'>('dashboard');
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const checkAndRedirect = async () => {
        try {
          const res = await fetch('/api/dashboard/latest');
          if (res.ok) {
            const json = await res.json();
            if (json.hasAnalysis && json.report?.id) {
              router.push(`/reports/${json.report.id}`);
              return;
            }
          }
          fetchDashboardData();
          fetchHistory();
        } catch (error) {
          console.error('Failed to check latest report:', error);
          fetchDashboardData();
          fetchHistory();
        }
      };
      checkAndRedirect();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/latest');
      if (!res.ok) {
        if (res.status === 404) {
          console.warn('No dashboard data found (404)');
          setData(null);
          setResults(null);
        } else {
          throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        }
      } else {
        const json = await res.json();
        if (json.hasAnalysis) {
          setData(json);
          setResults({ ...json.report.analysisResult, id: json.report.id });
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setData(null);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) {
        if (res.status === 404) {
          setHistory([]);
        } else {
          throw new Error(`Failed to fetch history: ${res.status}`);
        }
      } else {
        const json = await res.json();
        setHistory(json.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistory([]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setAppState('analyzing');
    setAnalysisStage('uploading');
    setAnalysisProgress(5);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'progress') {
                setAnalysisStage(parsed.stage);
                setAnalysisProgress(parsed.progress);
              } else if (parsed.type === 'complete') {
                setResults(parsed.results);
                setAnalysisStage('complete');
                setAnalysisProgress(100);
                setTimeout(() => {
                  if (parsed.results.id) {
                    router.push(`/reports/${parsed.results.id}`);
                  } else {
                    setAppState('dashboard');
                    fetchDashboardData();
                    fetchHistory();
                  }
                }, 1500);
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAppState('dashboard');
    }
  };

  const calculateGrowthScore = () => {
    if (!data?.skillProgress || !results?.skillGaps) return 'B';
    const completed = data.skillProgress.filter((p: any) => p.status === 'completed').length;
    const total = results.skillGaps.length;
    const ratio = completed / (total || 1);
    
    if (ratio > 0.8) return 'A+';
    if (ratio > 0.6) return 'A';
    if (ratio > 0.4) return 'B+';
    if (ratio > 0.2) return 'B';
    return 'C';
  };

  if (authLoading || (loading && !data)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Career Intelligence Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={appState === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setAppState('dashboard')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Button>
            <Button 
              variant={appState === 'history' ? 'default' : 'outline'}
              onClick={() => setAppState('history')}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button 
              variant="outline"
              onClick={() => setAppState('analyzing')}
              className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <PlusCircle className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {appState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {analysisStage === 'idle' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Your Career Profile</CardTitle>
                    <CardDescription>Upload a new resume to refresh your career intelligence data.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeUpload onFileSelect={handleFileSelect} isAnalyzing={false} />
                  </CardContent>
                </Card>
              ) : (
                <AnalysisProgress 
                  stage={analysisStage} 
                  progress={analysisProgress} 
                  onCancel={() => setAppState('dashboard')}
                />
              )}
            </motion.div>
          )}

          {appState === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {!data?.hasAnalysis ? (
                <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-teal-50 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-teal-600" />
                  </div>
                  <CardTitle className="mb-2">No Analysis Found</CardTitle>
                  <CardDescription className="max-w-sm mb-6">
                    You haven't analyzed a resume yet. Start your career intelligence journey by uploading your first resume.
                  </CardDescription>
                  <Button onClick={() => setAppState('analyzing')} className="bg-teal-600 hover:bg-teal-700">
                    Upload Resume
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="overflow-hidden border-l-4 border-l-teal-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Resume Score</p>
                            <h3 className="text-2xl font-bold">{results?.placementRisk.overallScore}%</h3>
                          </div>
                          <div className="bg-teal-50 p-2 rounded-lg">
                            <Award className="h-5 w-5 text-teal-600" />
                          </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${results?.placementRisk.overallScore}%` }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Skill Match</p>
                            <h3 className="text-2xl font-bold">{Math.max(...(results?.jobRoles.map(r => r.matchScore) || [0]))}%</h3>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${Math.max(...(results?.jobRoles.map(r => r.matchScore) || [0]))}%` }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-l-4 border-l-amber-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Job Matches</p>
                            <h3 className="text-2xl font-bold">{results?.jobRoles.length || 0} Roles</h3>
                          </div>
                          <div className="bg-amber-50 p-2 rounded-lg">
                            <Briefcase className="h-5 w-5 text-amber-600" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(data.report.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Growth Score</p>
                            <h3 className="text-2xl font-bold">{calculateGrowthScore()}</h3>
                          </div>
                          <div className="bg-purple-50 p-2 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Based on current roadmap progress</p>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Learning Streak</p>
                            <h3 className="text-2xl font-bold">{data?.streak || 0} Days</h3>
                          </div>
                          <div className="bg-orange-50 p-2 rounded-lg">
                            <Zap className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Keep it up! Consistency is key.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <ResultsDashboard results={results!} onReset={() => setAppState('analyzing')} />
                  
                  <DashboardCharts results={results!} />
                  
                  <SkillTracker 
                    skillGaps={results!.skillGaps} 
                    initialProgress={data.skillProgress} 
                  />
                </>
              )}
            </motion.div>
          )}

          {appState === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>View and compare your previous career analysis reports.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No previous reports found.
                      </div>
                    ) : (
                      history.map((report) => (
                        <div 
                          key={report.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                            viewingId === report.id ? 'opacity-50 pointer-events-none bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                          }`}
                          onClick={() => {
                            if (viewingId) return;
                            setViewingId(report.id);
                            // Simulate a small delay for smoother transition
                            setTimeout(() => {
                              setResults({ ...report.analysisResult, id: report.id });
                              setData({ ...data, report, hasAnalysis: true });
                              setAppState('dashboard');
                              setViewingId(null);
                            }, 300);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-slate-100 group-hover:bg-teal-100 p-2 rounded-lg transition-colors">
                              {viewingId === report.id ? (
                                <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                              ) : (
                                <FileText className="h-5 w-5 text-slate-600 group-hover:text-teal-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{report.candidateName}'s Report</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="hidden sm:block text-right">
                              <p className="text-sm font-medium">Score</p>
                              <p className="text-lg font-bold text-teal-600">{report.overallScore}%</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
