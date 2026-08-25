
'use client';

import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ProductDetails } from '@/components/product-details';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import Head from 'next/head';

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(collection(firestore, 'SareeCollection'), id);
  }, [firestore, id]);

  const { data: product, isLoading, error } = useDoc(docRef);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-headline text-primary mb-4">Product Not Found</h2>
        <p className="text-muted-foreground">The saree you are looking for might have been sold out or moved.</p>
      </div>
    );
  }

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.modelImg || product.sareeImg,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "SareeDukan"
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "priceCurrency": "INR",
      "price": product.price,
      "availability": (product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <title>{`${product.name} | SareeDukan Heritage Collection`}</title>
      <meta name="description" content={product.description.slice(0, 160)} />
      <ProductDetails product={product} />
    </>
  );
}
