'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Package, TrendingUp, Activity } from 'lucide-react';
import { useAppContext } from '@/components/providers/app-provider';

export function ActivityTracker() {
  const { firestore } = useFirestore();
  const { isAdmin } = useAppContext();

  const globalOrdersQuery = useMemoFirebase(() => {
    // CRITICAL: Prevent "Permission Denied" by keeping query null until Admin status is locked
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'), limit(100));
  }, [firestore, isAdmin]);

  const { data: orders, isLoading } = useCollection<Order>(globalOrdersQuery as any);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.amount_paise / 100), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'paid' || o.status === 'shipped').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-lg bg-primary text-primary-foreground p-6 flex flex-col justify-between">
           <div className="flex items-center justify-between opacity-60">
             <span className="text-[10px] font-black uppercase tracking-widest">Platform Revenue</span>
             <TrendingUp className="h-4 w-4" />
           </div>
           <p className="text-3xl font-black mt-4">₹{totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg bg-accent text-accent-foreground p-6 flex flex-col justify-between">
           <div className="flex items-center justify-between opacity-60">
             <span className="text-[10px] font-black uppercase tracking-widest">Active Fulfilment</span>
             <Package className="h-4 w-4" />
           </div>
           <p className="text-3xl font-black mt-4">{pendingOrders}</p>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg bg-white p-6 flex flex-col justify-between">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-[10px] font-black uppercase tracking-widest">Total Sales</span>
             <Activity className="h-4 w-4" />
           </div>
           <p className="text-3xl font-black mt-4 text-primary">{orders?.length || 0}</p>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] shadow-xl border-primary/5 bg-white/50 backdrop-blur-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary lowercase">
            <Activity className="h-6 w-6" /> global activity log
          </CardTitle>
          <CardDescription>Real-time monitor of all artisanal acquisitions across the SareeDukan ecosystem.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {!orders || orders.length === 0 ? (
            <div className="text-center py-24 opacity-30 border-2 border-dashed rounded-[2rem]">
               <BarChart3 className="h-16 w-16 mx-auto mb-4" />
               <p className="font-bold uppercase tracking-widest text-xs">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 border rounded-2xl bg-white hover:shadow-md transition-all border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 p-3 rounded-xl">
                       <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        <Badge variant="outline" className="text-[7px] h-4 font-black uppercase tracking-widest border-primary/10">{order.status}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic mt-0.5">
                        {order.shipping_details?.name || 'Guest'} · {order.items?.length || 0} pieces
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                       <p className="font-bold text-sm text-primary">₹{order.amount_paise / 100}</p>
                       <p className="text-[9px] text-muted-foreground uppercase font-black">
                        {order.created_at?.toDate ? new Date(order.created_at.toDate()).toLocaleDateString() : '...'}
                       </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                       <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
