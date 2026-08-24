
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Share2, Store } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartContext } from './providers/cart-provider';
import { useAppContext } from './providers/app-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartContext();
  const { incrementProductMetric } = useAppContext();
  const [isLiked, setIsLiked] = useState(false);

  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.id}` 
    : '';

  const isOutOfStock = (product.stock ?? 0) <= 0;

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
    const text = `Check out this beautiful ${product.name} at SareeDukan!`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + productUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    }
  };

  // Phase 2 Optimization: Prefer lightweight thumbnails for the grid view
  const displaySareeImg = product.thumbnailImg || product.sareeImg;
  const displayModelImg = product.thumbnailModelImg || product.modelImg;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-[2.5rem] shadow-sm transition-all duration-500 hover:shadow-2xl border border-border bg-card/50">
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block relative">
          <CardContent className="p-0 relative">
            <Tabs defaultValue="model" className="w-full">
              <TabsList 
                className="absolute top-4 left-4 z-20 h-9 bg-primary/40 backdrop-blur-xl rounded-full p-1 border border-primary/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <TabsTrigger 
                  value="model" 
                  disabled={!product.modelImg} 
                  className="text-[7px] h-7 px-3 rounded-full font-black uppercase tracking-[0.1em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all"
                >
                  Model
                </TabsTrigger>
                <TabsTrigger 
                  value="saree" 
                  className="text-[7px] h-7 px-3 rounded-full font-black uppercase tracking-[0.1em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all"
                >
                  {product.category === 'crochet' ? 'Item' : 'Fabric'}
                </TabsTrigger>
              </TabsList>
              
              <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                {product.variety && (
                  <Badge className="bg-primary text-primary-foreground font-headline text-[7px] py-1 px-3 rounded-full tracking-widest uppercase border-0 shadow-lg font-bold opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {product.variety}
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="destructive" className="font-headline text-[7px] py-1.5 px-4 rounded-full tracking-[0.2em] uppercase border-0 shadow-2xl font-black z-30 ring-2 ring-white">
                    Sold Out
                  </Badge>
                )}
              </div>

              <TabsContent value="saree" className="mt-0">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src={displaySareeImg}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    data-ai-hint={product.sareeImgHint}
                  />
                </div>
              </TabsContent>
              <TabsContent value="model" className="mt-0">
                 <div className="aspect-[4/5] relative overflow-hidden">
                  {displayModelImg ? (
                    <Image
                      src={displayModelImg}
                      alt={`Model wearing ${product.name}`}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-30">Generating Preview...</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Link>

        {/* Interaction Overlay */}
        <div 
          className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex gap-2">
             <Button 
                variant="secondary" 
                size="icon" 
                className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/95 backdrop-blur-xl transition-all shadow-xl border border-white/40",
                  isLiked ? "text-red-500 scale-105" : "text-muted-foreground hover:text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-5 w-5 md:h-6 md:w-6", isLiked && "fill-current")} />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/95 backdrop-blur-xl text-muted-foreground hover:text-primary shadow-xl border border-white/40"
                  >
                    <Share2 className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-2 rounded-full shadow-2xl border-primary/10 backdrop-blur-xl bg-white/95" 
                  align="start" 
                  side="bottom"
                  sideOffset={10}
                >
                  <div className="flex flex-row gap-4 px-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-[#25D366]/10" onClick={(e) => handleShare('whatsapp', e)}>
                      <WhatsAppIcon />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-[#1877F2]/10" onClick={(e) => handleShare('facebook', e)}>
                      <FacebookIcon />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
          </div>
          
          <div className="flex gap-3 bg-white/95 backdrop-blur-xl rounded-full px-5 py-2 text-[12px] font-bold text-primary shadow-xl border border-white/50">
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 fill-red-500 text-red-500" /> {product.likes || 0}</span>
            <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4 text-primary" /> {product.shares || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <CardHeader className="p-0">
          <Link href={`/products/${product.id}`}>
            <CardTitle className="font-headline text-2xl leading-tight text-primary hover:underline">
              {product.name}
            </CardTitle>
          </Link>
          {product.ownerId && (
            <Link 
              href={`/partners/${product.ownerId}`}
              className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-accent-foreground mt-2 hover:text-primary transition-colors"
            >
              <Store className="h-3 w-3" /> Partner Boutique
            </Link>
          )}
          <CardDescription className="pt-2 text-[10px] italic uppercase tracking-[0.2em] font-black opacity-50">
            {product.category === 'crochet' ? 'Handcrafted Artisan Work' : 'Heritage Handloom Collection'}
          </CardDescription>
        </CardHeader>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[11px] text-muted-foreground line-through opacity-40 font-black">INR {Math.round(product.price * 1.2)}</span>
             <p className="text-2xl font-black text-primary tracking-tight">INR {product.price}</p>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-primary hover:bg-primary/90 text-[10px] h-11 px-6 rounded-full font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
            aria-label={isOutOfStock ? "Sold Out" : `Add ${product.name} to cart`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Sold Out' : <><ShoppingBag className="mr-2.5 h-4.5 w-4.5" /> Acquire</>}
          </Button>
        </div>
      </div>
    </Card>
  );
}
