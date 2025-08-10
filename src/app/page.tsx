import Image from 'next/image';
import { Twitter, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export default function WaitlistPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4 text-center overflow-hidden">
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Logo className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-4">
        <h1 className="animate-in fade-in zoom-in-95 duration-500 text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
          Wait for us, coming soon
        </h1>
      </div>
      <Image
        src="https://placehold.co/200x200.png"
        width="200"
        height="200"
        alt="Rotating graphic"
        data-ai-hint="geometric shape"
        className="absolute -bottom-24 -right-24 animate-spin-slow"
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6">
        <Link href="#" prefetch={false}>
          <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Twitter</span>
        </Link>
        <Link href="#" prefetch={false}>
          <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Instagram</span>
        </Link>
        <Link href="#" prefetch={false}>
          <Mail className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Email</span>
        </Link>
      </div>
    </div>
  );
}
