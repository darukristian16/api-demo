import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

interface Detection {
  name: string;
  name_prob: number;
  age: number;
  gender: string;
  gender_prob: number;
  location: {
    x1y1x2y2: number[];
  };
}

interface APIResponse {
  inference_time: number;
  data: Detection[];
  filename: string;
}

export const videoConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  facingMode: "user",
};

export const base64ToBlob = (base64String: string) => {
  const byteString = atob(base64String.split(",")[1]);
  const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
  const buffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(buffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeString });
};

export const useAgeEstimator = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  const standardizeImage = (sourceImage: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const scale = Math.min(1920 / img.naturalWidth, 1080 / img.naturalHeight);
          const scaledWidth = img.naturalWidth * scale;
          const scaledHeight = img.naturalHeight * scale;
          
          const x = (1920 - scaledWidth) / 2;
          const y = (1080 - scaledHeight) / 2;
          
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        }
      };
      img.src = sourceImage;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        const standardizedImage = await standardizeImage(imageDataUrl);
        setImage(standardizedImage);
        setIsCaptured(true);
        setDetections([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const CameraWithWatermark = () => (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-full object-contain transform scale-x-[-1]"
        onUserMediaError={(err) => console.error('Webcam error:', err)}
      />
    </div>
  );

  const capture = useCallback(async () => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, 1920, 1080);
        ctx.scale(-1, 1);
        ctx.drawImage(canvas, -canvas.width, 0);
        ctx.scale(-1, 1);

        const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
        const standardizedImage = await standardizeImage(imageSrc);
        setImage(standardizedImage);
        setIsCaptured(true);
        setDetections([]);
      }
    }
  }, [webcamRef]);

  const downloadImage = useCallback(async (name: string) => {
    if (image && detections.length > 0) {
      const imageWithBoxes = await createImageWithDetections(image, detections);
      const link = document.createElement('a');
      link.href = imageWithBoxes;
      link.download = `age-estimation-${name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [image, detections]);  

  const retryCapture = () => {
    setImage(null);
    setDetections([]);
    setIsCaptured(false);
  };

  const predictAge = async () => {
    if (!image) return;
    setIsLoading(true);

    try {
      const blob = base64ToBlob(image);
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const response = await axios.post<APIResponse>(
        process.env.NEXT_PUBLIC_AGE_ESTIMATOR_URL!,
        formData,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AGE_ESTIMATOR_API_KEY,
            accept: "application/json",
          },
        }
      );

      setDetections(response.data.data);
    } catch (error) {
      console.error("Error estimating age", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createImageWithDetections = (originalImage: string, detections: Detection[]): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Draw detection boxes
          detections
            .filter(detection => detection.name === "face")
            .forEach(detection => {
              const [x1, y1, x2, y2] = detection.location.x1y1x2y2;
              
              // Draw box with same style as display
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = 2;
              ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
              
              // Add box shadow effect
              ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
              ctx.shadowBlur = 4;
              ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
              ctx.shadowBlur = 0;
              
              // Draw label with matching style
              const text = `${Math.round(detection.age)} years old`;
              ctx.font = 'bold 16px Arial';
              const textWidth = ctx.measureText(text).width;
              
              const labelY = y2 + 30;
              const labelX = x1 + (x2 - x1) / 2 - textWidth / 2;
              
              // Label background
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(labelX - 10, labelY - 20, textWidth + 20, 25);
              
              // Label text
              ctx.fillStyle = 'white';
              ctx.fillText(text, labelX, labelY);
            });
          
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        }
      };
      img.src = originalImage;
    });
  };  

  return {
    webcamRef,
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
  };
};
