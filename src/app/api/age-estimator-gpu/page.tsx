'use client'

import React, { useState, useEffect, useRef } from "react";
import { useAgeEstimator } from "@/components/camera";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw, Download, Info } from "lucide-react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


function AgeEstimatorContent() {
  const { 
    image, 
    detections,
    isLoading,
    isCaptured, 
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
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const nameParam = searchParams.get('name');
    if (nameParam) {
      setName(decodeURIComponent(nameParam));
    }
  }, [searchParams]);

  const handleDownload = () => {
    downloadImage(name);
  };

  const renderDetectionBoxes = () => {
    if (!imageDimensions.width || !imageDimensions.height) return null;
  
    const faceDetections = detections.filter(detection => detection.name === "face");
    
    return faceDetections.map((detection, index) => {
      const [x1, y1, x2, y2] = detection.location.x1y1x2y2;
      
      const scaleX = imageDimensions.width / 1920;
      const scaleY = imageDimensions.height / 1080;
      
      const boxStyle = {
        position: 'absolute',
        left: `${x1 * scaleX}px`,
        top: `${y1 * scaleY}px`,
        width: `${(x2 - x1) * scaleX}px`,
        height: `${(y2 - y1) * scaleY}px`,
        border: '2px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        pointerEvents: 'none',
      };
  
      const labelStyle = {
        position: 'absolute',
        bottom: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(4px)',
      };
  
      return (
        <div key={index} style={boxStyle as React.CSSProperties}>
          <div style={labelStyle as React.CSSProperties}>
            {Math.round(detection.age)} years old
          </div>
        </div>
      );
    });
  };  

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-4 gap-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Age Estimator
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
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
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-500 text-white">
              <DialogHeader>
                <DialogTitle>Age Estimator GPU</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>The Age Estimator uses advanced GPU-accelerated AI to detect faces and estimate ages with high accuracy.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Choose between camera or image upload</li>
                        <li>Position face(s) clearly in frame</li>
                        <li>Capture or upload your image</li>
                        <li>Click "Estimate Age" to process</li>
                        <li>View results displayed over detected faces</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Features</h4>
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
              
              {renderDetectionBoxes()}

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
  );
}

export default function AgeEstimator() {
  return <AgeEstimatorContent />;
}
