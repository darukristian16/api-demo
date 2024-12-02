'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { detectObjectsAPI } from '@/lib/objectDetection'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



interface Detection {
  [key: string]: {
    bbox: number[][];
    conf_score: number;
  }
}

interface DetectionResults {
  data: Detection[];
}

export default function ObjectDetection() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [results, setResults] = useState<DetectionResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setPreview(URL.createObjectURL(file))
      setResults(null) // Clear previous results
      
      // Draw preview image
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const maxWidth = 800
        const maxHeight = 600
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = height * ratio
        }
        if (height > maxHeight) {
          const ratio = maxHeight / height
          height = maxHeight
          width = width * ratio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
      }
    }
  }

  const drawDetections = useCallback(() => {
    if (!results || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = document.createElement('img')
    image.src = preview
    
    image.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      let width = image.width
      let height = image.height
      
      if (width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = height * ratio
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height
        height = maxHeight
        width = width * ratio
      }

      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(image, 0, 0, width, height)
      
      const scaleX = width / image.width
      const scaleY = height / image.height
      
      results.data.forEach((detection: Detection) => {
        const object = Object.keys(detection)[0]
        const bbox = detection[object].bbox
        const score = detection[object].conf_score
        
        const scaledX1 = bbox[0][0] * scaleX
        const scaledY1 = bbox[0][1] * scaleY
        const scaledX2 = bbox[1][0] * scaleX
        const scaledY2 = bbox[1][1] * scaleY
        
        ctx.strokeStyle = '#00FF00'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.rect(
          scaledX1,
          scaledY1,
          scaledX2 - scaledX1,
          scaledY2 - scaledY1
        )
        ctx.stroke()

        ctx.fillStyle = '#00FF00'
        ctx.font = '16px Arial'
        ctx.fillText(
          `${object} ${(score * 100).toFixed(1)}%`,
          scaledX1,
          scaledY1 - 5
        )
      })
    }
  }, [preview, results])

  useEffect(() => {
    if (results) {
      drawDetections()
    }
  }, [results, drawDetections])

  const detectObjects = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    try {
      const data = await detectObjectsAPI(selectedImage)
      setResults(data)
    } catch (error) {
      console.error('Error detecting objects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to format the detections for the table
  const getDetectionsList = () => {
    if (!results) return [];
    
    return results.data.map((detection) => {
      const object = Object.keys(detection)[0];
      const score = detection[object].conf_score;
      return {
        object,
        confidence: (score * 100).toFixed(1)
      };
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-50 dark:to-zinc-400">
            Object Detection
          </h1>
          <p className="mt-2 text-zinc-700 dark:text-zinc-500 text-sm max-w-lg mx-auto">
            Detect and analyze objects in your images using our advanced computer vision technology.
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
                <DialogTitle>Object Detection Service</DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">About</h4>
                      <p>Our object detection service identifies and locates multiple objects within images.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Upload an image</li>
                        <li>Click "Detect Objects"</li>
                        <li>View detected objects with bounding boxes</li>
                        <li>Check confidence scores in the table below</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors">
          <div className="space-y-4">
            <FiUpload className="mx-auto h-12 w-12 text-zinc-950 dark:text-gray-400" />
            <div className="flex text-sm text-zinc-600">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-zinc-950 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-500">
                <span>Upload an image</span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
          </div>
          {selectedImage && (
            <div className="mt-4 flex items-center justify-center text-sm text-zinc-600">
              <FiFile className="mr-2" />
              {selectedImage.name}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            onClick={detectObjects}
            disabled={!selectedImage || isLoading}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              !selectedImage || isLoading
                ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin" />}
            <span>{isLoading ? 'Detecting...' : 'Detect Objects'}</span>
          </Button>
        </div>

        {selectedImage && (
          <div className="mt-8">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {results && results.data.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Detected Objects</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDetectionsList().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">{item.object}</TableCell>
                    <TableCell>{item.confidence}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
