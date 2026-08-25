
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Truck, Package, CheckCircle2, ExternalLink, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // CRITICAL: This query is "Safe" because the filter matches the security rules perfectly.
  // This prevents the "Missing or insufficient permissions" error.
  const myOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.isAnonymous) return null;
    return query(
      collection(firestore, 'orders'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(myOrdersQuery as any);

  if (isUserLoading || isOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-xl" />
        {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />)}
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-headline text-primary mb-4">Please login to see your orders</h1>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">my acquisitions</h1>
          <p className="text-muted-foreground italic font-body">Track the journey of your heritage pieces.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full border-primary/10">
          <Link href="/#collection">Discover More <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="rounded-[3rem] border-2 border-dashed py-24 text-center bg-muted/20">
          <div className="max-w-xs mx-auto space-y-6">
            <div className="bg-white p-6 rounded-full w-fit mx-auto shadow-xl">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div>
              <h3 className="text-2xl font-headline text-primary">No pieces acquired yet</h3>
              <p className="text-sm text-muted-foreground mt-2">Your collection begins with a single thread of tradition.</p>
            </div>
            <Button asChild size="lg" className="rounded-2xl px-10 bg-primary">
              <Link href="/#collection">Browse Marketplace</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-[2.5rem] border-primary/5 shadow-xl bg-white/50 backdrop-blur-sm transition-all hover:shadow-2xl">
              <div className="bg-primary p-6 md:p-8 text-primary-foreground">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Heritage Acquisition ID</p>
                    <p className="text-xl font-black tracking-tight">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-right">Acquisition Date</p>
                    <p className="font-bold text-lg">
                      {order.created_at?.toDate ? new Date(order.created_at.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Processing...'}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-10 space-y-8">
                {/* Status Timeline */}
                <div className="grid grid-cols-4 gap-2 relative">
                   <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-muted z-0"></div>
                   <div className="absolute top-4 left-[12.5%] transition-all duration-1000 bg-green-500 h-0.5 z-0" style={{ width: order.status === 'paid' ? '0%' : order.status === 'shipped' ? '50%' : order.status === 'delivered' ? '100%' : '0%' }}></div>
                   
                   {[
                     { label: 'Confirmed', icon: CheckCircle2, active: true },
                     { label: 'Curation', icon: Package, active: order.status !== 'pending' },
                     { label: 'Dispatched', icon: Truck, active: order.status === 'shipped' || order.status === 'delivered' },
                     { label: 'Acquired', icon: Heart, active: order.status === 'delivered' }
                   ].map((step, i) => (
                     <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-500 ${step.active ? 'bg-green-100 text-green-600 scale-110 shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                           <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest text-center ${step.active ? 'text-primary' : 'text-muted-foreground opacity-40'}`}>{step.label}</span>
                     </div>
                   ))}
                </div>

                <div className="h-px bg-primary/5"></div>

                {/* Items and Details */}
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Acquired Pieces</h4>
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="bg-primary/5 p-3 rounded-2xl">
                             <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-headline text-lg text-primary">{item.name}</p>
                            <p className="text-xs text-muted-foreground italic font-body">Artisan Cluster {item.ownerId?.slice(-4)}</p>
                          </div>
                          <p className="ml-auto font-bold text-primary">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-[2rem] border border-primary/5 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Delivery Logistics</h4>
                       {order.tracking_id ? (
                         <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-primary">{order.courier || 'National Courier'}</span>
                              <Badge variant="outline" className="bg-white border-primary/10 text-primary font-black text-[9px] px-2 py-0.5">{order.status.toUpperCase()}</Badge>
                           </div>
                           <p className="text-xl font-black text-primary tracking-tight">{order.tracking_id}</p>
                           <Button className="w-full rounded-xl h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                              <ExternalLink className="mr-2 h-4 w-4" /> Track Real-time
                           </Button>
                         </div>
                       ) : (
                         <div className="py-4 text-center space-y-2 opacity-60">
                           <Package className="h-8 w-8 mx-auto text-muted-foreground" />
                           <p className="text-xs font-bold uppercase tracking-widest">Awaiting Dispatch</p>
                           <p className="text-[10px] italic">Our artisan partners are carefully authenticating your piece.</p>
                         </div>
                       )}
                    </div>
                    
                    <div className="flex justify-between items-center px-4">
                       <span className="text-sm font-bold text-muted-foreground italic">Total Investment</span>
                       <span className="text-3xl font-black text-primary tracking-tighter">₹{(order.amount_paise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
