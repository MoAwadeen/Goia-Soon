"use client"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/icons/Logo"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="#hero" className="flex items-center justify-center gap-2 hover:opacity-80 transition" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Goia</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
          <Link 
            href="#features" 
            className="text-sm font-medium hover:text-primary transition-colors relative group" 
            prefetch={false}
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            href="#screenshots" 
            className="text-sm font-medium hover:text-primary transition-colors relative group" 
            prefetch={false}
          >
            Screenshots
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            href="/careers" 
            className="text-sm font-medium hover:text-primary transition-colors relative group"
          >
            Careers
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-6 mt-8">
              <Link 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                prefetch={false}
              >
                Features
              </Link>
              <Link 
                href="#screenshots" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                prefetch={false}
              >
                Screenshots
              </Link>
              <Link 
                href="/careers" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
              >
                Careers
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
