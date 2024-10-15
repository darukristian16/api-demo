'use client'

import { TextToSpeechForm } from "@/components/TextToSpeechForm";
import Loader from "@/components/ui/Loader";
import { useState } from "react";

export default function TextToSpeechView() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGetAudio = async (text: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("https://telkom-ai-dag.api.apilogy.id/Text_To_Speech/0.0.1/v1", {
        method: "POST",
        headers: {
          'accept': '*/*',
          'x-api-key': "evDH5X140AYLrPf8D6QC1ZQh9o031LPg",
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio data.");
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 p-4">
        <div className="ml-8 mr-8 mt-4 mb-4 text-xl">
          <h1>Telkom Text to Speech</h1>
        </div>
        <TextToSpeechForm handleGetAudio={handleGetAudio} />
      </div>
      <div className="w-full md:w-2/3 p-4 bg-gray-200 h-screen">
        <div className="h-full flex justify-center items-center">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {audioUrl && (
                <audio controls>
                  <source id="audioSource" type="audio/wav" src={audioUrl} />
                </audio>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
