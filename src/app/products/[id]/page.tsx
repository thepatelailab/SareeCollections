'use client';

import { useDoc } from '@/firebase';
import { useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ProductDetails } from '@/components/product-details';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

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

  return <ProductDetails product={product} />;
}
