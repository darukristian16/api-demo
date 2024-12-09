import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { processOCRDocument } from "@/lib/ocrService";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface OCRResult {
  [key: string]: {
    data: string;
  };
}

export default function useOCRDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Generate preview for images or PDFs
  const generatePreview = async (file: File) => {
    if (file.type === "application/pdf") {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      const previewUrl = canvas.toDataURL("image/png");
      setPreviewUrl(previewUrl);
    } else {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleFileChange = async (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      await generatePreview(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await processOCRDocument(file);
      if (typeof data === "string") {
        setResult({ text: { data } });
      } else if (data && typeof data === "object") {
        setResult(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error processing file. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    result,
    loading,
    error,
    previewUrl,
    handleFileChange,
    handleSubmit,
  };
}
