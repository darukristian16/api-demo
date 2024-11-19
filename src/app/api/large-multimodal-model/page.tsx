'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react'; // Add this import at the top
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function LargeMultimodalModel() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    let base64Image = '';
    if (file) {
      base64Image = await convertToBase64(file);
    }

    const userMessage: Message = {
      role: 'user',
      content: question,
      image: base64Image || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: question,
                type: "text"
              },
              ...(base64Image ? [{
                image_url: {
                  url: base64Image
                },
                type: "image_url"
              }] : [])
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0,
        stream: false
      };

      const response = await fetch(process.env.NEXT_PUBLIC_LMM_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LMM_API_KEY!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'There was an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="flex-none p-4 border-b border-zinc-500">
        <h1 className="text-2xl font-bold text-white">Large Multimodal Model Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === 'user'
                  ? 'bg-zinc-800 border-zinc-400 text-white'
                  : 'bg-zinc-900 text-zinc-100'
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Uploaded content"
                  className="max-w-xs mb-2 rounded"
                />
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex-none p-4 border-t border-zinc-500 bg-zinc-950">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            >
              <ImagePlus className="w-5 h-5 text-zinc-300" />
            </label>
          </div>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-zinc-800 text-white border-zinc-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-zinc-100 hover:bg-zinc-500 text-black"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
