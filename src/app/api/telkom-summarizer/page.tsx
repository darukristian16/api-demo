'use client'

import { useState } from 'react'

interface SummaryResult {
  response: string;
  inference_time?: number;
  error?: string;
}


export default function SummarizerDemo() {
  const [text, setText] = useState('')
  const [summaryDetail, setSummaryDetail] = useState(0.4)
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)

  const summarizeText = async () => {
    setLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_API_KEY || '',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          text_input: text,
          summary_detail: summaryDetail,
          additional_instruction: additionalInstructions
        })
      })
      const data: SummaryResult = await response.json()
      setResult(data)
    } catch {
      setResult({ response: '', error: 'Error processing request' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Text Summarizer</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2">Text to Summarize:</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Enter your text here..."
          />
        </div>

        <div>
          <label className="block mb-2">Summary Detail (0-1):</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={summaryDetail}
            onChange={(e) => setSummaryDetail(Number(e.target.value))}
            step="0.1"
            min="0"
            max="1"
          />
        </div>

        <div>
          <label className="block mb-2">Additional Instructions (Optional):</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="Any specific instructions for summarization..."
          />
        </div>

        <button
          onClick={summarizeText}
          disabled={loading || !text.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Summarize Text'}
        </button>

        {result && (
          <div className="mt-6 p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Results:</h2>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Summary:</h3>
                  <p className="mt-1">{result.response}</p>
                </div>
                <div>
                  <h3 className="font-medium">Processing Time:</h3>
                  <p className="mt-1">{result.inference_time?.toFixed(2)} seconds</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
