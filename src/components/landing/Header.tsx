import Link from "next/link"
import { Logo } from "@/components/icons/Logo"

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="#hero" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Goia</span>
        </Link>
        <nav className="hidden md:flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#screenshots" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Screenshots
          </Link>
          <Link href="/careers" className="text-sm font-medium hover:underline underline-offset-4">
            Careers
          </Link>
        </nav>
      </div>
    </header>
  )
}
