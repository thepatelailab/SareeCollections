
'use client';

import { useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ProductGrid } from '@/components/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Award, Star, Heart, Share2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Product, UserProfile } from '@/lib/types';
import Image from 'next/image';

export default function PartnerBoutiquePage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const partnerDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'users', id);
  }, [firestore, id]);

  const { data: partnerProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(partnerDocRef);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(collection(firestore, 'SareeCollection'), where('ownerId', '==', id));
  }, [firestore, id]);

  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery as any);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied!', description: 'Your boutique link is ready to share on social media.' });
    }
  };

  if (isProfileLoading || isProductsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const boutiqueName = partnerProfile?.businessName || `Heritage Boutique ${id.slice(-4)}`;
  const totalLikes = products?.reduce((acc, p) => acc + (p.likes || 0), 0) || 0;
  const totalShares = products?.reduce((acc, p) => acc + (p.shares || 0), 0) || 0;
  const heritageScore = totalLikes + totalShares;

  return (
    <div className="min-h-screen bg-[#F3F4ED]">
      <title>{`${boutiqueName} | SareeDukan Heritage Partner`}</title>
      <meta name="description" content={`Explore authentic handcrafted textiles from ${boutiqueName}. Discover unique heritage weaves and artisan crafts.`} />
      
      {/* Heritage Header */}
      <div className="relative bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden">
        {partnerProfile?.bannerUrl && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={partnerProfile.bannerUrl} 
              alt={boutiqueName} 
              fill 
              className="object-cover opacity-30" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95"></div>
          </div>
        )}

        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 mb-4">
            <Award className="h-5 w-5 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Heritage Partner</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-headline lowercase leading-tight">
            {boutiqueName}
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto italic font-body">
            Exclusively curated handloom collections from the heart of our weaving clusters.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 text-center min-w-[120px]">
              <p className="text-3xl font-black text-accent">{products?.length || 0}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Collections</p>
            </div>
            <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Heart className="h-4 w-4 fill-accent text-accent" />
                <p className="text-3xl font-black text-accent">{totalLikes}</p>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Total Appreciations</p>
            </div>
            <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Share2 className="h-4 w-4 text-accent" />
                <p className="text-3xl font-black text-accent">{totalShares}</p>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Style Shares</p>
            </div>
          </div>

          <div className="pt-8 flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="rounded-2xl h-14 px-8 bg-white/10 border-white/20 hover:bg-white/20 text-white font-headline text-lg"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-5 w-5" /> Copy Boutique Link
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-primary/10"></div>
          <div className="flex flex-col items-center">
             <h2 className="font-headline text-3xl text-primary lowercase px-4">Live Collection</h2>
             <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent-foreground mt-1">
               <Star className="h-3 w-3 fill-current" /> Global Ranking: Top {heritageScore > 100 ? '1%' : heritageScore > 50 ? '5%' : 'Textile Partner'}
             </div>
          </div>
          <div className="h-px flex-1 bg-primary/10"></div>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-primary/5">
             <Store className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-muted-foreground font-headline text-xl">This boutique is currently preparing a new collection.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
