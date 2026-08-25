'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';

export function PartnerOrders() {
  const { user } = useUser();
  const { isWholesaler, isRoleLoaded } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fulfillmentData, setFulfillmentData] = useState<Record<string, { courier: string; trackingId: string }>>({});

  // CRITICAL: Strict guard to prevent unauthorized customers from triggering this collection list
  const globalOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !isRoleLoaded || !isWholesaler) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'), limit(50));
  }, [firestore, user?.uid, isWholesaler, isRoleLoaded]);

  const { data: allOrders, isLoading } = useCollection<Order>(globalOrdersQuery as any);

  // Filter orders that contain at least one item belonging to this partner
  const myRelevantOrders = useMemo(() => {
    if (!allOrders || !user?.uid) return [];
    return allOrders.filter(order => 
      order.items?.some(item => item.ownerId === user.uid)
    );
  }, [allOrders, user?.uid]);

  const handleUpdateFulfillment = async (orderId: string) => {
    if (!firestore) return;
    const data = fulfillmentData[orderId];
    if (!data?.courier || !data?.trackingId) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please provide both courier name and tracking ID.' });
      return;
    }

    setUpdatingId(orderId);
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'shipped',
        courier: data.courier.trim(),
        tracking_id: data.trackingId.trim(),
        updated_at: serverTimestamp(),
      });
      toast({ title: 'Order Dispatched', description: 'Logistics details have been synced with the buyer.' });
      setFulfillmentData(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    if (!firestore) return;
    setUpdatingId(orderId);
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'delivered',
        updated_at: serverTimestamp(),
      });
      toast({ title: 'Delivered', description: 'Order marked as successfully acquired.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading || !isRoleLoaded) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />)}
      </div>
    );
  }

  // If the user isn't actually a wholesaler but somehow arrived here, show nothing to avoid permission errors
  if (!isWholesaler) return null;

  if (myRelevantOrders.length === 0) {
    return (
      <Card className="rounded-[3rem] border-2 border-dashed py-24 text-center bg-muted/20">
        <div className="max-w-xs mx-auto space-y-4">
          <div className="bg-white p-6 rounded-full w-fit mx-auto shadow-xl">
             <Clock className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-headline text-primary">No Pending Fulfillment</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All your artisanal acquisitions are currently up to date. You will be notified when a new piece is acquired from your collection.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-5 w-5 text-accent-foreground" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Active Logistics Queue ({myRelevantOrders.length})
        </p>
      </div>

      {myRelevantOrders.map((order) => (
        <Card key={order.id} className="overflow-hidden rounded-[2.5rem] border-primary/5 shadow-xl transition-all hover:shadow-2xl">
          <CardHeader className="bg-primary p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Acquisition Reference</p>
                <CardTitle className="text-xl font-black">#{order.id.slice(-8).toUpperCase()}</CardTitle>
              </div>
              <Badge variant={order.status === 'delivered' ? 'secondary' : 'outline'} className="bg-white/10 text-white border-white/20 uppercase font-black text-[9px] px-4 py-1">
                {order.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Order Items */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <Package className="h-3 w-3" /> Pieces to Fulfill
                </h4>
                <div className="space-y-4">
                  {order.items?.filter(i => i.ownerId === user?.uid).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-headline text-lg text-primary">{item.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-accent-foreground mb-2">Delivery Destination</h5>
                   <p className="text-sm font-bold text-primary">{order.shipping_details?.name}</p>
                   <p className="text-xs text-muted-foreground">{order.shipping_details?.address}, {order.shipping_details?.city} - {order.shipping_details?.zip}</p>
                   <p className="text-xs font-bold mt-2 text-primary/70">{order.shipping_details?.phone}</p>
                </div>
              </div>

              {/* Fulfillment Tools */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Logistics Portal
                </h4>

                {order.status === 'paid' ? (
                  <div className="space-y-4 bg-muted/20 p-6 rounded-[2rem] border border-primary/5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Courier Service</Label>
                      <Input 
                        placeholder="e.g. BlueDart, Delhivery" 
                        className="rounded-xl h-12 bg-white"
                        value={fulfillmentData[order.id]?.courier || ''}
                        onChange={(e) => setFulfillmentData(prev => ({ 
                          ...prev, 
                          [order.id]: { ...prev[order.id], courier: e.target.value } 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tracking Number</Label>
                      <Input 
                        placeholder="AWB / Reference ID" 
                        className="rounded-xl h-12 bg-white"
                        value={fulfillmentData[order.id]?.trackingId || ''}
                        onChange={(e) => setFulfillmentData(prev => ({ 
                          ...prev, 
                          [order.id]: { ...prev[order.id], trackingId: e.target.value } 
                        }))}
                      />
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl bg-primary text-white shadow-lg"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateFulfillment(order.id)}
                    >
                      {updatingId === order.id ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                      Sync Dispatch Data
                    </Button>
                  </div>
                ) : order.status === 'shipped' ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex items-center gap-4">
                       <Truck className="h-8 w-8 text-green-600" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-700">In Transit via {order.courier}</p>
                          <p className="text-xl font-black text-green-900 tracking-tight">{order.tracking_id}</p>
                       </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 rounded-2xl border-primary/20 text-primary"
                      disabled={updatingId === order.id}
                      onClick={() => handleMarkDelivered(order.id)}
                    >
                      {updatingId === order.id ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Package className="mr-2 h-5 w-5" />}
                      Confirm Delivery
                    </Button>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 opacity-60">
                     <CheckCircle2 className="h-12 w-12 text-green-600" />
                     <p className="font-headline text-xl text-primary">Acquisition Fulfilled</p>
                     <p className="text-xs text-muted-foreground italic">This masterpiece has reached its destination.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}