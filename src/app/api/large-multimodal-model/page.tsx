'use client';

import useMultimodalChat from '@/hooks/useMultimodalChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react'; // Add this import at the top
import { Skeleton } from "@/components/ui/skeleton"
import { FiInfo } from 'react-icons/fi';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ExamplesCarousel } from '@/components/article-carousel';

export default function LargeMultimodalModel() {
  const {
    file,
    question,
    messages,
    isLoading,
    error,
    isNewImage,
    setQuestion,
    handleFileChange,
    handleSubmit,
  } = useMultimodalChat();

  return (
    <>
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
                  <Image
                    src={message.image}
                    alt="Uploaded content"
                    width={320}
                    height={240}
                    className="max-w-xs mb-2 rounded"
                  />
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  className="text-zinc-950 dark:text-white whitespace-pre-wrap prose dark:prose-invert max-w-none prose-zinc"
                >
                  {message.content}
                </ReactMarkdown>
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
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  width={320}
                  height={240}
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
                onChange={handleFileChange}
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
        {error && (
          <div className="fixed bottom-4 left-4 z-50">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Error</DialogTitle>
                  <DialogDescription>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error Details</AlertTitle>
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
    <div className='flex items-center justify-center mb-8 py-8'>
      <ExamplesCarousel />
    </div>    
    </>
  );
}

