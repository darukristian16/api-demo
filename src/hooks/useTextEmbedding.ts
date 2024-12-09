import { useState } from "react";

interface EmbeddingResult {
  similarity?: string;
  message?: string;
  error?: string;
  embeddings?: number[];
}

export default function useTextEmbedding() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const getEmbedding = async (text: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_TEXT_EMBEDDING_URL}/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_TEXT_EMBEDDING_API_KEY || "",
        accept: "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return { embedding: data.embeddings };
  };

  const calculateCosineSimilarity = (vec1: number[], vec2: number[]) => {
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (mag1 * mag2);
  };

  const compareTexts = async () => {
    setLoading(true);
    try {
      const embedding1 = await getEmbedding(text1);
      const embedding2 = await getEmbedding(text2);

      if (!embedding1?.embedding || !embedding2?.embedding) {
        throw new Error("Invalid embedding response format");
      }

      const similarity = calculateCosineSimilarity(embedding1.embedding, embedding2.embedding);

      setResult({
        similarity: similarity.toFixed(4),
        message:
          similarity > 0.8
            ? "Very Similar!"
            : similarity > 0.5
            ? "Somewhat Similar"
            : "Not Very Similar",
      });
    } catch (error) {
      console.error("API Error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Error connecting to embedding service",
      });
    }
    setLoading(false);
  };

  return {
    text1,
    text2,
    result,
    loading,
    setText1,
    setText2,
    compareTexts,
  };
}
