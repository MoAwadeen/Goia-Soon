import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export function Footer() {
  return (
    <footer className="w-full py-6 bg-muted">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-foreground" />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Goia. All rights reserved.</p>
        </div>
        <nav className="flex gap-4 sm:gap-6 text-sm items-center">
          <Link
            href="/careers"
            className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Careers
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
