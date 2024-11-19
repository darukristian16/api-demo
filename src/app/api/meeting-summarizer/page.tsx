'use client';

import { useState } from 'react';
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
} from "@/components/ui/dialog"

interface TranscriptionResult {
  text: string;
}

interface SummaryResult {
  response: string;
  inference_time?: number;
}

export default function MeetingSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [summaryDetail, setSummaryDetail] = useState(0.4);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
  
    try {
      // First, transcribe the audio
      const formData = new FormData();
      formData.append('file', file);
      formData.append('response_format', 'text');
      formData.append('to_wav', 'yes');
      formData.append('language', 'english');
      formData.append('task', 'transcribe');
  
      const transcriptionResponse = await fetch(process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_URL!, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_API_KEY!,
        },
        body: formData,
      });
  
      const transcriptionData = await transcriptionResponse.json();
      const transcriptionText = transcriptionData.text || transcriptionData;
      setTranscription(transcriptionText);
  
      // Then, summarize the transcription
      const summaryResponse = await fetch(process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_URL!, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_API_KEY!,
        },
        body: JSON.stringify({
          text_input: transcriptionText,
          summary_detail: Number(summaryDetail),
          ...(additionalInstructions ? { additional_instruction: additionalInstructions } : { additional_instruction: "string" })
        }),
      });
  
      if (!summaryResponse.ok) {
        throw new Error(`Summary API error: ${summaryResponse.status}`);
      }
  
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Meeting Summarizer
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Convert your meeting recordings into concise, actionable summaries.
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
                <DialogTitle>Meeting Summarizer Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our Meeting Summarizer service transcribes your audio and generates concise summaries with key points.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload your meeting recording</li>
                        <li>Click process to transcribe and summarize</li>
                        <li>View both transcription and summary</li>
                        <li>Extract key insights from your meetings</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
            <div className="space-y-4">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-zinc-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-zinc-300 hover:text-zinc-500">
                  <span>Upload meeting recording</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
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
              <h2 className="text-xl font-semibold text-white mb-4">Audio Preview:</h2>
              <Card className="p-4 bg-zinc-900 border-zinc-700">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <FiFile className="h-8 w-8 text-zinc-400" />
                    <div>
                      <p className="text-white">{file.name}</p>
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
        

        <div className="space-y-4">
            <div>
                <label className="block mb-2 text-white">Summary Detail (0-1):</label>
                <input
                type="number"
                className="w-full p-2 border rounded bg-zinc-800 text-white border-zinc-500"
                value={summaryDetail}
                onChange={(e) => setSummaryDetail(Number(e.target.value))}
                step="0.1"
                min="0"
                max="1"
                />
            </div>
            <div>
                <label className="block mb-2 text-white">Additional Instructions (Optional):</label>
                <textarea
                    className="w-full p-2 border rounded bg-zinc-800 text-white border-zinc-500"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    rows={3}
                    placeholder="Any specific instructions for summarization..."
                />
            </div>
        </div>
          <Button 
            type="submit" 
            disabled={isLoading || !file}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              isLoading || !file ? 'bg-zinc-800 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin" />}
            <span>{isLoading ? 'Processing...' : 'Process Recording'}</span>
          </Button>
        </form>

        {transcription && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-white">Transcription</h2>
            <Card className="p-4 bg-zinc-900 border-zinc-700">
              <p className="whitespace-pre-wrap text-zinc-300">{transcription}</p>
            </Card>
          </div>
        )}

        {summary && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-white">Meeting Summary</h2>
            <Card className="p-4 bg-zinc-900 border-zinc-700">
              <p className="whitespace-pre-wrap text-zinc-300">{summary.response}</p>
              {summary.inference_time && (
                <p className="mt-4 text-sm text-zinc-400">
                  Processing time: {summary.inference_time.toFixed(2)} seconds
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
