import Image from 'next/image';

export default function WaitlistPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4 text-center overflow-hidden">
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
        className="absolute bottom-4 right-4 animate-spin-slow"
      />
    </div>
  );
}
