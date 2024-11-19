'use client';

import { useState, useEffect } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labelPairs, setLabelPairs] = useState<LabelPair[]>([
    { label: 'Name', description: 'ambil nama lengkap yang ada pada gambar' },
    { label: 'Date of Birth', description: 'ambil data yang berkenaan dengan tanggal lahir pada gambar' },
    { label: 'NIK', description: 'cari unique ID yang ada pada gambar' }
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

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
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            OCR Free Form
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Extract specific information from documents using custom labels and descriptions.
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
                <DialogTitle>Free Form OCR Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our Free Form OCR service allows you to extract specific information using custom labels and descriptions.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload your document</li>
                        <li>Add custom labels and descriptions</li>
                        <li>Click extract to process</li>
                        <li>View extracted information below</li>
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
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
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

          {previewUrl && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Preview:</h2>
              <div className="relative inline-block">
                <img 
                  src={previewUrl} 
                  alt="Document preview" 
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Label className="text-white">Label</Label>
                <Label className="text-white">Description</Label>
              </div>
              <Button type="button" onClick={handleAddLabel} variant="outline">
                Add Label
              </Button>
            </div>
            
            {labelPairs.map((pair, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Enter label"
                  value={pair.label}
                  onChange={(e) => handleLabelChange(index, 'label', e.target.value)}
                  className="bg-zinc-800 text-white border-zinc-500"
                />
                <Input
                  placeholder="Enter value"
                  value={pair.description}
                  onChange={(e) => handleLabelChange(index, 'description', e.target.value)}
                  className="bg-zinc-800 text-white border-zinc-500"
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

          <Button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              isLoading ? 'bg-zinc-800 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin" />}
            <span>{isLoading ? 'Processing...' : 'Extract Text'}</span>
          </Button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-white">Extracted Information</h2>
            <div className="grid gap-4">
              {result.result.map((item, index) => (
                <Card key={index} className="p-4 bg-zinc-900 border-zinc-700">
                  <h3 className="font-medium text-white">{item.type}</h3>
                  <p className="mt-1 text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-zinc-400">Context: {item.context}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
