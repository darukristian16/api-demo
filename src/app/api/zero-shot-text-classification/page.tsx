'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FiLoader, FiInfo } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useZeroShot from "@/hooks/useZeroShot";
import { ExamplesCarousel } from '@/components/article-carousel';

export default function ZeroShotDemo() {
  const {
    text,
    labels,
    result,
    loading,
    setText,
    addLabel,
    removeLabel,
    updateLabel,
    classifyText,
  } = useZeroShot();

  return (
    <>
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Zero-Shot Classification
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
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
            <DialogContent className="sm:max-w-[425px] bg-zinc-50 border-zinc-800 dark:bg-zinc-950 border:dark-zinc-500 text-zinc-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>Zero-Shot Classification Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Zero-Shot Classification service allows you to classify text into custom categories without pre-training.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
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
            <label className="block mb-2">Text to Classify:</label>
            <textarea 
              className="w-full p-4 border rounded bg-zinc-50 border-zinc-500 dark:bg-zinc-900 dark:border-zinc-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter text to classify..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Label>Classification Labels</Label>
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
                  className="bg-zinc-50 border-zinc-500 dark:bg-zinc-900/50 dark:border-zinc-500"
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
              <h2 className="text-xl font-semibold">Classification Results</h2>
              <div className="grid gap-4">
                {result.error ? (
                  <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                    <p className="text-red-500">{result.error}</p>
                  </Card>
                ) : (
                  result.labels?.map((label, index) => (
                    <Card key={index} className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{label}</h3>
                        <p>
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
    <div className='flex items-center justify-center mb-8 py-8'>
      <ExamplesCarousel />
    </div>
    </>
  );
}
