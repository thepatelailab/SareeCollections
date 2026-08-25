'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function MyOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-primary/5">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-headline text-primary mb-4 lowercase">order history</h1>
        <p className="text-lg text-muted-foreground mb-8 italic font-body">
          We are currently upgrading our order tracking system to provide a better heritage experience. 
          Please check your email for order confirmations and shipping updates.
        </p>
        <Button asChild size="lg" className="rounded-2xl px-10">
          <Link href="/">Return to Collection</Link>
        </Button>
      </div>
    </div>
  );
}
