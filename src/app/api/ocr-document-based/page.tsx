'use client';

import { useState, useEffect } from 'react';
import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import { processOCRDocument } from '@/lib/ocrService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface OCRResult {
  [key: string]: {
    data: string;
  }
}

export default function OCRPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<OCRResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
      // Cleanup function to revoke object URLs
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    const generatePreview = async (file: File) => {
      if (file.type === 'application/pdf') {
        const fileArrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context!,
          viewport: viewport
        }).promise;
        
        const previewUrl = canvas.toDataURL('image/png');
        setPreviewUrl(previewUrl);
      } else {
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
      }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        setFile(selectedFile);
        await generatePreview(selectedFile);
        setError(null);
        setResult(null);
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) {
        setError('Please select a file');
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const data = await processOCRDocument(file);
        if (typeof data === 'string') {
          setResult({ text: { data } });
        } else if (data && typeof data === 'object') {
          setResult(data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error processing file. Please try again.';
        setError(errorMessage);
        console.error('OCR Error:', err);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Document OCR
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Extract text from your documents using our advanced OCR technology. Support for multiple file formats with high accuracy text recognition.
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
                <DialogTitle>Document OCR Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our Document OCR service uses advanced optical character recognition to extract text from various document formats.</p>
                    </div>
                      
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload your document (PDF, PNG, or JPG)</li>
                        <li>Ensure file size is under 10MB</li>
                        <li>Click "Extract Text" to process</li>
                        <li>View the extracted text below</li>
                        <li>Copy or save the results as needed</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Features</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Multiple format support</li>
                        <li>High accuracy text extraction</li>
                        <li>Fast processing</li>
                        <li>Support for multiple languages</li>
                      </ul>
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
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-zinc-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-center text-sm text-zinc-600">
                <FiFile className="mr-2" />
                {file.name}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading || !file
                ? 'bg-zinc-800 cursor-not-allowed'
                : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Processing...' : 'Extract Text'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {result && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Extracted Text:</h2>
              
              {/* Display preview image */}
              {previewUrl && (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Processed document" 
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}

              {/* Extracted text */}
              <div className="bg-zinc-900 p-6 rounded-md shadow-lg">
              <pre className="whitespace-pre-wrap text-sm text-white">
                {String(typeof result === 'string' 
                  ? result 
                  : result.data || Object.values(result)[0]?.data || 'No text extracted')}
              </pre>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

