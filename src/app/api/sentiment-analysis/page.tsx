'use client'

import { useState } from 'react'

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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sentiment Analysis</h1>
      
      <div className="space-y-4">
        <textarea
          className="w-full p-2 border rounded-md"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment..."
        />

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          onClick={analyzeSentiment}
          disabled={!text || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>

        {result && (
          <div className="mt-4 p-4 border rounded-md">
            <h2 className="font-semibold">Results:</h2>
            <p>Sentiment: {result.label}</p>
            <p>Confidence: {(result.score * 100).toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  )
}
