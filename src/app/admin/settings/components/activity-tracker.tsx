
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';

export function ActivityTracker() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'), limit(10));
  }, [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery as any);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.amount_paise / 100), 0) || 0;
  const pendingShipments = orders?.filter(o => o.status === 'paid').length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem icon={TrendingUp} label="Platform Revenue" value={`INR ${totalRevenue.toLocaleString()}`} color="text-green-600" />
        <StatItem icon={ShoppingBag} label="Recent Orders" value={orders?.length.toString() || '0'} color="text-blue-600" />
        <StatItem icon={AlertCircle} label="Pending Dispatch" value={pendingShipments.toString()} color="text-orange-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Activity Feed</CardTitle>
          <CardDescription>Real-time stream of all platform transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg"><ShoppingBag className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-bold text-sm">Order #{order.order_id?.slice(-6) || '...'}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shipping_details?.name || 'Customer'} - {order.shipping_details?.city || 'Location Pending'}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-sm">INR {order.amount_paise / 100}</p>
                  <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <Card className="rounded-2xl border-primary/5">
      <CardContent className="p-6">
        <div className={`p-2 rounded-xl bg-muted/50 ${color} w-fit mb-4`}><Icon className="h-5 w-5" /></div>
        <p className="text-2xl font-black text-primary">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
