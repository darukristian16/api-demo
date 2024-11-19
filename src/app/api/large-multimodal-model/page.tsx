'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react'; // Add this import at the top
import { Card } from '@/components/ui/card';
import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


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
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Multimodal Chat
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Chat with our AI about images and text using advanced multimodal technology.
          </p>
        </div>

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-zinc-800' : 'bg-zinc-900'
                } max-w-[80%]`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Uploaded content"
                    className="max-w-xs mb-2 rounded"
                  />
                )}
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
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
              className="bg-zinc-300 hover:bg-zinc-500 text-black"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

