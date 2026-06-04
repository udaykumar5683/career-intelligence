'use client';

import { Job } from '@/types/job';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Briefcase, 
  DollarSign,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 border-teal-100 group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-teal-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Building2 className="h-4 w-4" />
              <span>{job.company}</span>
            </div>
          </div>
          {job.matchScore && (
            <div className="flex flex-col items-end">
              <Badge className={cn(
                "px-2 py-1 flex gap-1 items-center",
                job.matchScore >= 80 ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                job.matchScore >= 50 ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}>
                <Zap className="h-3 w-3 fill-current" />
                {job.matchScore}% Match
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-teal-500" />
            <span>{job.type || 'Full-time'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-teal-500" />
            <span className="truncate">{job.salary.formatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-500" />
            <span>{formatDistanceToNow(new Date(job.postedDate))} ago</span>
          </div>
        </div>

        {job.matchingSkills && job.matchingSkills.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Matching Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.matchingSkills.slice(0, 4).map(skill => (
                <Badge key={skill} variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 border-teal-100">
                  {skill}
                </Badge>
              ))}
              {job.matchingSkills.length > 4 && (
                <span className="text-[10px] text-gray-400">+{job.matchingSkills.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 line-clamp-3 italic">
          "{job.description}"
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={() => window.open(job.url, '_blank')}
        >
          View Details
        </Button>
        <Button 
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          onClick={() => window.open(job.url, '_blank')}
        >
          Apply Now <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
