'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useSpeechToText from "@/hooks/useSpeechToText";
import { ExamplesCarousel } from '@/components/article-carousel';

export default function SpeechToText() {
  const {
    file,
    isLoading,
    results,
    selectedFormat,
    setSelectedFormat,
    handleFileChange,
    handleSubmit,
    formatTime,
  } = useSpeechToText();

  const renderSelectedResult = () => {
    switch (selectedFormat) {
      case 'verbose_json':
        return results.verbose_json && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Verbose JSON Output</h2>
            <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="dark:text-zinc-300">Language: {results.verbose_json.language}</p>
              <p className="dark:text-zinc-300">Duration: {formatTime(results.verbose_json.duration)}</p>
              <p className="dark:text-zinc-300">Task: {results.verbose_json.task}</p>
              <h3 className="font-semibold mt-4 mb-2">Full Transcription</h3>
              <p className="whitespace-pre-wrap dark:text-zinc-300">{results.verbose_json.text}</p>
              {results.verbose_json.segments && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Segments</h3>
                  <div className="space-y-2">
                    {results.verbose_json.segments.map((segment, index) => (
                      <div key={index} className="border-t border-zinc-700 pt-2">
                        <p className="text-sm dark:text-zinc-400">
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </p>
                        <p className="dark:text-zinc-300">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      case 'json':
        return results.json && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">JSON Output</h2>
            <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
              <pre className="whitespace-pre-wrap dark:text-zinc-300">{JSON.stringify(results.json, null, 2)}</pre>
            </Card>
          </div>
        );
      case 'text':
        return results.text && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Text Output</h2>
            <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
              <p className="whitespace-pre-wrap dark:text-zinc-300">{results.text}</p>
            </Card>
          </div>
        );
      case 'srt':
        return results.srt && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">SRT Output</h2>
            <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
              <pre className="whitespace-pre-wrap font-mono text-sm dark:text-zinc-300">{results.srt}</pre>
            </Card>
          </div>
        );
      case 'vtt':
        return results.vtt && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">VTT Output</h2>
            <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
              <pre className="whitespace-pre-wrap font-mono text-sm dark:text-zinc-300">{results.vtt}</pre>
            </Card>
          </div>
        );
    }
  };  
  

  return (
    <>
        <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Speech to Text
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Convert your audio files into text with high accuracy transcription.
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
                <DialogTitle>Speech to Text Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Speech to Text service converts audio files into accurate text transcriptions.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload your audio file</li>
                        <li>Click transcribe to process</li>
                        <li>View all format outputs</li>
                        <li>Choose the format that suits your needs</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}} className="space-y-6">
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
            <div className="space-y-4">
              <FiUpload className="mx-auto h-12 w-12 text-zinc-950 dark:text-gray-400" />
              <div className="flex text-sm text-zinc-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-zinc-950 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-500">
                  <span>Upload audio file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    accept="audio/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              {file && (
                <div className="mt-4 flex items-center justify-center text-sm text-zinc-600">
                  <FiFile className="mr-2" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Audio Preview:</h2>
              <Card className="p-4 bg-zinc-50 border-zinc-500 dark:bg-zinc-900 dark:border-zinc-500">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <FiFile className="h-8 w-8 text-zinc-950 dark:text-zinc-400" />
                    <div>
                      <p>{file.name}</p>
                      <p className="text-sm text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <audio 
                    controls 
                    className="w-full"
                    src={URL.createObjectURL(file)}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Card>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !file}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              isLoading || !file ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin" />}
            <span>{isLoading ? 'Transcribing...' : 'Transcribe Audio'}</span>
          </Button>
        </form>

        <div className="mt-6">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full p-2 rounded-md border bg-zinc-100 border-zinc-950 dark:bg-zinc-800 dark:border-zinc-500"
          >
            <option value="verbose_json">Verbose JSON</option>
            <option value="json">JSON</option>
            <option value="text">Text</option>
            <option value="srt">SRT</option>
            <option value="vtt">VTT</option>
          </select>
        </div>

        {isLoading && (
            <div className="mt-6">
              <Card className="p-4 bg-zinc-300 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex items-center space-x-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </Card>
            </div>
          )}

        {Object.values(results).some(result => result !== null) && renderSelectedResult()}
      </div>
    </div>
    <div className='flex items-center justify-center mb-8 py-8'>
      <ExamplesCarousel />
    </div>
    </>
  );
}
