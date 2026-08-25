'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, Clock, MapPin, ExternalLink, Shirt, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STEPS = ['paid', 'ready for packaging', 'shipped', 'delivered'];

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'orders'), 
      where('user_id', '==', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery as any);

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <div className="bg-muted/30 p-12 rounded-[3rem] border-2 border-dashed border-primary/10">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-3xl font-headline text-primary mb-2">No Acquisitions Yet</h2>
          <p className="text-muted-foreground mb-8">Your heritage collection is waiting for its first masterpiece.</p>
          <Button asChild size="lg" className="rounded-2xl px-10 h-14 bg-primary text-white shadow-xl">
            <Link href="/">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.created_at?.toDate?.()?.getTime() || 0;
    const dateB = b.created_at?.toDate?.()?.getTime() || 0;
    return dateB - dateA;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 className="h-4 w-4" /> };
      case 'ready for packaging': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Package className="h-4 w-4" /> };
      case 'shipped': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck className="h-4 w-4" /> };
      case 'delivered': return { color: 'bg-primary text-white border-none', icon: <CheckCircle2 className="h-4 w-4" /> };
      default: return { color: 'bg-muted text-muted-foreground border-none', icon: <Clock className="h-4 w-4" /> };
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <LayoutGrid className="h-3.5 w-3.5" /> Acquisition History
          </div>
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">my orders</h1>
          <p className="text-muted-foreground font-medium italic mt-2">Tracking your heritage pieces across the globe.</p>
        </div>
      </div>

      <div className="grid gap-12">
        {sortedOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const currentStepIndex = STEPS.indexOf(order.status);
          
          return (
            <Card key={order.id} className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]">
              {/* Card Header */}
              <div className="bg-primary p-8 md:p-10 text-primary-foreground flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Order Reference</p>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">#{order.id.slice(-8).toUpperCase()}</h3>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg", statusConfig.color)}>
                      <span className="flex items-center gap-2">
                        {statusConfig.icon}
                        {order.status}
                      </span>
                    </Badge>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Placed On</p>
                    <p className="text-sm font-bold">{order.created_at ? format(order.created_at.toDate(), 'MMMM do, yyyy') : 'Processing...'}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 md:p-12 space-y-12">
                {/* Product Items */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2 mb-4">
                    <Shirt className="h-4 w-4" /> Reserved Pieces
                  </h4>
                  <div className="grid gap-4">
                    {order.items?.map((item, idx) => {
                      // Normalize item for legacy string-only items or incomplete objects
                      const isLegacy = typeof item === 'string';
                      const name = isLegacy ? item : (item.name || 'Unknown Product');
                      const price = isLegacy ? 0 : (item.price || 0);
                      // Fallback check for multiple image field names
                      const image = isLegacy ? null : (item.image || (item as any).thumbnailImg || (item as any).sareeImg);
                      const quantity = isLegacy ? 1 : (item.quantity || 1);

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#F9F9F4] rounded-3xl border border-primary/5 group hover:bg-[#F3F4ED] transition-colors">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-16 relative rounded-2xl overflow-hidden shadow-md border border-white shrink-0 bg-muted">
                              {image ? (
                                <Image 
                                  src={image} 
                                  alt={name} 
                                  fill 
                                  className="object-cover"
                                  unoptimized={image.startsWith('data:')}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-headline text-xl text-primary leading-none mb-2">{name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Quantity: {quantity}</p>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 text-right w-full sm:w-auto">
                            <p className="text-xl font-black text-primary">
                              {price > 0 ? `INR ${price.toLocaleString()}` : 'Price N/A'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="py-8">
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,225,77,0.5)]" 
                      style={{ width: `${Math.max(0, ((currentStepIndex + 1) / STEPS.length) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-6">
                    {STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      
                      return (
                        <div key={step} className="flex flex-col items-center gap-3 w-1/4">
                          <div className={cn(
                            "h-10 w-10 rounded-full border-4 border-white flex items-center justify-center transition-all duration-500",
                            isCompleted ? "bg-accent scale-110 shadow-xl" : "bg-muted scale-90",
                            isCurrent && "ring-4 ring-accent/20"
                          )}>
                            {isCompleted ? <CheckCircle2 className="h-5 w-5 text-accent-foreground" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest text-center px-1 leading-tight",
                            isCompleted ? "text-primary" : "text-muted-foreground opacity-30"
                          )}>{step}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Shipping & Logistics */}
                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-primary/5">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Delivery Address
                    </h4>
                    <div className="p-6 bg-muted/20 rounded-3xl border border-primary/5">
                      <p className="font-bold text-primary text-lg mb-1">{order.shipping_details?.name || 'Customer'}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        {order.shipping_details?.address || 'Address not provided'}<br/>
                        {order.shipping_details?.city || ''}, {order.shipping_details?.zip || ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Logistics Details
                    </h4>
                    {order.tracking_id ? (
                      <div className="p-6 bg-accent/5 rounded-3xl border border-accent/20 flex flex-col justify-between h-full min-h-[140px]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-accent-foreground mb-1">{order.courier || 'Express'}</p>
                          <p className="text-2xl font-black text-primary tracking-tight">ID: {order.tracking_id}</p>
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 bg-white border-accent/20 hover:bg-accent hover:text-accent-foreground">
                          Track Live Shipment <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-8 bg-muted/20 rounded-3xl text-center flex flex-col items-center justify-center h-full min-h-[140px] border border-dashed border-primary/5">
                        <Clock className="h-8 w-8 text-primary/20 mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed max-w-[200px]">
                          Our artisans are authenticating your piece. Tracking ID will appear shortly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}