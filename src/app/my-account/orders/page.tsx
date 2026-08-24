'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Package, Truck, Calendar, MapPin, IndianRupee, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    // Only query if we have a real user ID and it's not anonymous
    if (!firestore || !user?.uid || user.isAnonymous) return null;
    return query(
      collection(firestore, 'orders'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );
  }, [firestore, user?.uid, user?.isAnonymous]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  if (isUserLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-8 max-w-4xl">
        <Skeleton className="h-12 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">my heritage acquisitions</h1>
          <p className="text-muted-foreground italic font-body mt-2">Track the journey of your handloom masterpieces.</p>
        </div>
        <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/5 text-center">
           <p className="text-2xl font-black text-primary">{orders?.length || 0}</p>
           <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Total Orders</p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-primary/10">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-headline text-xl">Your acquisition history is empty.</p>
          <Button asChild className="mt-8 rounded-xl h-12 px-8">
            <Link href="/#collection">Explore Collections</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-[2.5rem] border-primary/5 shadow-xl bg-white transition-all hover:shadow-2xl">
              <CardHeader className="bg-muted/30 p-8 border-b border-primary/5">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Order #{order.order_id?.slice(-8).toUpperCase() || '...'}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" /> 
                        {order.created_at?.seconds ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'Recent'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-right hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Value</p>
                        <p className="text-2xl font-black text-primary">INR {order.amount_paise / 100}</p>
                     </div>
                     <Badge 
                      className={`h-10 px-6 rounded-xl uppercase font-black tracking-widest text-[10px] ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                        'bg-accent/20 text-accent-foreground'
                      }`}
                     >
                       {order.status}
                     </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Items List */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ShoppingBag className="h-3 w-3" /> Artisan Pieces
                    </h4>
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/5 transition-all">
                          <div>
                            <p className="font-bold text-primary">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black mt-0.5">Quantity: {item.quantity || 1}</p>
                          </div>
                          <p className="font-black text-primary/60">INR {item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Journey Section */}
                  <div className="space-y-8">
                    <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Logistic journey
                      </h4>
                      
                      {order.status === 'shipped' ? (
                        <div className="space-y-6">
                           <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Truck className="h-5 w-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm">Dispatched via {order.courier}</p>
                                 <p className="text-xs text-muted-foreground mt-1">Tracking ID: <span className="font-mono font-black text-primary">{order.tracking_id}</span></p>
                              </div>
                           </div>
                           <p className="text-[11px] text-muted-foreground italic leading-relaxed bg-white/50 p-4 rounded-xl border border-blue-100">
                             "Your heritage piece is currently in transit. Please visit the {order.courier} portal to track the exact location of your package."
                           </p>
                        </div>
                      ) : (
                        <div className="flex gap-4 opacity-60">
                           <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 animate-pulse">
                             <Clock className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm">Awaiting Artisan Dispatch</p>
                              <p className="text-xs text-muted-foreground mt-1">Order verified. Weaver partners are preparing the collection.</p>
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> Delivery destination
                      </h4>
                      <p className="text-sm text-muted-foreground italic leading-relaxed px-2">
                        {order.shipping_details?.address},<br/>
                        {order.shipping_details?.city} - {order.shipping_details?.zip}
                      </p>
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