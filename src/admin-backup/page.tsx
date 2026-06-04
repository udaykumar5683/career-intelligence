import { db } from '@/lib/db';
import { 
  Users, 
  FileText, 
  Cpu, 
  MessageSquare, 
  Search, 
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Area
} from 'recharts';

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch summary stats
  const totalUsers = await db.user.count();
  const totalReports = await db.report.count();
  const totalChats = await db.chatSessions.count();
  const failedAnalyses = await db.errorLog.count({ where: { type: 'ai' } });
  
  // Mock chart data (in a real app, these would be aggregated from DB)
  const userGrowthData = [
    { name: 'Mon', users: 12 },
    { name: 'Tue', users: 19 },
    { name: 'Wed', users: 15 },
    { name: 'Thu', users: 22 },
    { name: 'Fri', users: 30 },
    { name: 'Sat', users: 25 },
    { name: 'Sun', users: 32 },
  ];

  const analysisActivityData = [
    { name: '09:00', count: 5 },
    { name: '10:00', count: 12 },
    { name: '11:00', count: 8 },
    { name: '12:00', count: 15 },
    { name: '13:00', count: 22 },
    { name: '14:00', count: 18 },
    { name: '15:00', count: 25 },
  ];

  const skillData = [
    { skill: 'React', count: 85 },
    { skill: 'Node.js', count: 72 },
    { skill: 'Python', count: 64 },
    { skill: 'TypeScript', count: 58 },
    { skill: 'Next.js', count: 45 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor system performance and user activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Users" 
          value={totalUsers} 
          icon={<Users className="size-5" />} 
          trend="+12% from last week"
        />
        <StatsCard 
          title="Total Reports" 
          value={totalReports} 
          icon={<FileText className="size-5" />} 
          trend="+8% from last week"
        />
        <StatsCard 
          title="Chat Sessions" 
          value={totalChats} 
          icon={<MessageSquare className="size-5" />} 
          trend="+15% from last week"
        />
        <StatsCard 
          title="Failed Analyses" 
          value={failedAnalyses} 
          icon={<AlertCircle className="size-5" />} 
          trend="-2% from last week"
          isNegative
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="size-4" />
              User Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Analysis Activity Chart */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="size-4" />
              Real-time Analysis Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysisActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Skills Bar Chart */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Cpu className="size-4" />
              Top Extracted Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="skill" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Performance Card */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="size-4" />
              AI Pipeline Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <HealthMetric label="OCR Success Rate" value="98.5%" status="healthy" />
            <HealthMetric label="VLM Parsing Latency" value="4.2s" status="healthy" />
            <HealthMetric label="LLM Analysis Latency" value="2.8s" status="healthy" />
            <HealthMetric label="Job Search API Status" value="Online" status="healthy" />
            <HealthMetric label="Database Sync Latency" value="45ms" status="healthy" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, isNegative = false }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  trend: string;
  isNegative?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-md bg-muted/50 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${isNegative ? 'text-destructive' : 'text-emerald-500'}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

function HealthMetric({ label, value, status }: { label: string; value: string; status: 'healthy' | 'warning' | 'error' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{value}</span>
        <div className={`size-2 rounded-full ${
          status === 'healthy' ? 'bg-emerald-500' : 
          status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
        }`} />
      </div>
    </div>
  );
}
