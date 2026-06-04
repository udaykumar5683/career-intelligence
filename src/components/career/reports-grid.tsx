'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, ExternalLink, Trash2, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { downloadPDF } from '@/lib/report-pdf-utils';
import { toast as sonnerToast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Report {
  id: string;
  candidateName: string;
  overallScore: number;
  placementRisk: string;
  createdAt: string;
  analysisResult: any;
}

export function ReportsGrid({ initialReports }: { initialReports: Report[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>(initialReports);

  const downloadJSON = (report: Report) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report.analysisResult, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `career-report-${report.candidateName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(report.createdAt), 'yyyy-MM-dd')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      sonnerToast.success("JSON report downloaded successfully");
    } catch (error) {
      console.error("Error downloading JSON:", error);
      sonnerToast.error("Failed to download JSON report");
    }
  };

  const handleDownloadPDF = async (report: Report) => {
    setDownloadingId(report.id);
    try {
      await downloadPDF(report.analysisResult, sonnerToast);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      sonnerToast.error("Failed to download PDF report");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewReport = (report: Report) => {
    if (viewingId) return;
    
    setViewingId(report.id);
    try {
      router.push(`/reports/${report.id}`);
    } catch (error) {
      console.error("Error navigating to report details:", error);
      setViewingId(null);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Could not open report details. Please try again.",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    console.log('[reports-grid] handleDeleteReport called with reportId:', reportId);
    setDeletingId(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete report';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response.json() fails, just use default message
        }
        throw new Error(errorMessage);
      }

      // Optimistic update: remove from local state
      setReports(reports.filter(r => r.id !== reportId));
      sonnerToast.success('Report deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting report:", error);
      sonnerToast.error(error.message || 'Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {reports.map((report) => (
        <motion.div key={report.id} variants={item}>
          <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-teal-100/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
            <div className={`h-1.5 w-full ${
              report.placementRisk === 'Low' ? 'bg-emerald-500' : 
              report.placementRisk === 'Medium' ? 'bg-amber-500' : 'bg-destructive'
            }`} />
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-muted">
                  ID: {report.id.slice(-6)}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(report.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-teal-600 transition-colors">
                {report.candidateName}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Risk Level</p>
                  <Badge 
                    className={`
                      font-bold
                      ${report.placementRisk === 'Low' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                        report.placementRisk === 'Medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 
                        'bg-destructive/10 text-destructive hover:bg-destructive/10'}
                    `}
                  >
                    {report.placementRisk} Risk
                  </Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Score</p>
                  <p className={`text-2xl font-black ${
                    report.overallScore >= 70 ? 'text-emerald-600' : 
                    report.overallScore >= 40 ? 'text-amber-600' : 'text-destructive'
                  }`}>
                    {report.overallScore}<span className="text-xs text-muted-foreground font-medium">/100</span>
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4 border-t bg-muted/30 grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 text-xs px-1"
                onClick={() => downloadJSON(report)}
              >
                <Download className="h-3.5 w-3.5" />
                JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 text-xs px-1"
                onClick={() => handleDownloadPDF(report)}
                disabled={downloadingId === report.id}
              >
                {downloadingId === report.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                PDF
              </Button>
              <Button 
                size="sm" 
                className="w-full gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white px-1"
                onClick={() => handleViewReport(report)}
                disabled={viewingId === report.id}
              >
                {viewingId === report.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                {viewingId === report.id ? 'Opening...' : 'View'}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2 text-xs px-1"
                    disabled={deletingId === report.id}
                  >
                    {deletingId === report.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your career report and all related data (chat history, roadmap, etc.).
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteReport(report.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
