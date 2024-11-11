'use client'

import { useState } from 'react'

export default function TextEmbeddingDemo() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const getEmbedding = async (text: string) => {
    const response = await fetch(process.env.NEXT_PUBLIC_TEXT_EMBEDDING_URL + '/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_TEXT_EMBEDDING_API_KEY || '',
        'accept': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    const data = await response.json()
    return { embedding: data.embeddings } // Map the response to match our expected format
  }

  const calculateCosineSimilarity = (vec1: number[], vec2: number[]) => {
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0)
    const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0))
    const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0))
    return dotProduct / (mag1 * mag2)
  }

  const compareTexts = async () => {
    setLoading(true)
    try {
      const embedding1 = await getEmbedding(text1)
      const embedding2 = await getEmbedding(text2)
      
      // Check if embeddings exist and have the expected format
      if (!embedding1?.embedding || !embedding2?.embedding) {
        throw new Error('Invalid embedding response format')
      }
      
      const similarity = calculateCosineSimilarity(
        embedding1.embedding,
        embedding2.embedding
      )
      
      setResult({
        similarity: similarity.toFixed(4),
        message: similarity > 0.8 ? 'Very Similar!' : 
                 similarity > 0.5 ? 'Somewhat Similar' : 
                 'Not Very Similar'
      })
    } catch (error) {
      console.error('API Error:', error)
      setResult({ 
        error: error instanceof Error ? error.message : 'Error connecting to embedding service'
      })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Text Embedding Similarity Compare</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2">First Text:</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-2">Second Text:</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            rows={4}
          />
        </div>

        <button
          onClick={compareTexts}
          disabled={loading || !text1 || !text2}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Compare Texts'}
        </button>

        {result && (
          <div className="mt-6 p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Results:</h2>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <>
                <p>Similarity Score: {result.similarity}</p>
                <p>Interpretation: {result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
