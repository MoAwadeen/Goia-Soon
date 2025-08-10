"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';

export function PersistentCta() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm border-t transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="hidden sm:inline font-semibold text-lg">Get Goia Now</span>
                </div>
                <Button asChild>
                    <Link href="#" prefetch={false}>
                        <Apple className="mr-2 h-4 w-4" /> Download Now
                    </Link>
                </Button>
            </div>
        </div>
    );
}
