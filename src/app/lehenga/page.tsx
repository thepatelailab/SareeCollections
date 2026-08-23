import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LehengaPage() {
  const lehengaPlaceholder = PlaceHolderImages.find(img => img.id === 'lehenga-coming-soon');

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-headline text-primary mb-4 lowercase">
        Lehenga Collection
      </h1>
      <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-muted-foreground italic font-body">
        Discover our stunning range of heritage Lehengas. This section is currently being curated.
      </p>
      
      <div className="relative aspect-video max-w-5xl mx-auto rounded-[3rem] overflow-hidden bg-muted shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-primary/5">
        {lehengaPlaceholder && (
          <Image
            src={lehengaPlaceholder.imageUrl}
            alt={lehengaPlaceholder.description}
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            data-ai-hint={lehengaPlaceholder.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 flex flex-col items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 mb-6">
            <h2 className="text-4xl md:text-7xl font-headline text-white tracking-[0.2em] uppercase">
              Coming Soon
            </h2>
          </div>
          <p className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mt-2">
            Exclusively Curated Handloom Pieces
          </p>
          <div className="w-24 h-1 bg-accent mt-8 rounded-full shadow-lg"></div>
        </div>
      </div>
      
      <Button asChild size="lg" className="mt-16 h-16 rounded-[2rem] px-12 font-headline text-xl bg-primary shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
        <Link href="/">Return to Marketplace</Link>
      </Button>
    </div>
  );
}
