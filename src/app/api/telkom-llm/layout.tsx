'use client'

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { IconPlus, IconHistory, IconArrowLeft } from '@tabler/icons-react';
import { getChatSessions, ChatSession } from '@/lib/sessionStorage';
import { useEffect, useState } from 'react';
import { Message } from '@/types/chat';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const refreshSessions = () => {
    setSessions(getChatSessions());
  };
    
  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);  

  useEffect(() => {
    const updateSessions = () => {
      setSessions(getChatSessions());
    };

    updateSessions();
    window.addEventListener('storage', updateSessions);

    return () => {
      window.removeEventListener('storage', updateSessions);
    };
  }, []);

  const getLastUserMessage = (messages: Message[]): string => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content;
      }
    }
    return 'New Chat';
  };

  const links = [
    { label: 'New Chat', href: '/api/telkom-llm?sessionId=new', icon: <IconPlus size={24} /> },
    { label: 'Back to Home', href: '/', icon: <IconArrowLeft size={24} /> },
    ...sessions
      .filter(session => session.id !== 'new')
      .map(session => ({
        label: getLastUserMessage(session.messages),
        href: `/api/telkom-llm?sessionId=${session.id}`,
        icon: <IconHistory size={24} />,
      })),
  ];

  return (
    <Sidebar>
      <div className="flex h-screen">
        <SidebarBody>
          {links.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </SidebarBody>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-background">{children}</main>
      </div>
    </Sidebar>
  );
}
