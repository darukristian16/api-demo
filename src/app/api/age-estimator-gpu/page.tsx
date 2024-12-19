'use client'

import useAgeEstimatorLogic from "@/hooks/useAgeEstimatorLogic";
import React, { Suspense }  from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw, Download, Info } from "lucide-react";
import { FiUpload } from 'react-icons/fi';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExamplesCarousel } from '@/components/article-carousel';

function AgeEstimatorContent() {
  const {
    selectedTab,
    setSelectedTab,
    isCaptured,
    isLoading,
    image,
    detections,
    imageRef,
    CameraWithWatermark,
    capture,
    retryCapture,
    predictAge,
    handleFileUpload,
    handleDownload,
    renderDetectionBoxes,
    setImageDimensions,
  } = useAgeEstimatorLogic();

  return (
    <>
        <div className="flex flex-wrap items-center justify-center min-h-screen p-4 gap-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400 mb-6">
            Age Estimator
          </h1>
          <p className="mt-4 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Experience our advanced GPU-powered age estimation technology. Upload an image or use your camera to detect faces and estimate ages with high accuracy.
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              variant={selectedTab === "camera" ? "default" : "outline"}
              onClick={() => setSelectedTab("camera")}
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button 
              variant={selectedTab === "upload" ? "default" : "outline"}
              onClick={() => setSelectedTab("upload")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-50 border-zinc-800 dark:bg-zinc-950 border:dark-zinc-500 text-zinc-900 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-zinc-900 dark:text-zinc-50">Age Estimator GPU</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>The Age Estimator uses advanced GPU-accelerated AI to detect faces and estimate ages with high accuracy.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Choose between camera or image upload</li>
                        <li>Position face(s) clearly in frame</li>
                        <li>Capture or upload your image</li>
                        <li>Click &quot;Estimate Age&quot; to process</li>
                        <li>View results displayed over detected faces</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">Features</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Multi-face detection</li>
                        <li>Real-time processing</li>
                        <li>Age estimation in years</li>
                        <li>Download results</li>
                      </ul>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative bg-card min-h-[400px] rounded-lg overflow-hidden">
          {!isCaptured && selectedTab === "camera" && (
            <div className="w-full h-full">
              <CameraWithWatermark/>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <Button size="lg" onClick={capture}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {!isCaptured && selectedTab === "upload" && (
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
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-zinc-500">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          )}

          {isCaptured && (
            <div className="w-full relative" ref={imageRef}>
              <Image 
                src={image ?? ''}
                alt="Captured"
                width={1920}
                height={1080}
                className="w-full object-contain max-h-[80vh]"
                priority
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  setImageDimensions({
                    width: img.clientWidth,
                    height: img.clientHeight
                  });
                }}
              />
              
              {renderDetectionBoxes().map((box) => (
                <div key={box.key} style={box.boxStyle}>
                  <div style={box.labelStyle}>
                    {box.label}
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
                {detections.length === 0 && (
                  <Button onClick={predictAge} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Estimate Age'}
                  </Button>
                )}

                {detections.length > 0 && (
                  <>
                    <Button variant="outline" size="icon" onClick={retryCapture}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className='flex items-center justify-center mb-8 py-8'>
      <ExamplesCarousel />
    </div>
    </>
  );
}

export default function AgeEstimator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgeEstimatorContent />
    </Suspense>
  );
}
