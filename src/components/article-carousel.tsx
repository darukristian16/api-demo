'use client';

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const examples = [
  {
    title: "Image Analysis",
    description: "Ask questions about any image and get detailed explanations",
    image: "/examples/image-analysis.jpg",
    url: "https://www.telkom.co.id/"  // Add URLs for each example
  },
  {
    title: "Visual QA",
    description: "Get answers to specific questions about image content",
    image: "/examples/visual-qa.jpg",
    url: "https://www.telkom.co.id/"  // Add URLs for each example
  },
  {
    title: "Object Detection",
    description: "Identify and locate objects within images",
    image: "/examples/object-detection.jpg",
    url: "https://www.telkom.co.id/"  // Add URLs for each example
  },
  {
    title: "Scene Understanding",
    description: "Understand complex scenes and their context",
    image: "/examples/scene.jpg",
    url: "https://www.telkom.co.id/"  // Add URLs for each example
  }
];

export function ExamplesCarousel() {
    const itemCount = examples.length;
    const getCardBasis = () => {
      if (itemCount === 1) return 'basis-full';
      if (itemCount === 2) return 'basis-full sm:basis-1/2';
      if (itemCount === 3) return 'basis-full sm:basis-1/2 lg:basis-1/3';
      return 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4';
    };
  
    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Featured Articles
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Explore the latest research and applications in multimodal AI
            </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: itemCount > 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {examples.map((example, index) => (
              <CarouselItem key={index} className={`pl-2 md:pl-4 ${getCardBasis()}`}>
                <a 
                  href={example.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-full block transition-transform hover:scale-[1.02]"
                >
                  <Card className="p-4 h-full flex flex-col cursor-pointer">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full aspect-video object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-2">{example.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-grow">
                      {example.description}
                    </p>
                  </Card>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          {itemCount > 1 && (
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>
      </div>
    );
}
    