'use client';
import { ProductGrid } from '@/components/product-grid';
import { useAppContext } from '@/components/providers/app-provider';
import { AddSareeDialog } from '@/components/add-saree-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { products, isAdmin, isLoading, heroImageUrl, isHeroImageLoading } = useAppContext();
  
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12 border-b pb-6">
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
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
}
