'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FiInfo } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useSummarizer from "@/hooks/useSummarizer";
import { ExamplesCarousel } from '@/components/article-carousel';

export default function SummarizerDemo() {
  const {
    text,
    summaryDetail,
    additionalInstructions,
    result,
    loading,
    setText,
    setSummaryDetail,
    setAdditionalInstructions,
    summarizeText,
  } = useSummarizer();

  return (
    <>
        <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Text Summarizer
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Transform your text into concise, meaningful summaries.
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
                <DialogTitle>Text Summarizer Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Text Summarizer service uses advanced AI to create concise summaries of your text.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Enter or paste your text</li>
                        <li>Adjust summary detail level (0-1)</li>
                        <li>Add optional instructions</li>
                        <li>Click summarize to process</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">Text to Summarize:</label>
            <textarea 
              className="w-full p-4 border rounded bg-zinc-50 border-zinc-500 dark:bg-zinc-900 dark:border-zinc-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter your text here..."
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">Summary Detail (0-1):</label>
              <input
                type="number"
                className="w-full p-2 border rounded bg-zinc-50 border-zinc-500 dark:bg-zinc-900 dark:border-zinc-500"
                value={summaryDetail}
                onChange={(e) => setSummaryDetail(Number(e.target.value))}
                step="0.1"
                min="0"
                max="1"
              />
            </div>

            <div>
              <label className="block mb-2">Additional Instructions (Optional):</label>
              <textarea
                className="w-full p-2 border rounded bg-zinc-50 border-zinc-500 dark:bg-zinc-900 dark:border-zinc-500"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={3}
                placeholder="Any specific instructions for summarization..."
              />
            </div>
          </div>

          <Button 
            onClick={summarizeText}
            disabled={loading || !text.trim()}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading || !text.trim() ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            <span>{loading ? 'Processing...' : 'Summarize Text'}</span>
          </Button>

          {result && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold">Summary Result</h2>
              <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                {result.error ? (
                  <p className="text-red-500">{result.error}</p>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap dark:text-zinc-300">{result.response}</p>
                    {result.inference_time && (
                      <p className="mt-4 text-sm text-zinc-400">
                        Processing time: {result.inference_time.toFixed(2)} seconds
                      </p>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className='flex items-center justify-center mb-8 py-8'>
      <ExamplesCarousel />
    </div>  
    </>
  );
}
