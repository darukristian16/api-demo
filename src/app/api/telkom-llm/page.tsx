'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/lib/api';
import { Send } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import MessageCard from '@/components/MessageCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { saveChatSession, getChatSessionById, generateSessionId } from '@/lib/sessionStorage';
import { getAllChatSessions } from '@/lib/sessionStorage';
import { ChatSession } from '@/lib/sessionStorage';
import { deleteSession } from '@/lib/sessionStorage';
import { Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function TelkomLLMContent() {
  const searchParams = useSearchParams();
  let sessionId = searchParams?.get('sessionId') || 'new'; // Changed from const to let
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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setChatSessions(getAllChatSessions());
  }, []);

  const handleSessionSelect = (selectedSessionId: string) => {
    router.push(`/api/telkom-llm?sessionId=${selectedSessionId}`);
  };

  const handleNewChat = () => {
    router.push('/api/telkom-llm?sessionId=new');
  };

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      const session = getChatSessionById(sessionId);
      if (session) {
        setConversation(session.messages);
        setSystemPrompt(session.messages[0].content);
      }
    } else {
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

    setChatSessions(getAllChatSessions());

    setInput('');
    setIsLoading(false);
  };

  const handleSystemPromptEdit = (newContent: string) => {
    setSystemPrompt(newContent);
    setConversation(prev => [{ role: 'system', content: newContent }, ...prev.slice(1)]);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionToDelete: string) => {
    e.stopPropagation(); // Prevent triggering the session selection
    deleteSession(sessionToDelete);
    setChatSessions(getAllChatSessions());
    
    if (sessionId === sessionToDelete) {
      router.push('/api/telkom-llm?sessionId=new');
    }
  };  

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-500">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Telkom LLM Chat
          </h1>
          <p className="text-zinc-400 text-sm">
            Chat with our advanced language model powered by Telkom.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <FiInfo className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-500 text-white">
            <DialogHeader>
              <DialogTitle>Telkom LLM Chat Service</DialogTitle>
              <DialogDescription className="text-zinc-400">
                <div className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">About</h4>
                    <p>Our advanced language model can help answer your questions and assist with various tasks.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">How to Use</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Type your question or prompt</li>
                      <li>Press enter or click send</li>
                      <li>Get AI-powered responses</li>
                      <li>Continue the conversation naturally</li>
                    </ol>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat History Sidebar */}
        <div className="w-64 bg-zinc-900 border-r border-zinc-500 flex flex-col">
          <div className="p-4">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-zinc-200 hover:bg-zinc-500"
            >
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className={`p-3 cursor-pointer hover:bg-zinc-800 ${
                  session.id === sessionId ? 'bg-zinc-800' : ''
                } flex justify-between items-center group`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    {session.messages[1]?.content.substring(0, 30) || 'New Conversation'}...
                  </div>
                  <div className="text-xs text-zinc-400">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                >
                  <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* System Prompt */}
          <div className="p-4 bg-zinc-900 border-b border-zinc-500">
            <MessageCard
              role="system"
              content={systemPrompt}
              onEdit={handleSystemPromptEdit}
            />
          </div>
  
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
            {conversation.slice(1).map((message, index) => (
              <MessageCard
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
  
          {/* Input Area */}
          <div className="p-4 border-t border-zinc-500 bg-zinc-900">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 min-h-[60px] max-h-[200px]"
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
                className="bg-zinc-300 hover:bg-zinc-100 text-black p-2 rounded-sm self-end h-[60px] w-[60px]"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
  
        {/* Settings Panel */}
        <div className="w-80 bg-zinc-900 border-l border-zinc-500 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Temperature: {temperature.toFixed(2)}
              </label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Gen Length: {maxGenLen}
              </label>
              <Slider
                value={[maxGenLen]}
                onValueChange={(value) => setMaxGenLen(value[0])}
                max={2000}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}

export default function TelkomLLM() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-zinc-300"></div>
      </div>
    }>
      <TelkomLLMContent />
    </Suspense>
  );
}
