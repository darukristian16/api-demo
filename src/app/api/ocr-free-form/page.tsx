'use client';

import React, { useState, useEffect } from 'react';
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
import useOCRFreeForm from "@/hooks/useOCRFreeForm";

export default function OCRFreeForm() {
  const {
    file,
    previewUrl,
    result,
    isLoading,
    labelPairs,
    handleFileChange,
    handleAddLabel,
    handleLabelChange,
    handleRemoveLabel,
    handleSubmit,
  } = useOCRFreeForm();

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            OCR Free Form
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
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
            <DialogContent className="sm:max-w-[425px] bg-zinc-50 border-zinc-800 dark:bg-zinc-950 border:dark-zinc-500 text-zinc-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>Free Form OCR Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our Free Form OCR service allows you to extract specific information using custom labels and descriptions.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
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

        <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}} className="space-y-6">
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
            <div className="space-y-4">
              <FiUpload className="mx-auto h-12 w-12 text-zinc-950 dark:text-gray-400" />
              <div className="flex text-sm text-zinc-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-zinc-950 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
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
              <h2 className="text-xl font-semibold mb-4">Preview:</h2>
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
                <Label>Label</Label>
                <Label>Description</Label>
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
                  className="bg-zinc-100 border-zinc-950 dark:bg-zinc-800/50 dark:border-zinc-500"
                />
                <Input
                  placeholder="Enter value"
                  value={pair.description}
                  onChange={(e) => handleLabelChange(index, 'description', e.target.value)}
                  className="bg-zinc-50 border-zinc-950 dark:bg-zinc-900/50 dark:border-zinc-700"
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
              isLoading ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin" />}
            <span>{isLoading ? 'Processing...' : 'Extract Text'}</span>
          </Button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold">Extracted Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Information</h3>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Context</h3>
              </div>
              {result.result.map((item, index) => (
                <React.Fragment key={index}>
                  <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                    <div>
                      <h3 className="font-medium">{item.type}</h3>
                      <p className="mt-1">{item.value}</p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-zinc-50 border-zinc-950 dark:bg-zinc-900 dark:border-zinc-700">
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.context}</p>
                    </div>
                  </Card>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
