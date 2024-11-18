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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Object Detection</h1>
      
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          
          <div className="relative mb-4 max-w-[800px] max-h-[600px]">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
          </div>

          <button
            onClick={detectObjects}
            disabled={!selectedImage || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? 'Detecting...' : 'Detect Objects'}
          </button>
        </div>

        {results && results.data.length > 0 && (
          <div className="max-w-[800px] mx-auto">
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
