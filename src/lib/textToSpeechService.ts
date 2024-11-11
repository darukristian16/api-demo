export const generateSpeech = async (text: string, model: string) => {
  // Add this debug section
  console.log('Environment Variables Check:');
  console.log('API URL:', process.env.NEXT_PUBLIC_TTS_API_URL);
  console.log('API Key exists:', !!process.env.NEXT_PUBLIC_TTS_API_KEY);

  const response = await fetch(process.env.NEXT_PUBLIC_TTS_API_URL!, {
      method: "POST",
      headers: {
          'accept': '*/*',
          'x-api-key': process.env.NEXT_PUBLIC_TTS_API_KEY!,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          speaker_name: model,
          input_text: text,
      }),
  });

  if (!response.ok) {
      throw new Error("Failed to fetch audio data.");
  }

  const data = await response.arrayBuffer();
  const blob = new Blob([data], { type: "audio/wav" });
  return URL.createObjectURL(blob);
};
