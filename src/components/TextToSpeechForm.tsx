"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const FormSchema = z.object({
  text: z.string({
    required_error: "Please type text for the model to use.",
  }),
});

interface TextToSpeechFormProps {
  handleGetAudio: (text: string) => void;
}

export function TextToSpeechForm({ handleGetAudio }: TextToSpeechFormProps) {
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setFormSubmitting(true);
    handleGetAudio(data.text);
    setFormSubmitting(false);
  }

  return (
    <div className="ml-8 mr-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={formSubmitting}
                    rows={6}
                    placeholder="Enter your text here..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The text to convert to speech.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={formSubmitting}>
            Generate Speech
          </Button>
        </form>
      </Form>
    </div>
  );
}
