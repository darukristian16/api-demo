import { useState } from "react";

interface Word {
  word: string;
  start: number;
  end: number;
  probability: number;
}

interface Segment {
  id: number;
  text: string;
  start: number;
  end: number;
  words: Word[];
}

interface VerboseJsonResult {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: Segment[];
}

interface JsonResult {
  text: string;
}

interface TranscriptionResults {
  verbose_json: VerboseJsonResult | null;
  json: JsonResult | null;
  text: string | null;
  srt: string | null;
  vtt: string | null;
}

export default function useSpeechToText() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TranscriptionResults>({
    verbose_json: null,
    json: null,
    text: null,
    srt: null,
    vtt: null,
  });
  const [selectedFormat, setSelectedFormat] = useState<string>("verbose_json");

  const formatTime = (seconds: number) => {
    if (typeof seconds !== "number") return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const formats = ["verbose_json", "json", "text", "srt", "vtt"];
      const responses = await Promise.all(
        formats.map(async (format) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("response_format", format);
          formData.append("to_wav", "yes");
          formData.append("language", "english");
          formData.append("task", "transcribe");

          const response = await fetch(process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_URL!, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_API_KEY!,
            },
            body: formData,
          });

          const data = await response.json();
          return { format, data };
        })
      );

      const newResults = responses.reduce((acc, { format, data }) => {
        acc[format as keyof TranscriptionResults] = data;
        return acc;
      }, {} as TranscriptionResults);

      setResults(newResults);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    isLoading,
    results,
    selectedFormat,
    setSelectedFormat,
    handleFileChange,
    handleSubmit,
    formatTime,
  };
}
