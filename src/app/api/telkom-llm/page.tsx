'use client'

import { Suspense } from 'react';
import ChatBot from '@/components/ChatBot';
import { useSearchParams } from 'next/navigation';

function TelkomLLMContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId') || 'new';

  return (
    <div className="h-full">
      <ChatBot sessionId={sessionId} />
    </div>
  );
}

export default function TelkomLLM() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TelkomLLMContent />
    </Suspense>
  );
}
