'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, TrendingUp, AlertCircle, BarChart3, Star, Heart, Share2 } from 'lucide-react';

export function ActivityTracker() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'), limit(15));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery as any);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-[2rem]" />;

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.amount_paise / 100), 0) || 0;
  const pendingShipments = orders?.filter(o => o.status === 'paid').length || 0;

  return (
    <div className="space-y-8">
      {/* Platform Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatItem icon={TrendingUp} label="Platform Revenue" value={`INR ${totalRevenue.toLocaleString()}`} color="text-green-600" />
        <StatItem icon={ShoppingBag} label="Recent Orders" value={orders?.length.toString() || '0'} color="text-blue-600" />
        <StatItem icon={AlertCircle} label="Pending Dispatch" value={pendingShipments.toString()} color="text-orange-600" />
        <StatItem icon={Star} label="Global Engagement" value="Active" color="text-accent-foreground" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <Card className="lg:col-span-2 rounded-[2.5rem] shadow-xl border-primary/5">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary lowercase">
              <BarChart3 className="h-6 w-6" /> global activity feed
            </CardTitle>
            <CardDescription>Real-time stream of all platform transactions and partner logistics.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              {orders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 border rounded-[2rem] hover:bg-muted/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-primary">Order #{order.order_id?.slice(-8) || '...'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {order.shipping_details?.city || 'Location Pending'} — {order.created_at?.seconds ? new Date(order.created_at.seconds * 1000).toLocaleTimeString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-black text-lg text-primary">INR {order.amount_paise / 100}</p>
                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-[8px] uppercase font-black tracking-widest px-3 py-1">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="text-center py-20 border-2 border-dashed rounded-[2rem] opacity-20">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-headline text-xl">Waiting for activity...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Competition Insights Side Panel */}
        <div className="space-y-6">
           <Card className="rounded-[2rem] bg-primary text-primary-foreground p-8 shadow-2xl">
              <h3 className="text-2xl font-headline mb-4 lowercase">heritage trends</h3>
              <div className="space-y-6">
                 <TrendItem icon={Heart} label="Weekly Appreciations" value="+1,240" />
                 <TrendItem icon={Share2} label="Global Style Shares" value="+482" />
                 <TrendItem icon={Star} label="Top Partner Growth" value="+15%" />
              </div>
           </Card>

           <Card className="rounded-[2rem] border-primary/10 p-8 bg-accent/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-4">Operations Tip</h4>
              <p className="text-xs leading-relaxed text-primary/80 italic">
                "Partners with a Heritage Score above 500 are 3x more likely to convert browsers into buyers. Consider featuring high-score partners on the homepage banner."
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <Card className="rounded-[2rem] border-primary/5 shadow-md group hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className={`p-2.5 rounded-2xl bg-muted/50 ${color} w-fit mb-4 group-hover:scale-110 transition-transform`}><Icon className="h-6 w-6" /></div>
        <p className="text-2xl font-black text-primary tracking-tight">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function TrendItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl"><Icon className="h-4 w-4 text-accent" /></div>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <span className="text-sm font-black text-accent">{value}</span>
    </div>
  );
}
