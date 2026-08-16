
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, User, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const COURIERS = ['BlueDart', 'Delhivery', 'DTDC', 'India Post', 'DHL', 'Shiprocket'];

export function PartnerOrders() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<Record<string, { courier: string, tracking: string }>>({});

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'orders'), where('status', 'in', ['paid', 'shipped']));
  }, [firestore, user?.uid]);

  const { data: allOrders, isLoading } = useCollection<Order>(ordersQuery as any);

  const myOrders = allOrders?.filter(order => 
    order.items?.some(item => item.ownerId === user?.uid)
  ) || [];

  const handleShip = async (orderId: string) => {
    if (!firestore) return;
    const info = shippingInfo[orderId];
    if (!info?.courier || !info?.tracking) {
      toast({ variant: 'destructive', title: 'Missing Tracking', description: 'Please select courier and enter tracking ID.' });
      return;
    }

    setUpdatingId(orderId);
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'shipped',
        courier: info.courier,
        tracking_id: info.tracking,
        shipped_at: new Date(),
        updated_at: new Date()
      });
      toast({ title: 'Order Shipped!', description: 'Buyer has been notified.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (myOrders.length === 0) {
    return (
      <Card className="border-dashed py-20 flex flex-col items-center text-center">
        <Package className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-xl font-headline text-primary">No Sales Yet</h3>
        <p className="text-muted-foreground mt-2">Orders will appear here once payment is confirmed.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {myOrders.map((order) => {
        const myItems = order.items?.filter(i => i.ownerId === user?.uid) || [];
        return (
          <Card key={order.id} className="overflow-hidden rounded-[2rem] border-primary/5 shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl"><CreditCard className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-lg">Order #{order.order_id?.slice(-8) || '...'}</CardTitle>
                    <CardDescription>Placed on {order.created_at?.seconds ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'Recent'}</CardDescription>
                  </div>
                </div>
                <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'} className="uppercase font-black text-[10px]">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="h-3 w-3" /> Buyer Information
                  </h4>
                  <div className="space-y-1">
                    <p className="font-bold text-primary">{order.shipping_details?.name || 'Guest'}</p>
                    <p className="text-sm flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {order.shipping_details?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Shipping Address
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {order.shipping_details?.address || 'Address not provided'},<br/>
                    {order.shipping_details?.city || ''} - {order.shipping_details?.zip || ''}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Your Items</h4>
                  <ul className="space-y-2">
                    {myItems.map((item, idx) => (
                      <li key={idx} className="text-sm font-bold flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-primary">INR {item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2rem] p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Logistics Portal
                </h4>
                
                {order.status === 'paid' ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">Select Courier</Label>
                      <Select 
                        onValueChange={(v) => setShippingInfo(prev => ({ ...prev, [order.id]: { ...prev[order.id], courier: v } }))}
                      >
                        <SelectTrigger className="bg-white rounded-xl border-none h-12">
                          <SelectValue placeholder="Select Partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {COURIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">Tracking ID</Label>
                      <Input 
                        placeholder="TRK12345678" 
                        className="bg-white rounded-xl border-none h-12"
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, [order.id]: { ...prev[order.id], tracking: e.target.value } }))}
                      />
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl shadow-lg" 
                      onClick={() => handleShip(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? <Loader2 className="animate-spin" /> : 'Confirm Dispatch'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2 pt-4">
                    <p className="text-sm font-bold">Dispatched via {order.courier}</p>
                    <p className="text-xs text-muted-foreground">Tracking: <span className="font-mono">{order.tracking_id}</span></p>
                    <Badge className="bg-green-600 text-white mt-4">Buyer Notified</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
