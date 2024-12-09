import { useState } from "react";

interface ClassificationResult {
  labels?: string[];
  scores?: number[];
  error?: string;
}

export default function useZeroShot() {
  const [text, setText] = useState("");
  const [labels, setLabels] = useState([""]);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const addLabel = () => {
    setLabels([...labels, ""]);
  };

  const removeLabel = (index: number) => {
    const newLabels = labels.filter((_, i) => i !== index);
    setLabels(newLabels);
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const classifyText = async () => {
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ZERO_SHOT_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ZERO_SHOT_API_KEY || "",
          accept: "application/json",
        },
        body: JSON.stringify({
          text,
          labels: labels.filter((label) => label.trim() !== ""),
          is_multilabel: true,
        }),
      });

      const data: ClassificationResult = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Error processing request" });
    } finally {
      setLoading(false);
    }
  };

  return {
    text,
    labels,
    result,
    loading,
    setText,
    addLabel,
    removeLabel,
    updateLabel,
    classifyText,
  };
}
