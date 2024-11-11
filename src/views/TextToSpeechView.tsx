'use client'

import { generateSpeech } from "@/lib/textToSpeechService";
import Loader from "@/components/ui/Loader";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
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

const soundModels = [
  {
    value: "ID-TLKM-IRMA",
    label: "Irma",
  },
  {
    value: "ID-X-GIRL-1",
    label: "Girl Voice",
  },
  {
    value: "ID-X-MEN-1",
    label: "Male Voice 1",
  },
  {
    value: "ID-X-MEN-2",
    label: "Male Voice 2",
  },
  {
    value: "ID-X-MEN-3",
    label: "Male Voice 3",
  },
];

const FormSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export default function TextToSpeechView() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const audioUrl = await generateSpeech(data.text, value);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="text-center py-16">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-white">
          Telkom Text to Speech
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Left Box */}
        <div className="bg-gray-800 rounded-3xl p-12 flex flex-col">
          <div className="mb-12">
            <label className="block text-white text-2xl font-semibold mb-6">Sound Model</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-16 text-lg"
                >
                  {value
                    ? soundModels.find((model) => model.value === value)?.label
                    : "Select your preferred sound model..."}
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search sound models..." className="h-14 text-lg" />
                  <CommandList>
                    <CommandEmpty>No sound model found.</CommandEmpty>
                    <CommandGroup>
                      {soundModels.map((model) => (
                        <CommandItem
                          key={model.value}
                          value={model.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue)
                            setOpen(false)
                          }}
                          className="py-4 text-lg"
                        >
                          <Check
                            className={cn(
                              "mr-3 h-5 w-5",
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex-1 flex flex-col">
                    <FormLabel className="text-white text-2xl font-semibold mb-6">Text Input</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type or paste your text here..."
                        className="flex-1 text-lg p-6 min-h-[250px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 mt-4 text-base" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-8 h-14 text-lg font-semibold">
                Generate Speech
              </Button>
            </form>
          </Form>
        </div>

        {/* Right Box */}
        <div className="bg-gray-200 rounded-3xl flex items-center justify-center p-16">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader />
              <p className="mt-6 text-lg text-gray-600">Generating audio...</p>
            </div>
          ) : (
            <>
              {audioUrl ? (
                <div className="w-full max-w-4xl">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Generated Audio</h2>
                  <audio controls className="w-full h-20">
                    <source id="audioSource" type="audio/wav" src={audioUrl} />
                  </audio>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">Your generated audio will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

