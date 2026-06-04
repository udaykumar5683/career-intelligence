'use client';

import { useState } from 'react';
import { Job } from '@/types/job';
import { JobCard } from './JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function JobSearchUI() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query && !location) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/jobs/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }
      const data = await response.json();
      setJobs(data.results);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: error.message || 'There was a problem fetching jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Job title, keywords, or company" 
            className="pl-10 h-12 border-none focus-visible:ring-1 focus-visible:ring-teal-500 bg-gray-50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 relative md:max-w-[300px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="City or state" 
            className="pl-10 h-12 border-none focus-visible:ring-1 focus-visible:ring-teal-500 bg-gray-50"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button 
          type="submit" 
          className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Find Jobs'}
        </Button>
      </form>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No jobs found matching your criteria. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="max-w-xs mx-auto space-y-2">
              <p className="font-semibold text-gray-400">Enter a job title or location to start exploring live opportunities across India.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
