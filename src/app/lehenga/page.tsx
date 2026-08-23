import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LehengaPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl md:text-6xl font-headline text-primary mb-6 lowercase">
        Lehenga Collection
      </h1>
      <p className="text-lg md:text-xl mb-16 max-w-2xl mx-auto text-muted-foreground italic font-body">
        Discover our stunning range of heritage Lehengas. This section is currently being curated by our artisan partners.
      </p>
      
      <div className="max-w-4xl mx-auto p-16 md:p-24 rounded-[3rem] bg-muted/30 border border-primary/5 flex flex-col items-center justify-center">
        <div className="bg-white/50 backdrop-blur-sm px-12 py-8 rounded-[2.5rem] border border-primary/10 mb-8 shadow-sm">
          <h2 className="text-4xl md:text-7xl font-headline text-primary tracking-[0.2em] uppercase">
            Coming Soon
          </h2>
        </div>
        <p className="text-primary/40 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mt-4">
          Exclusively Curated Handloom Pieces
        </p>
        <div className="w-24 h-0.5 bg-accent mt-12 rounded-full opacity-30"></div>
      </div>
      
      <div className="mt-20">
        <Button asChild size="lg" className="h-16 rounded-[2rem] px-12 font-headline text-xl bg-primary shadow-xl transition-all hover:-translate-y-1 active:scale-95">
          <Link href="/">Return to Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
