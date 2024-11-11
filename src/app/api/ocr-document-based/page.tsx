'use client';

import { useState } from 'react';
import { FiUpload, FiFile, FiLoader } from 'react-icons/fi';
import { processOCRDocument } from '@/lib/ocrService';

export default function OCRPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);

        // Create image preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
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
          setResult(data);
        } catch (err: any) {
          setError(err.message || 'Error processing file. Please try again.');
          console.error('OCR Error:', err);
        } finally {
          setLoading(false);
        }
      };
    
  

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Document OCR</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <div className="space-y-4">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
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
            <p className="text-xs text-gray-500">
              PNG, JPG, PDF up to 10MB
            </p>
          </div>
          {file && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
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
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
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
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Extracted Text:</h2>
          <div className="bg-gray-900 p-6 rounded-md shadow-lg">
            <pre className="whitespace-pre-wrap text-sm text-white">
                {result["1"].data} {/* This will show only the extracted text */}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
