import { Message } from '@/types/chat';

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'chatSessions';

export function saveChatSession(session: ChatSession): void {
  const sessions = getChatSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  if (existingIndex !== -1) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getChatSessions(): ChatSession[] {
  const sessionsJson = localStorage.getItem(STORAGE_KEY);
  return sessionsJson ? JSON.parse(sessionsJson) : [];
}

export function getChatSessionById(id: string): ChatSession | undefined {
  const sessions = getChatSessions();
  return sessions.find(session => session.id === id);
}

export function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function deleteSession(id: string): void {
  const sessions = getChatSessions();
  const updatedSessions = sessions.filter(session => session.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
}

export function getAllChatSessions(): ChatSession[] {
  const sessions = getChatSessions();
  return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
