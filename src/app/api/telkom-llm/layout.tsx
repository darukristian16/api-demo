'use client'

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { IconPlus, IconHistory, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { getChatSessions, ChatSession } from '@/lib/sessionStorage';
import { useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { deleteSession } from '@/lib/sessionStorage';
import '@/styles/sidebar.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const router = useRouter();

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
        const content = messages[i].content;
        return content.length > 30 ? content.substring(0, 30) + '...' : content;
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
        deleteIcon: <IconTrash size={20} onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDeleteSession(session.id);
        }} />,
      })),
  ];  
  
  
  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    refreshSessions();
    router.push('/api/telkom-llm');
  };    

  return (
    <Sidebar>
      <div className="flex h-screen">
        <SidebarBody>
          {links.map((link) => (
            <SidebarLink key={link.href} link={link} className="truncate-text" />))}
        </SidebarBody>
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-background">{children}</main>
      </div>
    </Sidebar>
  );
}
