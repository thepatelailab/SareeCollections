'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Package, ArrowRight, Heart } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
      <div className="flex justify-center mb-8">
        <div className="bg-green-100 p-8 rounded-full shadow-inner animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="h-20 w-20 text-green-600" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-headline text-primary mb-4 lowercase">
        acquisition successful
      </h1>
      <p className="text-lg text-muted-foreground mb-8 italic font-body">
        Thank you for choosing a heritage masterpiece. Your order has been registered with our artisan partners.
      </p>

      {orderId && (
        <Card className="mb-12 bg-white/50 backdrop-blur-sm border-primary/5 rounded-[2rem] shadow-xl">
          <CardContent className="p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Reference ID</p>
            <p className="text-2xl font-black text-primary tracking-tight">#{orderId.slice(-8).toUpperCase()}</p>
            <div className="h-px w-24 bg-accent mx-auto my-6 opacity-30"></div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We have dispatched a confirmation email to you. Our weavers will begin the authentication and packaging process shortly.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="h-16 rounded-2xl px-10 font-headline text-xl bg-primary shadow-xl group">
          <Link href="/my-account/orders">
            <Package className="mr-2 h-5 w-5" /> Track My Order Status <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-16 rounded-2xl px-10 font-headline text-xl border-primary/10">
          <Link href="/">
            <Heart className="mr-2 h-5 w-5 text-red-500" /> Continue Exploring
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
