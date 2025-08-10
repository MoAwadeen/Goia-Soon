import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: 'Goia - Coming Soon to the US',
  description: 'Goia is coming soon to the US. Sign up to get notified when we launch.',
  icons: {
    icon: [
      { url: 'https://drive.google.com/uc?export=view&id=1jRz7HMV7vaRT9bJgdKm_PscgEUeR3zf0', sizes: 'any' },
    ],
    shortcut: 'https://drive.google.com/uc?export=view&id=1jRz7HMV7vaRT9bJgdKm_PscgEUeR3zf0',
    apple: 'https://drive.google.com/uc?export=view&id=1jRz7HMV7vaRT9bJgdKm_PscgEUeR3zf0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
