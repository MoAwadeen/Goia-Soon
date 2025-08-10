import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Screenshots } from '@/components/landing/Screenshots';
import { PersistentCta } from '@/components/landing/PersistentCta';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        <Hero />
        <Features />
        <Screenshots />
      </main>
      <Footer />
      <PersistentCta />
    </div>
  );
}
