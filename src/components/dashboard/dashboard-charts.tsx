'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { AnalysisResults } from '@/types/analysis';

interface DashboardChartsProps {
  results: AnalysisResults;
}

export function DashboardCharts({ results }: DashboardChartsProps) {
  // Skill Data for Radar Chart
  const skillData = results.jobRoles[0]?.matchedSkills.map(skill => ({
    subject: skill,
    A: Math.floor(Math.random() * 40) + 60, // Mock proficiency
    fullMark: 100,
  })) || [];

  // Salary Growth Mock Data
  const salaryData = [
    { name: 'Entry', salary: results.salaryEstimates[0]?.entryLevel.median / 1000 },
    { name: 'Mid', salary: results.salaryEstimates[0]?.midLevel.median / 1000 },
    { name: 'Senior', salary: results.salaryEstimates[0]?.seniorLevel.median / 1000 },
  ];

  // Market Demand Mock Data
  const marketData = results.marketResearch.map(item => ({
    name: item.role.split(' ').slice(0, 2).join(' '),
    demand: item.demandLevel === 'Very High' ? 95 : item.demandLevel === 'High' ? 80 : item.demandLevel === 'Medium' ? 60 : 40,
  })).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-teal-600" />
        <h2 className="text-xl font-bold">Analytics & Market Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Skill Proficiency Radar */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Skill Proficiency</CardTitle>
          <CardDescription>Top matched skills for {results.jobRoles[0]?.role}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar
                name="Proficiency"
                dataKey="A"
                stroke="#0d9488"
                fill="#0d9488"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salary Growth Projection */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Salary Projection (k)</CardTitle>
          <CardDescription>Estimated growth for target role</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salaryData}>
              <defs>
                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="salary" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSalary)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Market Demand Comparison */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Market Demand</CardTitle>
          <CardDescription>Current demand for identified roles</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="demand" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
