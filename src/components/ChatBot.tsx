'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { sendMessage } from '../lib/api';
import { Send } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import MessageCard from './MessageCard';
import { saveChatSession, getChatSessionById, generateSessionId } from '@/lib/sessionStorage';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatBotProps {
  sessionId?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ sessionId }) => {
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [conversation, setConversation] = useState<Message[]>([
    { role: 'system', content: systemPrompt }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [maxGenLen, setMaxGenLen] = useState(100);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      const session = getChatSessionById(sessionId);
      if (session) {
        setConversation(session.messages);
        setSystemPrompt(session.messages[0].content);
      }
    } else {
      // Reset the conversation and system prompt for new sessions
      setConversation([{ role: 'system', content: 'You are a helpful assistant.' }]);
      setSystemPrompt('You are a helpful assistant.');
    }
  }, [sessionId]); 
  
  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      saveChatSession({
        id: sessionId,
        messages: conversation,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [conversation, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    if (!sessionId || sessionId === 'new') {
      const newSessionId = generateSessionId();
      router.push(`/api/telkom-llm?sessionId=${newSessionId}`);
      sessionId = newSessionId;
    }

    const result = await sendMessage(input, conversation, temperature, maxGenLen);
    const updatedConversation = result.updatedConversation;
    setConversation(updatedConversation);
    
    saveChatSession({
      id: sessionId,
      messages: updatedConversation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setInput('');
    setIsLoading(false);
  };


  const handleSystemPromptEdit = (newContent: string) => {
    setSystemPrompt(newContent);
    setConversation(prev => [{ role: 'system', content: newContent }, ...prev.slice(1)]);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-500">
          <MessageCard
            role="system"
            content={systemPrompt}
            onEdit={handleSystemPromptEdit}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.slice(1).map((message, index) => (
            <MessageCard
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-zinc-500 bg-white dark:bg-zinc-900">
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 dark:bg-zinc-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading} 
              className="bg-zinc-300 hover:bg-zinc-100 text-black p-2 rounded-sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-64 p-4 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-500">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature: {temperature.toFixed(2)}</label>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Gen Length: {maxGenLen}</label>
            <Slider
              value={[maxGenLen]}
              onValueChange={(value) => setMaxGenLen(value[0])}
              max={2000}
              step={10}
              className='w-full'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
