'use client';

import { useSession } from '@/providers/auth-provider';
import { FloatingChat } from './FloatingChat';

export function FloatingChatWrapper() {
  const { user, loading } = useSession();

  if (loading || !user) return null;

  return <FloatingChat />;
}
