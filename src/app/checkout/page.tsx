'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { CheckoutForm } from './components/checkout-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, or the user is anonymous, redirect
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, isUserLoading, router]);
  
  // While checking auth state, show a loading skeleton
  if (isUserLoading || !user || user.isAnonymous) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
        <div className="space-y-8">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // If user is authenticated (not anonymous), show the form
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center">
        Checkout
      </h1>
      <CheckoutForm />
    </div>
  );
}
