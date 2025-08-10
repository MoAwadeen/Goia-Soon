import Image from 'next/image';
import { Twitter, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

const placeholderImages = {
  background: 'https://drive.google.com/uc?export=view&id=1jeixPZMYCompO1rUxvQEXs26E_uYIsnD',
  rotatingGraphic: 'https://drive.google.com/uc?export=view&id=14VEQNyBBZJNPzPnTIFbDLJBjSrTZsSHf',
  logo: 'https://drive.google.com/uc?export=view&id=1CpgY00g6FnFXzUg78cWSMVtZYbzsp3qp',
};

export default function WaitlistPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center p-4 text-center overflow-hidden">
      <Image
        src={placeholderImages.background}
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="-z-10"
        data-ai-hint="abstract background"
      />
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Image src={placeholderImages.logo} width="96" height="96" alt="Logo" data-ai-hint="company logo" />
      </div>
      <div className="space-y-4 bg-background/50 backdrop-blur-sm p-8 rounded-lg">
        <h1 className="animate-in fade-in zoom-in-95 duration-500 text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
          Wait for us, coming soon
        </h1>
      </div>
      <Image
        src={placeholderImages.rotatingGraphic}
        width="200"
        height="200"
        alt="Rotating graphic"
        data-ai-hint="geometric shape"
        className="absolute -bottom-20 -right-20 animate-spin-slow"
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6">
        <Link href="#" prefetch={false}>
          <Twitter className="h-6 w-6 text-primary-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Twitter</span>
        </Link>
        <Link href="#" prefetch={false}>
          <Instagram className="h-6 w-6 text-primary-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Instagram</span>
        </Link>
        <Link href="#" prefetch={false}>
          <Mail className="h-6 w-6 text-primary-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Email</span>
        </Link>
      </div>
    </div>
  );
}
