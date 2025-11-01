import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const placeholderImages = {
  background: 'https://drive.google.com/uc?export=view&id=1jeixPZMYCompO1rUxvQEXs26E_uYIsnD',
  rotatingGraphic: 'https://drive.google.com/uc?export=view&id=14VEQNyBBZJNPzPnTIFbDLJBjSrTZsSHf',
  logo: 'https://drive.google.com/uc?export=view&id=1CpgY00g6FnFXzUg78cWSMVtZYbzsp3qp',
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src={placeholderImages.background}
        alt="Background"
        fill
        style={{ objectFit: 'cover' }}
        className="-z-10"
        data-ai-hint="abstract background"
      />
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Image src={placeholderImages.logo} width="48" height="48" alt="Logo" data-ai-hint="company logo" />
        </Link>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-24 lg:px-8">
        {children}
      </div>
      <Image
        src={placeholderImages.rotatingGraphic}
        width="200"
        height="200"
        alt="Rotating graphic"
        data-ai-hint="geometric shape"
        className="absolute -bottom-20 -right-20 animate-spin-slow pointer-events-none"
      />
    </div>
  )
}
