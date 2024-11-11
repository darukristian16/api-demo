import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Button } from "@/components/ui/button";

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
  const [age, setAge] = useState<number | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isAgeEstimated, setIsAgeEstimated] = useState(false);
  const [downloadableImage, setDownloadableImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setImage(imageDataUrl);
        setIsCaptured(true);
        setIsAgeEstimated(false);
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

  // Update capture function to use native dimensions
  const capture = useCallback(() => {
    if (webcamRef.current && webcamRef.current.video) {
      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(canvas, -canvas.width, 0);
        ctx.scale(-1, 1);

        const imageSrc = canvas.toDataURL('image/jpeg');
        setImage(imageSrc);
        setIsCaptured(true);
        setIsAgeEstimated(false);
      }
    }
  }, [webcamRef]);

  const downloadImage = useCallback((name: string) => {
    if (downloadableImage) {
      const link = document.createElement('a');
      link.href = downloadableImage;
      link.download = `age-estimation-${name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadableImage]);

  const retryCapture = () => {
    setImage(null);
    setAge(null);
    setIsCaptured(false);
    setIsAgeEstimated(false);
  };

  const predictAge = async () => {
    if (!image) return;

    try {
      const blob = base64ToBlob(image);
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const response = await axios.post(
        process.env.NEXT_PUBLIC_AGE_ESTIMATOR_URL!,
        formData,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AGE_ESTIMATOR_API_KEY,
            accept: "application/json",
          },
        }
      );

      const predictedAge = response.data.data[0]?.age;
      setAge(predictedAge);
      setIsAgeEstimated(true);
      setDownloadableImage(image);
    } catch (error) {
      console.error("Error estimating age", error);
    }
  };

  return {
    webcamRef,
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
  };
};

