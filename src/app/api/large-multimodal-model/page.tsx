'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function LargeMultimodalModel() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('tell me what you see on image');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const base64Image = await convertToBase64(file);

      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: question,
                type: "text"
              },
              {
                image_url: {
                  url: base64Image
                },
                type: "image_url"
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0,
        stream: false
      };

      const response = await fetch(process.env.NEXT_PUBLIC_LMM_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LMM_API_KEY!,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Large Multimodal Model</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="image">Upload Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the image"
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Analyze Image'}
        </Button>

        {result && (
          <Card className="p-4">
            <Label>Result</Label>
            <p className="mt-2 text-white whitespace-pre-wrap">{result}</p>
          </Card>
        )}
      </form>
    </div>
  );
}
