import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Check, Loader2, Cpu, Zap, Search, Target, BarChart3, Ruler, AlertTriangle, Coins, Map, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AnalysisStage } from '@/types/analysis';
import { STAGE_CONFIG } from '@/types/analysis';

interface AnalysisProgressProps {
  stage: AnalysisStage;
  progress: number; // 0-100
  onCancel?: () => void;
  onRestart?: () => void;
}

// Define the 7 AI agents in order
const AGENTS = [
  { id: 'parsing', name: 'Resume Parser', icon: <Search className="h-4 w-4" />, emoji: '🔍' },
  { id: 'analyzing-roles', name: 'Job Role Analyzer', icon: <Target className="h-4 w-4" />, emoji: '🎯' },
  { id: 'researching-market', name: 'Market Researcher', icon: <BarChart3 className="h-4 w-4" />, emoji: '📊' },
  { id: 'analyzing-skills', name: 'Skill Gap Analyzer', icon: <Ruler className="h-4 w-4" />, emoji: '📐' },
  { id: 'predicting-risk', name: 'Placement Risk Predictor', icon: <AlertTriangle className="h-4 w-4" />, emoji: '⚠️' },
  { id: 'estimating-salary', name: 'Salary Estimator', icon: <Coins className="h-4 w-4" />, emoji: '💰' },
  { id: 'building-roadmap', name: 'Career Roadmap Builder', icon: <Map className="h-4 w-4" />, emoji: '🗺️' },
] as const;

// ... (STAGE_ORDER and getAgentStatus remain similar but updated)
const STAGE_ORDER: AnalysisStage[] = [
  'idle',
  'uploading',
  'parsing',
  'analyzing-roles',
  'researching-market',
  'analyzing-skills',
  'predicting-risk',
  'estimating-salary',
  'building-roadmap',
  'complete',
  'error',
];

type AgentStatus = 'completed' | 'active' | 'pending';

function getAgentStatus(agentStage: AnalysisStage, currentStage: AnalysisStage): AgentStatus {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const agentIdx = STAGE_ORDER.indexOf(agentStage);

  if (currentStage === 'error') return 'pending';
  if (currentStage === 'complete') return 'completed';
  if (currentIdx <= STAGE_ORDER.indexOf('uploading')) return 'pending';
  if (agentIdx < currentIdx) return 'completed';
  if (agentIdx === currentIdx) return 'active';
  return 'pending';
}

function TypewriterTitle({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <div className="flex flex-wrap justify-center gap-x-2">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

function ProcessingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={i}
            x1="-20"
            y1={15 + i * 15}
            x2="120"
            y2={15 + i * 15}
            stroke="url(#line-grad)"
            strokeWidth="0.1"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.5,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function AnalysisProgress({ stage, progress, onCancel, onRestart }: AnalysisProgressProps) {
  const isIdle = stage === 'idle' || stage === 'uploading';
  const isComplete = stage === 'complete';
  const isError = stage === 'error';

  const currentConfig = STAGE_CONFIG[stage];

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 min-h-[1.5em]">
          <TypewriterTitle text={isError ? "Analysis Failed" : isComplete ? "Analysis Complete" : "Analyzing Your Career"} />
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto"
        >
          {isError 
            ? "We encountered an issue while processing your resume. Please try again."
            : isComplete 
              ? "Your career intelligence report is ready for viewing."
              : "Our specialized AI agents are working together to build your report"}
        </motion.p>
      </div>

      <Card className="w-full overflow-hidden relative border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
        <ProcessingBackground />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Cpu className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                AI Analysis Pipeline
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isComplete
                    ? 'default'
                    : isError
                      ? 'destructive'
                      : isIdle
                        ? 'secondary'
                        : 'outline'
                }
                className={`
                  ${isComplete ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                  ${!isIdle && !isComplete && !isError ? 'animate-pulse border-primary/50 text-primary' : ''}
                `}
              >
                {isComplete ? 'Complete' : isError ? 'Error' : isIdle ? 'Ready' : 'Running'}
              </Badge>
              {!isComplete && !isError && onCancel && (
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive" onClick={onCancel}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Overall Progress</span>
              <span className="tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div 
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative z-10">
          <AnimatePresence mode="wait">
            {!isIdle && !isError && !isComplete && (
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4"
              >
                <div className="bg-white dark:bg-primary/20 p-2 rounded-lg shadow-sm border border-primary/10">
                  <span className="text-2xl">{currentConfig.icon}</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">
                      {currentConfig.label}
                    </p>
                    <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none">Active Agent</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentConfig.description}
                  </p>
                </div>
              </motion.div>
            )}

            {isError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex flex-col items-center gap-4 text-center"
              >
                <div className="bg-destructive/10 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-bold text-destructive mb-1">Processing Interrupted</p>
                  <p className="text-xs text-muted-foreground">The AI engine hit a roadblock. Don't worry, your data is safe.</p>
                </div>
                {onRestart && (
                  <Button variant="outline" size="sm" onClick={onRestart} className="gap-2">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry Analysis
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative space-y-4 pl-2">
            {/* Timeline connection line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-muted/30" />
            
            {AGENTS.map((agent, index) => {
              const status = getAgentStatus(agent.id as AnalysisStage, stage);
              const agentConfig = STAGE_CONFIG[agent.id as AnalysisStage];

              return (
                <div key={agent.id} className="relative flex gap-4">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{
                        backgroundColor: status === 'completed' ? '#10b981' : status === 'active' ? '#f59e0b' : 'transparent',
                        borderColor: status === 'completed' ? '#10b981' : status === 'active' ? '#f59e0b' : 'rgba(var(--muted-foreground), 0.2)',
                        scale: status === 'active' ? [1, 1.2, 1] : 1,
                      }}
                      className={`
                        z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500
                        ${status === 'pending' ? 'bg-muted/50' : ''}
                      `}
                    >
                      {status === 'completed' ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        </motion.div>
                      ) : status === 'active' ? (
                        <Zap className="h-4 w-4 text-white animate-pulse" />
                      ) : (
                        <div className="opacity-40">{agent.icon}</div>
                      )}
                    </motion.div>
                    
                    {status === 'active' && (
                      <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 rounded-full bg-amber-500/30 blur-md z-0"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <div className="flex-1 py-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold transition-colors duration-500 ${
                          status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                          status === 'active' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {agent.name}
                        </span>
                        {status === 'active' && (
                          <span className="flex gap-0.5">
                            {[0, 1, 2].map(i => (
                              <motion.span
                                key={i}
                                className="w-1 h-1 rounded-full bg-amber-500"
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      {status === 'completed' && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter"
                        >
                          Verified
                        </motion.span>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {status === 'active' && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[11px] text-muted-foreground mt-0.5 leading-tight"
                        >
                          {agentConfig.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {!isComplete && !isError && (
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          Parallel AI Agent Orchestration in Progress
        </p>
      )}
    </div>
  );
}
