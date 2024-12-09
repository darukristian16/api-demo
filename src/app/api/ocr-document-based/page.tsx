'use client';

import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import useOCRDocument from "@/hooks/useOCRDocument";

export default function OCRPage() {
  const {
    file,
    result,
    loading,
    error,
    previewUrl,
    handleFileChange,
    handleSubmit,
  } = useOCRDocument();

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Document OCR
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
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
            <DialogContent className="sm:max-w-[425px] bg-zinc-50 border-zinc-800 dark:bg-zinc-950 border:dark-zinc-500 text-zinc-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>Document OCR Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Document OCR service uses advanced optical character recognition to extract text from various document formats.</p>
                    </div>
                      
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload your document (PDF, PNG, or JPG)</li>
                        <li>Ensure file size is under 10MB</li>
                        <li>Click "Extract Text" to process</li>
                        <li>View the extracted text below</li>
                        <li>Copy or save the results as needed</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">Features</h4>
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

        <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}} className="space-y-6">
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
            <div className="space-y-4">
              <FiUpload className="mx-auto h-12 w-12 text-zinc-950 dark:text-gray-400" />
              <div className="flex text-sm text-zinc-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-zinc-950 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
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

          <Button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loading || !file
                ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Processing...' : 'Extract Text'}</span>
          </Button>
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
              <div className="bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700 p-6 rounded-md shadow-lg">
                <pre className="whitespace-pre-wrap text-sm">
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

