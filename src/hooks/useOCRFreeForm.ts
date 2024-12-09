import { useState, useEffect } from "react";

interface LabelPair {
  label: string;
  description: string;
}

interface OCRResultItem {
  type: string;
  value: string;
  context: string;
}

interface OCRResponse {
  result: OCRResultItem[];
}

export default function useOCRFreeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labelPairs, setLabelPairs] = useState<LabelPair[]>([
    { label: "Name", description: "ambil nama lengkap yang ada pada gambar" },
    { label: "Date of Birth", description: "ambil data yang berkenaan dengan tanggal lahir pada gambar" },
    { label: "NIK", description: "cari unique ID yang ada pada gambar" },
  ]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle file upload and generate preview
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Add a new label pair
  const handleAddLabel = () => {
    setLabelPairs([...labelPairs, { label: "", description: "" }]);
  };

  // Update an existing label pair
  const handleLabelChange = (index: number, field: "label" | "description", value: string) => {
    const newLabelPairs = [...labelPairs];
    newLabelPairs[index][field] = value;
    setLabelPairs(newLabelPairs);
  };

  // Remove a label pair
  const handleRemoveLabel = (index: number) => {
    setLabelPairs(labelPairs.filter((_, i) => i !== index));
  };

  // Submit the form and call the API
  const handleSubmit = async () => {
    if (!file) return;

    const userInput = labelPairs.reduce((acc, { label, description }) => {
      if (label && description) acc[label] = description;
      return acc;
    }, {} as Record<string, string>);

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("user_input", JSON.stringify(userInput));

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_OCR_FREE_FORM_URL!, {
        method: "POST",
        headers: { "x-api-key": process.env.NEXT_PUBLIC_OCR_FREE_FORM_API_KEY! },
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    previewUrl,
    result,
    isLoading,
    labelPairs,
    handleFileChange,
    handleAddLabel,
    handleLabelChange,
    handleRemoveLabel,
    handleSubmit,
  };
}
