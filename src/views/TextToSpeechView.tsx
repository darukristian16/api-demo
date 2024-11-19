'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FiUpload, FiFile, FiLoader, FiInfo } from 'react-icons/fi';
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { generateSpeech } from "@/lib/textToSpeechService";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const soundModels = [
  { value: "ID-TLKM-IRMA", label: "Irma" },
  { value: "ID-X-GIRL-1", label: "Girl Voice" },
  { value: "ID-X-MEN-1", label: "Male Voice 1" },
  { value: "ID-X-MEN-2", label: "Male Voice 2" },
  { value: "ID-X-MEN-3", label: "Male Voice 3" },
];

export default function TextToSpeechView() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !value) return;
    
    setIsLoading(true);
    try {
      const audioUrl = await generateSpeech(text, value);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center min-h-screen p-16 gap-8">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="md:text-7xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-zinc-50 to-zinc-400">
            Text to Speech
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Convert your text into natural-sounding speech with multiple voice options.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FiInfo className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-500 text-white">
              <DialogHeader>
                <DialogTitle>Text to Speech Service</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">About</h4>
                      <p>Our Text to Speech service converts text into natural-sounding speech using advanced AI technology.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How to Use</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Select a voice model</li>
                        <li>Enter your text</li>
                        <li>Click generate to create audio</li>
                        <li>Play or download the generated audio</li>
                      </ol>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-white">Voice Model</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-12"
                >
                  {value
                    ? soundModels.find((model) => model.value === value)?.label
                    : "Select your preferred voice..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search voices..." />
                  <CommandList>
                    <CommandEmpty>No voice found.</CommandEmpty>
                    <CommandGroup>
                      {soundModels.map((model) => (
                        <CommandItem
                          key={model.value}
                          value={model.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === model.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {model.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block mb-2 text-white">Text Input</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              className="w-full p-4 border rounded bg-zinc-950 text-white border-zinc-500"
              rows={6}
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading || !text.trim() || !value}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 ${
              isLoading || !text.trim() || !value ? 'bg-zinc-500 cursor-not-allowed' : 'bg-zinc-300 hover:bg-zinc-500'
            } text-black transition-colors`}
          >
            {isLoading && <FiLoader className="animate-spin mr-2" />}
            <span>{isLoading ? 'Generating...' : 'Generate Speech'}</span>
          </Button>
        </form>

        {isLoading && (
          <div className="mt-6">
            <Card className="p-4 bg-zinc-900 border-zinc-700">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {audioUrl && !isLoading && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-white">Generated Audio</h2>
            <Card className="p-4 bg-zinc-900 border-zinc-700">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
