'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button';
import { FiLoader, FiInfo } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SentimentResponse {
  label: string
  score: number
}

export default function SentimentAnalysis() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SentimentResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeSentiment = async () => {
    setLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SENTIMENT_ANALYSIS_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_SENTIMENT_ANALYSIS_API_KEY!
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Sentiment Analysis
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Analyze the sentiment of your text using advanced natural language processing.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FiInfo className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-500 text-white">
              <DialogHeader>
                <DialogTitle>Sentiment Analysis Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our sentiment analysis service evaluates the emotional tone of your text.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Enter your text in the input area</li>
                        <li>Click analyze to process</li>
                        <li>View the sentiment results</li>
                        <li>Check confidence score</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <textarea
            className="w-full p-4 rounded-lg bg-zinc-900 text-white border border-zinc-500 focus:border-zinc-400 focus:ring-0 min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze sentiment..."
          />

          <Button
            onClick={analyzeSentiment}
            disabled={!text || loading}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading || !text ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Analyzing...' : 'Analyze Sentiment'}</span>
          </Button>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Sentiment</h3>
                  <p className="text-zinc-300 capitalize">{result.label}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Confidence</h3>
                  <p className="text-zinc-300">{(result.score * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
