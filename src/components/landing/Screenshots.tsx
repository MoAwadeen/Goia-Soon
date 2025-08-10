"use client"

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function Screenshots() {
    const screenshots = [
        { src: "https://placehold.co/375x812.png", hint: "app interface" },
        { src: "https://placehold.co/375x812.png", hint: "app dashboard" },
        { src: "https://placehold.co/375x812.png", hint: "user profile" },
        { src: "https://placehold.co/375x812.png", hint: "app settings" },
        { src: "https://placehold.co/375x812.png", hint: "chat screen" },
    ];

  return (
    <section id="screenshots" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">See Goia in Action</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Take a look at our beautiful and intuitive interface.
                </p>
            </div>
        </div>
        <div className="mt-12">
            <Carousel
                opts={{
                align: "start",
                loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
            >
                <CarouselContent>
                    {screenshots.map((screenshot, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-4">
                            <Card className="overflow-hidden border-8 border-gray-900 dark:border-gray-700 rounded-3xl shadow-lg aspect-[9/19.5]">
                                <CardContent className="p-0 h-full">
                                    <Image
                                        src={screenshot.src}
                                        data-ai-hint={screenshot.hint}
                                        alt={`App Screenshot ${index + 1}`}
                                        width={375}
                                        height={812}
                                        className="w-full h-full object-cover"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>
        </div>
      </div>
    </section>
  )
}
