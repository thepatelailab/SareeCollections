
'use client';
import { useState, useMemo } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { useAppContext } from '@/components/providers/app-provider';
import { AddSareeDialog } from '@/components/add-saree-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link';
import Image from 'next/image';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { products, isAdmin, isLoading, heroImageUrl, isHeroImageLoading, sareeVarieties } = useAppContext();
  
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');

  const partners = useMemo(() => {
    const pSet = new Set<string>();
    products.forEach(p => {
      if (p.ownerId) pSet.add(p.ownerId);
    });
    return Array.from(pSet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const varietyMatch = selectedVariety === 'all' || p.variety === selectedVariety;
      const partnerMatch = selectedPartner === 'all' || p.ownerId === selectedPartner;
      return varietyMatch && partnerMatch;
    });
  }, [products, selectedVariety, selectedPartner]);

  const currentHeroImage = heroImageUrl || 'https://images.unsplash.com/photo-1610992383821-DA203653b619?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <>
      <section className="w-full bg-muted overflow-hidden">
        <Link href="#collection" className="block w-full">
          {isHeroImageLoading ? (
            <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1]" />
          ) : (
            <div className="w-full relative">
              <Image 
                src={currentHeroImage} 
                alt="Promotion Banner" 
                width={1920}
                height={800}
                className="w-full h-auto block object-cover md:object-contain"
                priority
                unoptimized={currentHeroImage.startsWith('data:')}
              />
            </div>
          )}
        </Link>
      </section>

      <div id="collection" className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col gap-8 mb-8 md:mb-12 border-b pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full">
              <h2 className="text-2xl md:text-5xl font-headline text-primary lowercase leading-tight">
                most reviewed collections
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-2">Discover our highest-rated traditional handlooms.</p>
            </div>
            {isAdmin && (
              <div className="mt-2 md:mt-0 w-full md:w-auto">
                <AddSareeDialog />
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-primary/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/50 mr-2">
              <Filter className="h-4 w-4" /> Filters
            </div>
            
            <Select value={selectedVariety} onValueChange={setSelectedVariety}>
              <SelectTrigger className="w-full md:w-[200px] h-11 rounded-2xl bg-white border-none shadow-sm text-xs font-bold">
                <SelectValue placeholder="Textile Variety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                {sareeVarieties.map(v => (
                  <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger className="w-full md:w-[200px] h-11 rounded-2xl bg-white border-none shadow-sm text-xs font-bold">
                <SelectValue placeholder="Wholesaler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {partners.map(p => (
                  <SelectItem key={p} value={p}>Partner {p.slice(-4)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedVariety !== 'all' || selectedPartner !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSelectedVariety('all'); setSelectedPartner('all'); }}
                className="text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
              >
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed">
            <p className="text-muted-foreground font-headline text-xl">No sarees found matching these criteria.</p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </>
  );
}
