import { useState, useRef, useEffect, useCallback } from "react";
import { detectObjectsAPI } from "@/lib/objectDetection";

export interface Detection {
  [key: string]: {
    bbox: number[][];
    conf_score: number;
  };
}

export interface DetectionResults {
  data: Detection[];
}

export default function useObjectDetection() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [results, setResults] = useState<DetectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload and draw preview
  const handleImageUpload = (file: File | null) => {
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null); // Clear previous results

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      };
    }
  };

  // Draw bounding boxes and detection results
  const drawDetections = useCallback(() => {
    if (!results || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = preview;

    image.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = image;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);

      const scaleX = width / image.width;
      const scaleY = height / image.height;

      results.data.forEach((detection: Detection) => {
        const object = Object.keys(detection)[0];
        const bbox = detection[object].bbox;
        const score = detection[object].conf_score;

        const scaledX1 = bbox[0][0] * scaleX;
        const scaledY1 = bbox[0][1] * scaleY;
        const scaledX2 = bbox[1][0] * scaleX;
        const scaledY2 = bbox[1][1] * scaleY;

        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(scaledX1, scaledY1, scaledX2 - scaledX1, scaledY2 - scaledY1);
        ctx.stroke();

        ctx.fillStyle = "#00FF00";
        ctx.font = "16px Arial";
        ctx.fillText(
          `${object} ${(score * 100).toFixed(1)}%`,
          scaledX1,
          scaledY1 - 5
        );
      });
    };
  }, [preview, results]);

  useEffect(() => {
    if (results) {
      drawDetections();
    }
  }, [results, drawDetections]);

  // Object detection API call
  const detectObjects = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const data = await detectObjectsAPI(selectedImage);
      setResults(data);
    } catch (error) {
      console.error("Error detecting objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format detections for the table
  const getDetectionsList = () => {
    if (!results) return [];
    return results.data.map((detection) => {
      const object = Object.keys(detection)[0];
      const score = detection[object].conf_score;
      return {
        object,
        confidence: (score * 100).toFixed(1),
      };
    });
  };

  return {
    canvasRef,
    selectedImage,
    preview,
    isLoading,
    results,
    handleImageUpload,
    detectObjects,
    getDetectionsList,
  };
}
