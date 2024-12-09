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
} from "@/components/ui/dialog"
import useTextEmbedding from "@/hooks/useTextEmbedding";
import { ExamplesCarousel } from '@/components/article-carousel';

export default function TextEmbeddingDemo() {
  const { text1, text2, result, loading, setText1, setText2, compareTexts } = useTextEmbedding();

  return (
    <>
        <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Text Embedding Query
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Compare text similarity using advanced embedding technology.
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
                <DialogTitle>Text Embedding Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Text Embedding service analyzes and compares text similarity using vector embeddings.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Enter your first text</li>
                        <li>Enter your second text</li>
                        <li>Click compare to analyze similarity</li>
                        <li>View similarity score and interpretation</li>
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
            <label className="block mb-2">First Text:</label>
            <textarea 
              className="w-full p-4 border rounded bg-zinc-100 border-zinc-950 dark:bg-zinc-800 dark:border-zinc-500"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={4}
              placeholder="Enter first text here..."
            />
          </div>

          <div>
            <label className="block mb-2">Second Text:</label>
            <textarea 
              className="w-full p-4 border rounded bbg-zinc-100 border-zinc-950 dark:bg-zinc-800 dark:border-zinc-500"
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              rows={4}
              placeholder="Enter second text here..."
            />
          </div>

          <Button 
            onClick={compareTexts}
            disabled={loading || !text1.trim() || !text2.trim()}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading || !text1.trim() || !text2.trim() ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            <span>{loading ? 'Processing...' : 'Compare Texts'}</span>
          </Button>

          {result && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-white">Comparison Results</h2>
              <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                {result.error ? (
                  <p className="text-red-500">{result.error}</p>
                ) : (
                  <>
                    <p className="dark:text-zinc-300">Similarity Score: {result.similarity}</p>
                    <p className="dark:text-zinc-300 mt-2">Interpretation: {result.message}</p>
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
