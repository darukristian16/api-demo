import { useState } from "react";

interface SummaryResult {
  response: string;
  inference_time?: number;
  error?: string;
}

export default function useSummarizer() {
  const [text, setText] = useState("");
  const [summaryDetail, setSummaryDetail] = useState(0.4);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const summarizeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_API_KEY || "",
          "accept": "application/json",
        },
        body: JSON.stringify({
          text_input: text,
          summary_detail: summaryDetail,
          additional_instruction: additionalInstructions,
        }),
      });

      const data: SummaryResult = await response.json();
      setResult(data);
    } catch {
      setResult({ response: "", error: "Error processing request" });
    }
    setLoading(false);
  };

  return {
    text,
    summaryDetail,
    additionalInstructions,
    result,
    loading,
    setText,
    setSummaryDetail,
    setAdditionalInstructions,
    summarizeText,
  };
}
