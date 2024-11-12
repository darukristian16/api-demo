'use client'

import React, { useState, useEffect, Suspense } from "react";
import { useAgeEstimator } from "@/components/camera";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw, Download } from "lucide-react";
import Image from 'next/image';

function AgeEstimatorContent() {
  const { 
    image, 
    age, 
    isCaptured, 
    isAgeEstimated, 
    capture, 
    retryCapture, 
    predictAge, 
    CameraWithWatermark, 
    downloadImage, 
    handleFileUpload 
  } = useAgeEstimator();

  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [selectedTab, setSelectedTab] = useState("camera");

  useEffect(() => {
    const nameParam = searchParams.get('name');
    if (nameParam) {
      setName(decodeURIComponent(nameParam));
    }
  }, [searchParams]);

  const handleDownload = () => {
    downloadImage(name);
  };

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-4 gap-8">
      <div className="w-full max-w-3xl">
        <div className="flex gap-2 mb-4">
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
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-center p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput">
                  <Button asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </span>
                  </Button>
                </label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supported formats: JPG, PNG
                </p>
              </div>
            </div>
          )}

          {isCaptured && (
            <div className="w-full relative">
              <Image 
                src={image ?? ''}
                alt="Captured"
                width={800}
                height={600}
                className="w-full object-contain max-h-[80vh]"
                priority
              />
              
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
                {!isAgeEstimated && (
                  <Button onClick={predictAge}>
                    Estimate Age
                  </Button>
                )}

                {isAgeEstimated && (
                  <>
                    <div className="text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                      Age: <span className="text-2xl font-bold">{age}</span>
                    </div>
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
  );
}

export default function AgeEstimator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgeEstimatorContent />
    </Suspense>
  );
}
