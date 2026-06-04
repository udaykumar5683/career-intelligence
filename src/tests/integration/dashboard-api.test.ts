import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/dashboard/latest/route';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';

describe('Dashboard Latest API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: new Error('Auth error') })),
      },
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return hasAnalysis: false if no report exists', async () => {
    const mockUser = { id: 'user-123' };
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    };
    (createClient as any).mockReturnValue(mockSupabase);

    (db.report.findFirst as any).mockResolvedValue(null);
    (db.user.findUnique as any).mockResolvedValue({ streak: 5 });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hasAnalysis).toBe(false);
    expect(data.streak).toBe(5);
  });

  it('should return the latest report and progress data', async () => {
    const mockUser = { id: 'user-123' };
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const mockReport = { id: 'report-1', analysisResult: { score: 90 } };
    (db.report.findFirst as any).mockResolvedValue(mockReport);
    (db.user.findUnique as any).mockResolvedValue({ streak: 10 });
    (db.skillProgress.findMany as any).mockResolvedValue([{ skillName: 'React' }]);
    (db.savedJob.findMany as any).mockResolvedValue([{ title: 'Dev' }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hasAnalysis).toBe(true);
    expect(data.report.id).toBe('report-1');
    expect(data.skillProgress.length).toBe(1);
    expect(data.streak).toBe(10);
  });
});
