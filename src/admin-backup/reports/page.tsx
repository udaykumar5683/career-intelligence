import { db } from '@/lib/db';
import { 
  FileText, 
  Search, 
  Download, 
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const dynamic = "force-dynamic";

export default async function ReportsManagementPage() {
  const reports = await db.report.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Report Management</h1>
        <p className="text-muted-foreground">Inspect and manage all career intelligence reports.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search reports by candidate..." className="pl-9" />
        </div>
        <Button variant="outline">Score: High to Low</Button>
        <Button variant="outline">Risk: All</Button>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.candidateName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{report.user.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{report.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{report.overallScore}%</span>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${report.overallScore}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      report.placementRisk === 'Low' ? 'default' : 
                      report.placementRisk === 'Medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {report.placementRisk} Risk
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="View Report">
                      <ExternalLink className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download PDF">
                      <Download className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No reports generated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
