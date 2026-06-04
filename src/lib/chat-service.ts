import { db } from './db';

export async function createChatSession(userId: string, reportId?: string, title?: string) {
  return db.chatSessions.create({
    data: {
      userId,
      reportId,
      title: title || 'New Career Chat',
    },
  });
}

export async function getChatSessions(userId: string) {
  return db.chatSessions.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getChatSession(sessionId: string, userId: string) {
  return db.chatSessions.findUnique({
    where: { id: sessionId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      report: true,
    },
  });
}

export async function addChatMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  return db.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    await tx.chatSessions.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return message;
  });
}

export async function deleteChatSession(sessionId: string, userId: string) {
  return db.chatSessions.delete({
    where: { id: sessionId, userId },
  });
}
