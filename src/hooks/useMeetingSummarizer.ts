import { useState } from "react";

interface SummaryResult {
  response: string;
  inference_time?: number;
}

export default function useMeetingSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [summaryDetail, setSummaryDetail] = useState(0.4);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const handleFileChange = (selectedFile: File | null) => setFile(selectedFile);

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      // Transcription API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("response_format", "text");
      formData.append("to_wav", "yes");
      formData.append("language", "english");
      formData.append("task", "transcribe");

      const transcriptionResponse = await fetch(
        process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_URL!,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_API_KEY!,
          },
          body: formData,
        }
      );

      const transcriptionData = await transcriptionResponse.json();
      const transcriptionText = transcriptionData.text || transcriptionData;
      setTranscription(transcriptionText);

      // Summarization API
      const summaryResponse = await fetch(
        process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_URL!,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_LLAMA_SUMMARIZE_API_KEY!,
          },
          body: JSON.stringify({
            text_input: transcriptionText,
            summary_detail: Number(summaryDetail),
            additional_instruction: additionalInstructions || "string",
          }),
        }
      );

      if (!summaryResponse.ok) {
        throw new Error(`Summary API error: ${summaryResponse.status}`);
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    isLoading,
    transcription,
    summary,
    summaryDetail,
    additionalInstructions,
    setSummaryDetail,
    setAdditionalInstructions,
    handleFileChange,
    handleSubmit,
  };
}
