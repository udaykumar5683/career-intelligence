'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SkillGap } from '@/types/analysis';

interface SkillTrackerProps {
  skillGaps: SkillGap[];
  initialProgress?: any[];
}

export function SkillTracker({ skillGaps, initialProgress = [] }: SkillTrackerProps) {
  const [completedSkills, setCompletedSkills] = useState<string[]>(
    initialProgress.filter(p => p.status === 'completed').map(p => p.skillName)
  );
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleSkill = async (skill: string) => {
    const isCompleted = completedSkills.includes(skill);
    const newStatus = isCompleted ? 'pending' : 'completed';
    
    setUpdating(skill);
    try {
      const res = await fetch('/api/dashboard/skill-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: skill,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : 0
        }),
      });

      if (!res.ok) throw new Error('Failed to update skill');

      if (isCompleted) {
        setCompletedSkills(prev => prev.filter(s => s !== skill));
      } else {
        setCompletedSkills(prev => [...prev, skill]);
      }
      toast.success(`Skill ${newStatus === 'completed' ? 'completed' : 'updated'}!`);
    } catch (error) {
      toast.error('Failed to update skill progress');
    } finally {
      setUpdating(null);
    }
  };

  const progressPercentage = Math.round((completedSkills.length / skillGaps.length) * 100) || 0;

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Skill Progress Tracker</CardTitle>
          <CardDescription>Master the skills required for your target roles</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-teal-600">{progressPercentage}%</p>
          <p className="text-xs text-muted-foreground">Overall Completion</p>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="h-2 mb-8 bg-teal-50" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillGaps.map((gap) => (
            <div 
              key={gap.skill}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                completedSkills.includes(gap.skill) 
                  ? 'bg-teal-50/50 border-teal-100' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={completedSkills.includes(gap.skill)}
                  onCheckedChange={() => toggleSkill(gap.skill)}
                  disabled={updating === gap.skill}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${completedSkills.includes(gap.skill) ? 'text-teal-900 line-through opacity-70' : ''}`}>
                      {gap.skill}
                    </span>
                    {updating === gap.skill && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                      {gap.importance}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      {gap.learningDifficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              {completedSkills.includes(gap.skill) && (
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
