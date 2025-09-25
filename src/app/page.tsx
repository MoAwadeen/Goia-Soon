import Image from 'next/image';
import { Linkedin, Instagram, Mail, Facebook } from 'lucide-react';
import Link from 'next/link';

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
        <Image src={placeholderImages.logo} width="128" height="128" alt="Logo" data-ai-hint="company logo" />
      </div>
      <div className="space-y-4">
        <h1 className="animate-in fade-in zoom-in-95 duration-500 text-4xl font-bold tracking-tighter text-primary drop-shadow-lg sm:text-5xl md:text-6xl">
                  Your Virtual Guide in Your Pocket \n
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
        <p className="text-primary font-semibold">Stay connected</p>
        <div className="flex items-center space-x-6">
          <Link href="https://www.linkedin.com/company/goiaapp/" target="_blank" prefetch={false}>
            <Linkedin className="h-6 w-6 text-primary hover:text-primary-foreground transition-colors" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="https://www.instagram.com/goia.app?igsh=eWdhdmlkNGh3YWox&utm_source=qr" target="_blank" prefetch={false}>
            <Instagram className="h-6 w-6 text-primary hover:text-primary-foreground transition-colors" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="https://www.facebook.com/profile.php?id=61563305546037" target="_blank" prefetch={false}>
            <Facebook className="h-6 w-6 text-primary hover:text-primary-foreground transition-colors" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="https://mail.google.com/mail/?view=cm&fs=1&to=youssef.talaat@goia.app" target="_blank" prefetch={false}>
            <Mail className="h-6 w-6 text-primary hover:text-primary-foreground transition-colors" />
            <span className="sr-only">Email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
