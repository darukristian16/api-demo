'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Word {
  word: string;
  start: number;
  end: number;
  probability: number;
}

interface Segment {
  id: number;
  text: string;
  start: number;
  end: number;
  words: Word[];
}

interface VerboseJsonResult {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: Segment[];
}

interface JsonResult {
  text: string;
}

type TranscriptionResult = VerboseJsonResult | JsonResult | string;

export default function SpeechToText() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('verbose_json');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('response_format', format);
    formData.append('to_wav', 'true');

    try {
      const response = await fetch('https://telkom-ai-dag.api.apilogy.id/Speech_To_Text/0.0.2/inference', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_API_KEY!,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (typeof seconds !== 'number') return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderResult = () => {
    if (!result) return null;

    switch (format) {
      case 'verbose_json': {
        const verboseResult = result as VerboseJsonResult;
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-2">Summary</h2>
              <p>Language: {verboseResult.language}</p>
              <p>Duration: {formatTime(verboseResult.duration)}</p>
              <p>Task: {verboseResult.task}</p>
            </Card>

            <Card className="p-4">
              <h2 className="font-semibold mb-2">Full Transcription</h2>
              <p className="whitespace-pre-wrap">{verboseResult.text}</p>
            </Card>

            {verboseResult.segments && verboseResult.segments.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold">Segments</h2>
                {verboseResult.segments.map((segment) => (
                  <Card key={segment.id} className="p-4">
                    <p className="text-sm text-gray-500">
                      {formatTime(segment.start)} - {formatTime(segment.end)}
                    </p>
                    <p className="mt-1">{segment.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'json': {
        const jsonResult = result as JsonResult;
        return (
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Transcription</h2>
            <p className="whitespace-pre-wrap">{jsonResult.text}</p>
          </Card>
        );
      }

      case 'text':
      case 'srt':
      case 'vtt': {
        return (
          <Card className="p-4">
            <h2 className="font-semibold mb-2">
              {format.toUpperCase()} Output
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
              {result as string}
            </pre>
          </Card>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Speech to Text</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="audio">Upload Audio File</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Response Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verbose_json">Verbose JSON</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="srt">SRT</SelectItem>
              <SelectItem value="vtt">VTT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
        </Button>

        {renderResult()}
      </form>
    </div>
  );
}
