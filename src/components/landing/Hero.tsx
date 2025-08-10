import Link from 'next/link';
import Image from 'next/image';
import { Apple } from 'lucide-react';
import { GooglePlayIcon } from '@/components/icons/GooglePlayIcon';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section id="hero" className="w-full py-20 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                Goia
              </h1>
              <p className="text-2xl font-medium tracking-tight sm:text-3xl text-foreground">
                Your Gateway to a New Experience
              </p>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover a seamless and intuitive platform designed to elevate your daily interactions. Download Goia now and unlock a world of possibilities.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="#" prefetch={false} className="flex items-center justify-center text-left">
                  <Apple className="h-7 w-7 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs">Download on the</p>
                    <p className="font-bold text-lg leading-tight">App Store</p>
                   </div>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="#" prefetch={false} className="flex items-center justify-center text-left">
                  <GooglePlayIcon className="h-7 w-7 mr-3 flex-shrink-0" />
                   <div>
                    <p className="text-xs">GET IT ON</p>
                    <p className="font-bold text-lg leading-tight">Google Play</p>
                   </div>
                </Link>
              </Button>
            </div>
          </div>
          <Image
            src="https://placehold.co/600x600.png"
            data-ai-hint="abstract gradient"
            width="600"
            height="600"
            alt="Hero"
            className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full"
          />
        </div>
      </div>
    </section>
  );
}
