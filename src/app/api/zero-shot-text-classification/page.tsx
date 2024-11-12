'use client'

import { useState } from 'react'

interface ClassificationResult {
  labels?: string[];
  scores?: number[];
  error?: string;
}

export default function ZeroShotDemo() {
  const [text, setText] = useState('')
  const [labels, setLabels] = useState([''])
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const addLabel = () => {
    setLabels([...labels, ''])
  }

  const removeLabel = (index: number) => {
    const newLabels = labels.filter((_, i) => i !== index)
    setLabels(newLabels)
  }

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels]
    newLabels[index] = value
    setLabels(newLabels)
  }

  const classifyText = async () => {
    setLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ZERO_SHOT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ZERO_SHOT_API_KEY || '',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          text,
          labels: labels.filter(label => label.trim() !== ''),
          is_multilabel: true
        })
      })
      const data: ClassificationResult = await response.json()
      setResult(data)
    } catch {
      setResult({ error: 'Error processing request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Zero-Shot Text Classification</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2">Text to Classify:</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-2">Labels:</label>
          {labels.map((label, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                value={label}
                onChange={(e) => updateLabel(index, e.target.value)}
                placeholder="Enter a label"
              />
              <button
                onClick={() => removeLabel(index)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addLabel}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Add Label
          </button>
        </div>

        <button
          onClick={classifyText}
          disabled={loading || !text || labels.every(label => !label.trim())}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Classify Text'}
        </button>

        {result && (
          <div className="mt-6 p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Results:</h2>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <div>
                <p className="font-medium mb-2">Classifications:</p>
                <ul className="space-y-2">
                {result.labels?.map((label: string, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{label}</span>
                    <span className="font-medium">
                      {result.scores && (result.scores[index] * 100).toFixed(2)}%
                    </span>
                  </li>
                ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
