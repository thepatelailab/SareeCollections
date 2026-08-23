'use client';

import { useMemo } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Flower2, Heart, ShieldCheck } from 'lucide-react';

export default function CrochetHubPage() {
  const { products, isLoading } = useAppContext();

  const crochetProducts = useMemo(() => {
    return products.filter(p => p.category === 'crochet');
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FDFCF0]">
      {/* Decorative Header */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10"><Flower2 className="h-20 w-20" /></div>
          <div className="absolute bottom-10 right-10"><Flower2 className="h-32 w-32" /></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusively Handcrafted</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-headline lowercase leading-tight mb-6">
            crochet hub
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto italic font-body">
            Where traditional stitching meets contemporary lifestyle. Discover heirloom-quality crochet art, from delicate home decor to bespoke fashion accessories.
          </p>
        </div>
      </section>

      {/* Feature Pills */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/5 flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-2xl"><Heart className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="font-bold text-sm">Artisan First</p>
              <p className="text-xs text-muted-foreground">Every stitch is handcrafted by our master partners.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/5 flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-2xl"><ShieldCheck className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="font-bold text-sm">Visual Integrity</p>
              <p className="text-xs text-muted-foreground">AI-enhanced catalog photos maintain 100% product accuracy.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-primary/5 flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-2xl"><Flower2 className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="font-bold text-sm">Heritage Modern</p>
              <p className="text-xs text-muted-foreground">Timeless techniques reimagined for your modern home.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl md:text-4xl font-headline text-primary lowercase whitespace-nowrap">live hub collection</h2>
          <div className="h-px w-full bg-primary/10"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-[2.5rem]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : crochetProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-primary/10">
            <Flower2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-headline text-xl">The hub is currently curating new crochet arrivals.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back shortly for handcrafted excellence.</p>
          </div>
        ) : (
          <ProductGrid products={crochetProducts} />
        )}
      </div>
    </div>
  );
}
