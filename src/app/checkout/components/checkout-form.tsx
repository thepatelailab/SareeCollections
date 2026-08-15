'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartContext } from '@/components/providers/cart-provider';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(4, 'ZIP code is required'),
});

// Helper to get clean base URL
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
  const { clearCart, cartTotal, cartCount, cartItems } = useCartContext();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredKey, setDiscoveredKey] = useState<string | null>(null);

  useEffect(() => {
    // Discovery logic: if NEXT_PUBLIC_RAZORPAY_KEY_ID is missing, fetch it from backend
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
        console.warn('API Config discovery failed, relying on env vars.');
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

  const handlePayment = async (formData: z.infer<typeof checkoutSchema>) => {
    const activeKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || discoveredKey;

    if (!activeKey || activeKey.includes('your_key_id')) {
      setError("Razorpay Key ID missing. Ensure RAZORPAY_KEY_ID is set in Cloud Run and the API is reachable.");
      return;
    }

    if (!window.Razorpay) {
      toast({ 
        variant: 'destructive', 
        title: 'Payment Error', 
        description: 'Razorpay SDK not loaded. Please try again.' 
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
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
        const errData = await response.json().catch(() => ({ detail: 'Backend Error' }));
        throw new Error(errData.detail || 'Failed to create order');
      }

      const order = await response.json();

      const options = {
        key: activeKey,
        amount: order.amount,
        currency: order.currency,
        name: "SareeDukan.Com",
        description: "Heritage Handloom Acquisition",
        order_id: order.id,
        handler: function (response: any) {
          toast({ title: 'Success!', description: 'Your masterpiece is on its way.' });
          clearCart();
          router.push('/');
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#40000A" },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setError(resp.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "Checkout failed to initialize.");
    }
  };

  if (cartCount === 0) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-8">
          <CardTitle className="font-headline text-3xl">Shipping & Payment</CardTitle>
          <CardDescription className="text-primary-foreground/70">Finalize your heritage acquisition.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3 text-sm font-bold">
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
                <div className="space-y-1">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Amount</span>
                  <div className="text-3xl font-black text-primary">INR {cartTotal.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <ShieldCheck className="h-4 w-4" /> Secure via Razorpay
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-8 text-xl font-headline bg-primary hover:bg-primary/90 rounded-2xl shadow-xl" 
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><CreditCard className="mr-2 h-6 w-6" /> Acquire Now</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
