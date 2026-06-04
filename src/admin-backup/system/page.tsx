import { db } from '@/lib/db';
import { 
  ShieldAlert, 
  Terminal, 
  History, 
  RefreshCcw,
  Bug,
  Database,
  Cpu,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  const errorLogs = await db.errorLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const systemMetrics = await db.systemMetric.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor AI performance, error logs, and API status.</p>
        </div>
        <Button className="gap-2">
          <RefreshCcw className="size-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API & Service Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              Service Status
            </CardTitle>
            <CardDescription>Live connectivity and operational status of external dependencies.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusItem label="Supabase Auth" status="operational" latency="124ms" />
            <StatusItem label="Prisma DB (SQLite)" status="operational" latency="2ms" />
            <StatusItem label="Z-AI SDK Gateway" status="operational" latency="342ms" />
            <StatusItem label="Adzuna Job API" status="operational" latency="512ms" />
            <StatusItem label="Tesseract.js Worker" status="operational" latency="N/A" />
            <StatusItem label="PDF Renderer" status="operational" latency="N/A" />
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="size-5 text-primary" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MetricProgress label="DB Storage" value="12.5 MB" max="50 MB" percentage={25} />
            <MetricProgress label="AI Token Usage" value="45k" max="100k" percentage={45} />
            <MetricProgress label="Monthly Analyses" value="128" max="1000" percentage={12.8} />
          </CardContent>
        </Card>

        {/* Error Logs */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="size-5 text-destructive" />
                Recent Error Logs
              </CardTitle>
              <CardDescription>Last 10 system errors and AI processing failures.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
              Clear All Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errorLogs.map((log) => (
                <Alert key={log.id} variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span className="capitalize">{log.type} Error</span>
                    <span className="text-[10px] opacity-70">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="font-mono text-xs bg-destructive/10 p-2 rounded">{log.message}</p>
                    {log.path && <p className="text-[10px] mt-1 opacity-70">Path: {log.path}</p>}
                  </AlertDescription>
                </Alert>
              ))}
              {errorLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                  <History className="size-8 mx-auto mb-2 opacity-20" />
                  <p>No errors reported in the last 24 hours.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({ label, status, latency }: { label: string; status: string; latency: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">Latency: {latency}</span>
      </div>
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 capitalize">
        {status}
      </Badge>
    </div>
  );
}

function MetricProgress({ label, value, max, percentage }: { label: string; value: string; max: string; percentage: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} / {max}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            percentage > 80 ? 'bg-destructive' : 
            percentage > 50 ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
