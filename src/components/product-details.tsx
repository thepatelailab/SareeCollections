
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw, Share2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCartContext } from './providers/cart-provider';
import { useAppContext } from './providers/app-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-6 w-6 fill-[#1877F2]">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.43 0 225.36 0C152.3 0 104.33 44.38 104.33 124.72v70.62H22.89V288h81.44v224h100.12V288z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6 fill-[#25D366]">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 445.5c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 365.7l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCartContext();
  const { incrementProductMetric } = useAppContext();
  const [isLiked, setIsLiked] = useState(false);

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      setIsLiked(true);
      incrementProductMetric(product.id, 'likes');
    }
  };

  const handleShare = (platform: 'whatsapp' | 'facebook', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    incrementProductMetric(product.id, 'shares');
    const text = `Take a look at this stunning ${product.name} I found on SareeDukan!`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + productUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 group">
        <Link href="/#collection">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Collection
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Visual Showcase */}
        <div className="space-y-6">
          <Tabs defaultValue="model" className="w-full">
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden border shadow-2xl bg-muted">
              <TabsContent value="saree" className="mt-0 h-full">
                <Image src={product.sareeImg} alt={product.name} fill className="object-cover" />
              </TabsContent>
              <TabsContent value="model" className="mt-0 h-full">
                <Image src={product.modelImg} alt={`Model in ${product.name}`} fill className="object-cover" />
              </TabsContent>
              
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
                {product.variety && (
                  <Badge className="bg-primary text-primary-foreground py-1.5 px-4 md:py-2 md:px-6 text-[10px] md:text-sm font-headline tracking-widest uppercase shadow-2xl border-0">
                    {product.variety}
                  </Badge>
                )}
              </div>

              {/* Interaction Overlay - Always visible on details page for accessibility */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={cn(
                      "h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/95 backdrop-blur-xl shadow-lg border border-white/40 transition-transform active:scale-95",
                      isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                    )}
                    onClick={handleLike}
                  >
                    <Heart className={cn("h-5 w-5 md:h-7 md:w-7", isLiked && "fill-current")} />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/95 backdrop-blur-xl shadow-lg border border-white/40 text-muted-foreground hover:text-primary transition-transform active:scale-95"
                      >
                        <Share2 className="h-5 w-5 md:h-7 md:w-7" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 rounded-2xl shadow-2xl border-primary/10 bg-white/90 backdrop-blur-xl" align="start">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => handleShare('whatsapp', e)} className="h-10 w-10 rounded-xl hover:bg-[#25D366]/10">
                          <WhatsAppIcon />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleShare('facebook', e)} className="h-10 w-10 rounded-xl hover:bg-[#1877F2]/10">
                          <FacebookIcon />
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Metrics Pill Badge */}
                <div className="flex items-center gap-4 bg-white/95 backdrop-blur-xl rounded-full px-5 py-2 md:px-7 md:py-3 shadow-xl border border-white/40">
                  <div className="flex items-center gap-2 text-red-500">
                    <Heart className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                    <span className="text-xs md:text-sm font-black">{product.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm font-black">{product.shares || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <TabsList className="grid grid-cols-2 mt-6 bg-muted/40 p-1.5 rounded-2xl border backdrop-blur-sm h-12 md:h-14">
              <TabsTrigger value="model" className="rounded-xl font-black py-2.5 uppercase text-[9px] md:text-[11px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md transition-all">Model</TabsTrigger>
              <TabsTrigger value="saree" className="rounded-xl font-black py-2.5 uppercase text-[9px] md:text-[11px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md transition-all">Fabric</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Product Information */}
        <div className="flex flex-col gap-8 py-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline text-primary mb-2 leading-[1.1]">{product.name}</h1>
            <p className="text-lg md:text-xl text-muted-foreground italic font-body">Heritage {product.variety} Collection</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs text-muted-foreground line-through opacity-50 font-black uppercase tracking-widest">Original Value: INR {Math.round(product.price * 1.3)}</span>
              <span className="text-4xl md:text-5xl font-black text-primary tracking-tight">INR {product.price}</span>
            </div>
            <Badge className="text-green-700 border-green-200 bg-green-50 px-4 py-1.5 text-[10px] font-black rounded-lg">LIMITED STOCK</Badge>
          </div>

          <Separator className="bg-primary/10 h-px" />

          <div className="space-y-4">
            <h3 className="font-headline text-xl md:text-2xl text-primary/80 tracking-wide">Curator's Note</h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-body font-light">{product.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 py-6 border-y border-primary/10">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-tight">Verified<br/>Quality</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <Truck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-tight">Priority<br/>Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <RotateCcw className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-tight">Graceful<br/>Returns</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              size="lg" 
              className="w-full py-8 text-xl md:text-2xl font-headline bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl transition-all hover:-translate-y-1 active:scale-95"
              onClick={() => addToCart(product)}
            >
              <ShoppingBag className="mr-3 h-5 w-5 md:h-7 md:w-7" /> Reserve This Piece
            </Button>
            
            <p className="text-center text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
              <span className="text-primary font-black">{product.shares || 0}</span> Global Style Explorers Shared This Piece
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
