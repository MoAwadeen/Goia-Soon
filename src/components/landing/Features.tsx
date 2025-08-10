import { Zap, Cog, Wifi, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function Features() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Blazing Fast',
      description: 'Experience unparalleled speed and responsiveness. Goia is optimized for performance.',
    },
    {
      icon: <Cog className="h-8 w-8 text-primary" />,
      title: 'Powerful Tools',
      description: 'A rich feature set that gives you the tools you need to succeed, all in one place.',
    },
    {
      icon: <Wifi className="h-8 w-8 text-primary" />,
      title: 'Stay Connected',
      description: 'Work online or offline. Your data syncs automatically when you\'re back online.',
    },
    {
        icon: <Lock className="h-8 w-8 text-primary" />,
        title: 'Secure by Design',
        description: 'Your privacy and security are our top priorities. Built with end-to-end encryption.',
    }
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Goia is packed with features to make your life easier and more productive. Here's a glimpse of what you can expect.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-card">
              <CardHeader className="grid items-start gap-4 space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="pt-2 text-left text-base">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
