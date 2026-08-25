'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl md:text-6xl font-headline text-primary mb-6 lowercase">
        feature temporarily unavailable
      </h1>
      <p className="text-lg md:text-xl mb-16 max-w-2xl mx-auto text-muted-foreground italic font-body">
        The order tracking system is currently undergoing maintenance to improve security and performance.
      </p>
      
      <div className="mt-20">
        <Button asChild size="lg" className="h-16 rounded-[2rem] px-12 font-headline text-xl bg-primary shadow-xl">
          <Link href="/">Return to Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}