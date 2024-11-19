'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Zero-Shot Classification
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Classify text into custom categories without prior training.
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
                <DialogTitle>Zero-Shot Classification Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our Zero-Shot Classification service allows you to classify text into custom categories without pre-training.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Enter your text to classify</li>
                        <li>Add custom labels/categories</li>
                        <li>Click classify to process</li>
                        <li>View classification results</li>
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
            <label className="block mb-2 text-white">Text to Classify:</label>
            <textarea 
              className="w-full p-4 border rounded bg-zinc-900 text-white border-zinc-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter text to classify..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Label className="text-white">Classification Labels</Label>
              </div>
              <Button type="button" onClick={addLabel} variant="outline">
                Add Label
              </Button>
            </div>
            
            {labels.map((label, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Enter label"
                  value={label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  className="bg-zinc-900/50 text-white border-zinc-500"
                />
                <Button 
                  type="button" 
                  onClick={() => removeLabel(index)}
                  variant="destructive"
                  className="shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button 
            onClick={classifyText}
            disabled={loading || !text.trim() || labels.every(label => !label.trim())}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Processing...' : 'Classify Text'}</span>
          </Button>

          {result && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-white">Classification Results</h2>
              <div className="grid gap-4">
                {result.error ? (
                  <Card className="p-4 bg-zinc-900 border-zinc-700">
                    <p className="text-red-500">{result.error}</p>
                  </Card>
                ) : (
                  result.labels?.map((label, index) => (
                    <Card key={index} className="p-4 bg-zinc-900 border-zinc-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">{label}</h3>
                        <p className="text-white">
                          {result.scores && (result.scores[index] * 100).toFixed(2)}%
                        </p>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
