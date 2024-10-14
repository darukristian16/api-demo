'use client'

import ChatBot from '@/components/ChatBot';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId') || undefined;

  return (
    <div className="h-full">
      <ChatBot sessionId={sessionId || undefined} />
    </div>
  );
}
