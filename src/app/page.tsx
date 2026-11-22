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
import { Filter, X, LayoutGrid, Flower2, Shirt, ArrowDown, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export default function Home() {
  const { products, isAdmin, isLoading, heroImageUrl, isHeroImageLoading, sareeVarieties, hasMore, loadMore, isFetchingMore } = useAppContext();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const partners = useMemo(() => {
    const pSet = new Set<string>();
    products.forEach(p => {
      if (p.ownerId) pSet.add(p.ownerId);
    });
    return Array.from(pSet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      const varietyMatch = selectedVariety === 'all' || p.variety === selectedVariety;
      const partnerMatch = selectedPartner === 'all' || p.ownerId === selectedPartner;
      return categoryMatch && varietyMatch && partnerMatch;
    });
  }, [products, selectedCategory, selectedVariety, selectedPartner]);

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

      <div id="collection" className="container mx-auto px-4 py-2 md:py-4">
        <Collapsible 
          open={isHeaderExpanded} 
          onOpenChange={setIsHeaderExpanded}
          className="flex flex-col gap-2 mb-4 border-b pb-2"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="w-full relative">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <div className="hidden md:block">
                      <AddSareeDialog />
                    </div>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full h-9 px-4 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                        {isHeaderExpanded ? 'Hide Filters' : 'Explore Filters'}
                      </span>
                      {isHeaderExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </div>
          </div>

          <CollapsibleContent className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {isAdmin && (
              <div className="md:hidden mb-4">
                <AddSareeDialog />
              </div>
            )}
            
            {/* Category Tabs */}
            <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full overflow-x-auto">
              <TabsList className="bg-muted/40 p-1 rounded-2xl border border-primary/5 inline-flex min-w-full md:min-w-0">
                <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" /> All Crafts
                </TabsTrigger>
                <TabsTrigger value="saree" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Shirt className="h-3.5 w-3.5" /> Sarees
                </TabsTrigger>
                <TabsTrigger value="crochet" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Flower2 className="h-3.5 w-3.5" /> Crochet Hub
                </TabsTrigger>
                <TabsTrigger value="lehenga" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
                  Lehenga
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
          </CollapsibleContent>
        </Collapsible>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed">
            <p className="text-muted-foreground font-headline text-xl">No products found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <ProductGrid products={filteredProducts} />
            
            {hasMore && (
              <div className="flex justify-center pb-8">
                <Button 
                  onClick={loadMore} 
                  disabled={isFetchingMore}
                  variant="outline"
                  className="rounded-full px-12 h-14 border-primary/10 hover:bg-primary hover:text-white font-headline text-xl lowercase transition-all shadow-xl group"
                >
                  {isFetchingMore ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowDown className="mr-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
                  )}
                  discover more pieces
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
