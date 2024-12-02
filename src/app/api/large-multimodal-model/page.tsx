'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react'; // Add this import at the top
import { Skeleton } from "@/components/ui/skeleton"
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isNewImage, setIsNewImage] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsNewImage(true);
    }
  };  

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);  

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
    setIsNewImage(false);

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
          <h1 className="md:text-6xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Large Multimodal Model
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Chat with our AI about images and text using advanced multimodal technology.
          </p>
        </div>
        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FiInfo className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-50 border-zinc-800 dark:bg-zinc-950 border:dark-zinc-500 text-zinc-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>Multimodal Chat Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our multimodal chat service can understand and discuss both images and text.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload an image</li>
                        <li>Type your question or prompt</li>
                        <li>Click send to get AI response</li>
                        <li>Continue the conversation naturally</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {previewUrl && (
          <div className="mt-6 mb-8">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-4">Preview:</h2>
            <div className="relative inline-block">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-200 dark:bg-zinc-900'
                } max-w-[80%]`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Uploaded content"
                    className="max-w-xs mb-2 rounded"
                  />
                )}
                <p className="text-zinc-950 dark:text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-lg bg-zinc-200 dark:bg-zinc-900 max-w-[80%]">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </div>
              </div>
          )}

          {file && isNewImage && (
            <div className="flex justify-end">
              <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 max-w-[80%]">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-w-xs mb-2 rounded"
                />
              </div>
            </div>
          )}
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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <ImagePlus className="w-5 h-5 text-zinc-50 dark:text-zinc-300" />
              </label>
            </div>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1  text-zinc-900 dark:text-white bg-zinc-100 border-zinc-500 dark:bg-zinc-800 dark:border-zinc-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-zinc-400 hover:bg-zinc-200 dark:bg-zinc-300 dark:hover:bg-zinc-500 text-white dark:text-black"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

