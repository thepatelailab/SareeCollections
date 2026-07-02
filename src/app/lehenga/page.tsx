import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LehengaPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-headline text-primary mb-4">
        Lehenga Collection
      </h1>
      <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
        Discover our stunning range of Lehengas. This section is coming soon!
      </p>
      <div className="relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden bg-muted">
        <img
          src="https://picsum.photos/seed/lehenga/1200/675"
          alt="Coming soon placeholder for Lehenga collection"
          className="w-full h-full object-cover"
          data-ai-hint="lehenga fashion"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h2 className="text-5xl font-bold text-white tracking-widest">
            COMING SOON
          </h2>
        </div>
      </div>
       <Button asChild size="lg" className="mt-8">
        <Link href="/">Back to Homepage</Link>
      </Button>
    </div>
  );
}
