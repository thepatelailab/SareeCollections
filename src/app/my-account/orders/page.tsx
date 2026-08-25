'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, Clock, MapPin, ExternalLink, ChevronRight, Shirt } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Strictly filtered query for the current user
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    // We order by created_at to see newest first
    return query(
      collection(firestore, 'orders'), 
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
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
        <div className="bg-muted/30 p-12 rounded-[3rem] border-2 border-dashed">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-3xl font-headline text-primary mb-2">No Acquisitions Yet</h2>
          <p className="text-muted-foreground mb-8">Your heritage collection is waiting for its first masterpiece.</p>
          <Button asChild size="lg" className="rounded-2xl px-10 h-14 bg-primary text-white">
            <Link href="/">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'ready for packaging': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-600 text-white border-none';
      default: return 'bg-muted text-muted-foreground border-none';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4" />;
      case 'ready for packaging': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-headline text-primary lowercase leading-tight">my acquisitions</h1>
        <p className="text-muted-foreground font-medium italic mt-2">Tracking your heritage journey.</p>
      </div>

      <div className="grid gap-8">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm transition-all hover:shadow-2xl">
            <div className="bg-primary p-6 md:p-8 text-primary-foreground flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Order Reference</p>
                <h3 className="text-xl md:text-2xl font-black">#{order.id.slice(-8).toUpperCase()}</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={cn("rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest", getStatusColor(order.status))}>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </Badge>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Placed On</p>
                  <p className="text-sm font-bold">{order.created_at ? format(order.created_at.toDate(), 'PPP') : 'Processing...'}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Shirt className="h-4 w-4" /> Reserved Pieces
                </h4>
                <div className="grid gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl border border-primary/5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-primary/10">
                          <Package className="h-6 w-6 text-primary/40" />
                        </div>
                        <div>
                          <p className="font-bold text-primary">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-primary">INR {item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative pt-4 pb-8">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -translate-y-1/2"></div>
                <div 
                  className="absolute left-0 top-1/2 h-1 bg-accent -translate-y-1/2 transition-all duration-1000" 
                  style={{ width: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '75%' : order.status === 'ready for packaging' ? '50%' : '25%' }}
                ></div>
                <div className="relative flex justify-between">
                  {['paid', 'ready for packaging', 'shipped', 'delivered'].map((step, idx) => {
                    const isCompleted = order.status === 'delivered' || (idx <= ['paid', 'ready for packaging', 'shipped', 'delivered'].indexOf(order.status));
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 z-10">
                        <div className={cn(
                          "h-8 w-8 rounded-full border-4 border-white flex items-center justify-center transition-all",
                          isCompleted ? "bg-accent scale-110 shadow-lg" : "bg-muted"
                        )}>
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-accent-foreground" />}
                        </div>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-tighter text-center max-w-[60px]",
                          isCompleted ? "text-primary" : "text-muted-foreground opacity-40"
                        )}>{step}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-primary/5">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </h4>
                  <div className="text-xs text-muted-foreground leading-relaxed p-4 bg-muted/20 rounded-2xl italic">
                    <p className="font-bold text-primary not-italic mb-1">{order.shipping_details?.name}</p>
                    <p>{order.shipping_details?.address}</p>
                    <p>{order.shipping_details?.city}, {order.shipping_details?.zip}</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Logistics Details
                  </h4>
                  {order.tracking_id ? (
                    <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent-foreground mb-1">{order.courier || 'Express'}</p>
                      <p className="text-sm font-bold text-primary mb-3">ID: {order.tracking_id}</p>
                      <Button variant="outline" size="sm" className="w-full h-10 rounded-xl text-[10px] font-black uppercase">
                        Track Shipment <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/20 rounded-2xl text-center italic text-[10px] text-muted-foreground">
                      Our artisans are authenticating your piece. Tracking ID will appear shortly.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}