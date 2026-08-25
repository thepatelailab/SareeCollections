'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, IndianRupee, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '@/components/providers/app-provider';

export function ActivityTracker() {
  const { isAdmin, isRoleLoaded } = useAppContext();
  const firestore = useFirestore();

  // Simplified query: removed orderBy to prevent index errors
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin || !isRoleLoaded) return null;
    return query(collection(firestore, 'orders'), limit(100));
  }, [firestore, isAdmin, isRoleLoaded]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery as any);

  if (!isRoleLoaded || isLoading) {
    return <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  // Sort manually in JS
  const sortedOrders = orders ? [...orders].sort((a, b) => {
    const dateA = a.created_at?.toDate?.()?.getTime() || 0;
    const dateB = b.created_at?.toDate?.()?.getTime() || 0;
    return dateB - dateA;
  }) : [];

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.amount_paise / 100), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-none shadow-lg bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Platform Revenue</CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2"><IndianRupee className="h-6 w-6" /> {totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-lg bg-accent text-accent-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-accent-foreground/60 text-[10px] font-black uppercase tracking-widest">Active Fulfillments</CardDescription>
            <CardTitle className="text-3xl font-black flex items-center gap-2"><ShoppingBag className="h-6 w-6" /> {pendingOrders}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-[2rem] border-none shadow-lg bg-white border border-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Global Reach</CardDescription>
            <CardTitle className="text-3xl font-black text-primary flex items-center gap-2"><Globe className="h-6 w-6 text-primary/20" /> {orders?.length || 0} Total</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Registry Table */}
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-headline text-primary">Master Order Registry</CardTitle>
          <CardDescription>Consolidated view of all artisanal transactions.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="rounded-2xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Order ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id} className="border-primary/5 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold text-primary py-4">#{order.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.created_at ? format(order.created_at.toDate(), 'MMM d, p') : '...'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{order.shipping_details?.name || 'Customer'}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{order.shipping_details?.city}, {order.shipping_details?.zip}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">INR {order.amount_paise / 100}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest rounded-full">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
