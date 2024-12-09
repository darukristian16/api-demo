import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function useMultimodalChat() {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isNewImage, setIsNewImage] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsNewImage(true);
      setQuestion('');
      setMessages([]);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsNewImage(false);

    let base64Image = '';
    if (file && isNewImage) {
      base64Image = await convertToBase64(file);
    }

    const userMessage: Message = {
      role: 'user',
      content: question,
      image: isNewImage ? base64Image || undefined : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const payload = {
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: [
            { text: msg.content, type: 'text' },
            ...(msg.image
              ? [{ image_url: { url: msg.image }, type: 'image_url' }]
              : []),
          ],
        })),
        max_tokens: 1000,
        temperature: 0,
        stream: false,
      };

      const response = await fetch(process.env.NEXT_PUBLIC_LMM_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LMM_API_KEY!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'There was an error processing your request.' },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setError(null), 10000);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    file,
    question,
    messages,
    isLoading,
    error,
    previewUrl,
    isNewImage,
    setQuestion,
    handleFileChange,
    handleSubmit,
  };
}
