'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Package, Truck, Loader2, CheckCircle2, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';

export function PartnerOrders() {
  const { user } = useUser();
  const { isWholesaler, isRoleLoaded } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Guard the query: only run if the user is confirmed as a wholesaler
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !isWholesaler) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'));
  }, [firestore, isWholesaler]);

  const { data: allOrders, isLoading } = useCollection<Order>(ordersQuery as any);

  // Filter orders on the frontend to show only those containing this wholesaler's items
  const myOrders = allOrders?.filter(order => 
    order.items.some(item => item.ownerId === user?.uid)
  ) || [];

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!firestore) return;
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { 
        status,
        updated_at: new Date()
      });
      toast({ title: 'Status Updated', description: `Order is now ${status}.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateTracking = async (orderId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    const tracking_id = formData.get('tracking_id') as string;
    const courier = formData.get('courier') as string;

    setUpdatingId(orderId);
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { 
        tracking_id,
        courier,
        status: 'shipped',
        updated_at: new Date()
      });
      toast({ title: 'Tracking Dispatched', description: 'Logistics data synced with customer.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isRoleLoaded || isLoading) {
    return <div className="space-y-4 pt-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (myOrders.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
        <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-muted-foreground font-headline text-xl">No active acquisitions for your boutique.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {myOrders.map((order) => (
        <Card key={order.id} className="rounded-[2rem] border-none shadow-lg overflow-hidden bg-card">
          <div className="bg-primary/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
               <h3 className="font-headline text-xl text-primary lowercase">order #{order.id.slice(-8)}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{order.created_at ? format(order.created_at.toDate(), 'PPP p') : 'Pending...'}</p>
             </div>
             <Badge className="bg-accent text-accent-foreground border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5">
               {order.status}
             </Badge>
          </div>

          <CardContent className="p-8 grid md:grid-cols-2 gap-10">
            {/* Customer & Items */}
            <div className="space-y-6">
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <User className="h-4 w-4" /> Recipient
                  </h4>
                  <div className="text-sm font-bold text-primary px-4 py-3 bg-muted/30 rounded-xl">
                    {order.shipping_details?.name}
                    <p className="text-[10px] font-normal text-muted-foreground mt-1 flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> {order.shipping_details?.city}
                    </p>
                  </div>
               </div>

               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Acquired Items</h4>
                  <div className="space-y-2">
                    {order.items.filter(i => i.ownerId === user?.uid).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded-xl bg-white">
                        <span className="text-sm font-bold">{item.name}</span>
                        <span className="text-[10px] font-black uppercase bg-muted px-2 py-1 rounded">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Logistics Management */}
            <div className="space-y-6 border-l md:pl-10 border-primary/5">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Curation Status</h4>
                <Select onValueChange={(v) => handleUpdateStatus(order.id, v)} defaultValue={order.status}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (Awaiting Review)</SelectItem>
                    <SelectItem value="ready for packaging">Ready for Packaging</SelectItem>
                    <SelectItem value="shipped">Handed to Courier</SelectItem>
                    <SelectItem value="delivered">Delivered to Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Logistics Update</h4>
                <form onSubmit={(e) => handleUpdateTracking(order.id, e)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="courier" placeholder="Courier (e.g. DHL)" className="h-10 rounded-xl text-xs" defaultValue={order.courier} required />
                    <Input name="tracking_id" placeholder="Tracking ID" className="h-10 rounded-xl text-xs" defaultValue={order.tracking_id} required />
                  </div>
                  <Button type="submit" disabled={updatingId === order.id} className="w-full h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                    {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Truck className="mr-2 h-4 w-4" /> Ship Package</>}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}