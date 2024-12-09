import { useState } from "react";

interface SentimentResponse {
  label: string;
  score: number;
}

export default function useSentimentAnalysis() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    if (!text) return;

    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SENTIMENT_ANALYSIS_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_SENTIMENT_ANALYSIS_API_KEY!,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze sentiment");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    text,
    result,
    loading,
    setText,
    analyzeSentiment,
  };
}
