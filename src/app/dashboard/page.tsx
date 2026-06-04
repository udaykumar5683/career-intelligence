import type { Metadata } from 'next';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard | AI Career Intelligence',
  description: 'Your personalized career intelligence dashboard with AI-powered insights, skill tracking, and job recommendations.',
  keywords: ['career dashboard', 'skill tracking', 'AI career insights'],
};

export default function DashboardPage() {
  return <DashboardClient />;
}
