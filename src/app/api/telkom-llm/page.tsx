'use client'

import ChatBot from '@/components/ChatBot';
import { useSearchParams } from 'next/navigation';

export default function TelkomLLM() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId') || 'new';

  return (
    <div className="h-full">
      <ChatBot sessionId={sessionId} />
    </div>
  );
}
