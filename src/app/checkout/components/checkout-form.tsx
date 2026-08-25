'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartContext } from '@/components/providers/cart-provider';
import { useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { sendOrderEmails } from '@/app/actions/email-actions';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(4, 'ZIP code is required'),
});

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sareedukan-api-nx42xir6fq-uc.a.run.app';
  return url.replace(/\/+$/, '').split('/webhook')[0].split('/create-order')[0];
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm() {
  const { clearCart, cartTotal, cartItems } = useCartContext();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredKey, setDiscoveredKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(getApiBase());
        if (response.ok) {
          const data = await response.json();
          if (data.configuration?.public_key) {
            setDiscoveredKey(data.configuration.public_key);
          }
        }
      } catch (err) {
        console.warn('API Config discovery failed.');
      }
    };
    fetchConfig();
  }, []);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      zip: '',
    },
  });

  const checkStockAvailability = async () => {
    if (!firestore) return true;
    
    const outOfStockItems: string[] = [];
    
    try {
      for (const item of cartItems) {
        const productRef = doc(firestore, 'SareeCollection', item.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock ?? 0;
          if (currentStock <= 0) {
            outOfStockItems.push(item.name);
          }
        }
      }
    } catch (e) {
      console.warn("Stock verification check bypassed due to connectivity.");
    }
    
    if (outOfStockItems.length > 0) {
      setError(`Sorry, the following items are currently out of stock: ${outOfStockItems.join(', ')}. Please remove them from your cart to proceed.`);
      return false;
    }
    
    return true;
  };

  const handlePayment = async (formData: z.infer<typeof checkoutSchema>) => {
    const activeKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || discoveredKey;

    if (!activeKey) {
      setError("Razorpay Configuration Missing.");
      return;
    }

    if (!window.Razorpay) {
      toast({ variant: 'destructive', title: 'Payment Error', description: 'SDK not loaded.' });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const isAvailable = await checkStockAvailability();
      if (!isAvailable) {
        setIsProcessing(false);
        return;
      }

      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(cartTotal * 100),
          user_id: user?.uid,
          items: cartItems.map(i => i.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create order' }));
        let detailMsg = 'Failed to create order';
        if (typeof errorData.detail === 'string') {
          detailMsg = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          detailMsg = errorData.detail[0]?.msg || JSON.stringify(errorData.detail);
        }
        throw new Error(detailMsg);
      }

      const order = await response.json();

      const options = {
        key: activeKey,
        amount: order.amount,
        currency: order.currency,
        name: "SareeDukan.Com",
        order_id: order.id,
        handler: async function () {
          if (firestore) {
             const orderRef = doc(firestore, 'orders', order.id);
             // Capture the best available image for the order history thumbnail
             await updateDoc(orderRef, {
                status: 'paid', // Update status to paid immediately for better UX
                items: cartItems.map(i => ({
                  id: i.id,
                  name: i.name,
                  ownerId: i.ownerId || 'admin',
                  price: i.price,
                  image: i.thumbnailModelImg || i.modelImg || i.thumbnailImg || i.sareeImg,
                  quantity: i.quantity || 1
                })),
                shipping_details: formData,
                updated_at: new Date()
             }).catch(e => console.error("Order sync failed", e));

             const settings = await getDoc(doc(firestore, 'settings', 'email'));
             const senderEmail = settings.exists() ? settings.data().verifiedEmail : 'onboarding@resend.dev';
             
             await sendOrderEmails({
                buyerEmail: formData.email,
                buyerName: formData.name,
                orderId: order.id,
                amount: cartTotal,
                items: cartItems,
                shippingDetails: formData,
                senderEmail: senderEmail
             });
          }

          toast({ title: 'Success!', description: 'Order confirmed and details synced.' });
          clearCart();
          router.push(`/order-success?orderId=${order.id}`);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#40000A" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "Checkout failed.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-8">
          <CardTitle className="font-headline text-3xl text-center">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="name" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="email" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91" {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Delivery Address</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-6">
                <FormField name="city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="zip" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="bg-muted/30 p-6 rounded-3xl flex justify-between items-center mt-8">
                <div className="text-3xl font-black text-primary">INR {cartTotal.toFixed(2)}</div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <ShieldCheck className="h-4 w-4" /> Secure via Razorpay
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-8 text-xl font-headline bg-primary rounded-2xl shadow-xl" 
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><CreditCard className="mr-2 h-6 w-6" /> Place Order</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
