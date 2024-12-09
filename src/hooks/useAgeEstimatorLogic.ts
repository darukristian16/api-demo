import { useState, useEffect, useRef } from "react";
import { useAgeEstimator } from "@/components/camera";
import { useSearchParams } from "next/navigation";
import { CSSProperties } from "react";

export interface Detection {
  name: string;
  location: { x1y1x2y2: [number, number, number, number] };
  age: number;
}

export default function useAgeEstimatorLogic() {
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
    handleFileUpload,
  } = useAgeEstimator();

  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [selectedTab, setSelectedTab] = useState<"camera" | "upload">("camera");
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) setName(decodeURIComponent(nameParam));
  }, [searchParams]);

  const handleDownload = () => downloadImage(name);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({
      width: img.clientWidth,
      height: img.clientHeight,
    });
  };

  const renderDetectionBoxes = () => {
    // Ensure image dimensions are available before rendering
    if (!imageDimensions.width || !imageDimensions.height) return [];

    // Global scale factors for all detections
    const scaleX = imageDimensions.width / 1920;
    const scaleY = imageDimensions.height / 1080;

    const faceDetections = detections.filter((d) => d.name === "face");

    return faceDetections.map((detection, index) => {
      const [x1, y1, x2, y2] = detection.location.x1y1x2y2;

      const boxStyle: CSSProperties = {
        position: "absolute",
        left: `${x1 * scaleX}px`,
        top: `${y1 * scaleY}px`,
        width: `${(x2 - x1) * scaleX}px`,
        height: `${(y2 - y1) * scaleY}px`,
        border: "2px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.3)",
        borderRadius: "4px",
        pointerEvents: "none",
      };

      const labelStyle: CSSProperties = {
        position: "absolute",
        bottom: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "12px",
        whiteSpace: "nowrap",
      };

      return {
        key: index,
        boxStyle,
        labelStyle,
        label: `${Math.round(detection.age)} years old`,
      };
    });
  };

  return {
    name,
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
    onImageLoad,
    renderDetectionBoxes,
    setImageDimensions,
  };
}
