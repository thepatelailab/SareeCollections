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
import { Package, Truck, Loader2, CheckCircle2, User, MapPin, Mail, Phone, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';

export function PartnerOrders() {
  const { user } = useUser();
  const { isWholesaler, isAdmin, isRoleLoaded } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || (!isWholesaler && !isAdmin)) return null;
    return query(collection(firestore, 'orders'), orderBy('created_at', 'desc'));
  }, [firestore, isWholesaler, isAdmin]);

  const { data: allOrders, isLoading } = useCollection<Order>(ordersQuery as any);

  const myOrders = allOrders?.filter(order => 
    order.items && Array.isArray(order.items) && order.items.some(item => item.ownerId === user?.uid)
  ) || [];

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold; color: #40000A;">${item.name}</div>
          <div style="font-size: 10px; color: #666;">ID: ${item.id}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">INR ${item.price?.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">INR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans&display=swap');
            body { font-family: 'PT Sans', sans-serif; padding: 50px; color: #333; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; border-bottom: 4px solid #40000A; padding-bottom: 20px; }
            .logo { font-family: 'Playfair Display', serif; font-size: 32px; color: #40000A; text-transform: lowercase; }
            .title { font-family: 'Playfair Display', serif; font-size: 24px; color: #40000A; }
            .grid { display: grid; grid-cols: 2; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #F9F9F4; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .total-section { margin-top: 40px; text-align: right; border-top: 2px solid #40000A; padding-top: 20px; }
            .total-row { font-size: 24px; font-weight: bold; color: #40000A; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">SareeDukan.Com</div>
                <p style="font-size: 12px; color: #666; margin-top: 5px;">Authentic Heritage Marketplace</p>
              </div>
              <div style="text-align: right;">
                <div class="title">Official Invoice</div>
                <p style="font-size: 12px;">Ref: <strong>#${order.id.slice(-8).toUpperCase()}</strong></p>
                <p style="font-size: 12px;">Date: ${format(new Date(), 'MMMM do, yyyy')}</p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
              <div style="width: 45%;">
                <div class="section-title">Shipping Details</div>
                <div style="font-size: 14px;">
                  <strong>${order.shipping_details?.name}</strong><br>
                  ${order.shipping_details?.address}<br>
                  ${order.shipping_details?.city} - ${order.shipping_details?.zip}<br>
                  <span style="color: #666;">Phone: ${order.shipping_details?.phone}</span><br>
                  <span style="color: #666;">Email: ${order.shipping_details?.email}</span>
                </div>
              </div>
              <div style="width: 45%; text-align: right;">
                <div class="section-title">Payment Information</div>
                <div style="font-size: 14px;">
                  Status: <strong style="color: #22c55e; text-transform: uppercase;">${order.status}</strong><br>
                  Method: Razorpay Secure<br>
                  Currency: INR
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-section">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Grand Total</div>
              <div class="total-row">INR ${(order.amount_paise / 100).toLocaleString()}</div>
            </div>

            <div class="footer">
              <p>Thank you for supporting traditional artisans and heritage looms.</p>
              <p>This is a computer-generated document. No signature required.</p>
              <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} SareeDukan.Com</p>
            </div>
          </div>
          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print(); 
                window.onafterprint = function() { window.close(); };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
             <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 rounded-xl bg-white border-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  onClick={() => handlePrintInvoice(order)}
                >
                  <Printer className="h-3.5 w-3.5 mr-2" /> Print Invoice
                </Button>
                <Badge className="bg-accent text-accent-foreground border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 shadow-sm">
                  {order.status}
                </Badge>
             </div>
          </div>

          <CardContent className="p-8 grid md:grid-cols-2 gap-10">
            {/* Customer & Items */}
            <div className="space-y-6">
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <User className="h-4 w-4" /> Recipient Details
                  </h4>
                  <div className="p-5 bg-muted/30 rounded-2xl border border-primary/5 space-y-2">
                    <div>
                      <p className="text-sm font-bold text-primary">{order.shipping_details?.name}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
                        {order.shipping_details?.address}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3" /> {order.shipping_details?.city} - {order.shipping_details?.zip}
                      </p>
                    </div>
                    
                    <div className="pt-3 flex flex-col gap-1.5 border-t border-primary/5 mt-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70">
                        <Mail className="h-3 w-3" /> {order.shipping_details?.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70">
                        <Phone className="h-3 w-3" /> {order.shipping_details?.phone}
                      </div>
                    </div>
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
