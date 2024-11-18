'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface LabelPair {
  label: string;
  description: string;
}

interface OCRResultItem {
    type: string;
    value: string;
    context: string;
}

interface OCRResponse {
    result: OCRResultItem[];
}

export default function OCRFreeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labelPairs, setLabelPairs] = useState<LabelPair[]>([
    { label: 'Name', description: 'ambil nama lengkap yang ada pada gambar' },
    { label: 'Date of Birth', description: 'ambil data yang berkenaan dengan tanggal lahir pada gambar' },
    { label: 'NIK', description: 'cari unique ID yang ada pada gambar' }
  ]);

  const handleAddLabel = () => {
    setLabelPairs([...labelPairs, { label: '', description: '' }]);
  };

  const handleLabelChange = (index: number, field: 'label' | 'description', value: string) => {
    const newLabelPairs = [...labelPairs];
    newLabelPairs[index][field] = value;
    setLabelPairs(newLabelPairs);
  };

  const handleRemoveLabel = (index: number) => {
    const newLabelPairs = labelPairs.filter((_, i) => i !== index);
    setLabelPairs(newLabelPairs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const userInput = labelPairs.reduce((acc, { label, description }) => {
      if (label && description) {
        acc[label] = description;
      }
      return acc;
    }, {} as Record<string, string>);

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('user_input', JSON.stringify(userInput));

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_OCR_FREE_FORM_URL!, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_OCR_FREE_FORM_API_KEY!,
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OCR Free Form</h1>
      
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Labels and Descriptions</Label>
            <Button type="button" onClick={handleAddLabel} variant="outline">
              Add Label
            </Button>
          </div>
          
          {labelPairs.map((pair, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label"
                value={pair.label}
                onChange={(e) => handleLabelChange(index, 'label', e.target.value)}
              />
              <Input
                placeholder="Description"
                value={pair.description}
                onChange={(e) => handleLabelChange(index, 'description', e.target.value)}
              />
              <Button 
                type="button" 
                onClick={() => handleRemoveLabel(index)}
                variant="destructive"
                className="shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Extract Text'}
        </Button>

        {result && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Extracted Information</h2>
            <div className="grid gap-4">
              {result.result.map((item, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-medium text-gray-700">{item.type}</h3>
                  <p className="mt-1 text-gray-600">{item.value}</p>
                  <p className="mt-1 text-sm text-gray-500">Context: {item.context}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
