import { NextRequest, NextResponse } from 'next/server';
import { AdzunaService } from '@/lib/adzuna-service';
import { JobSearchFilters } from '@/types/job';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || undefined;
    const salaryMin = searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined;
    const fullTime = searchParams.get('fullTime') === 'true';
    const country = searchParams.get('country') || 'in';

    const filters: JobSearchFilters = {
      location,
      page,
      category,
      salaryMin,
      fullTime,
      results_per_page: 20,
    };

    const results = await AdzunaService.searchJobs(query, filters, country);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Job search API Route error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search jobs',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
