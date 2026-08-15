'use client';
import { useState } from 'react';
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
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(4, 'ZIP code is required'),
});

// IMPORTANT: Update these with your Cloud Run URL and Razorpay Key ID
const RAZORPAY_API_BASE = 'https://razorpay-webapi-your-id.a.run.app';
const RAZORPAY_KEY_ID = 'rzp_test_your_key_id'; 

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
    if (!window.Razorpay) {
      toast({ 
        variant: 'destructive', 
        title: 'Payment Error', 
        description: 'Razorpay SDK failed to load. Please check your internet connection.' 
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on your Cloud Run backend
      const response = await fetch(`${RAZORPAY_API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(cartTotal * 100), // convert to paise
          user_id: user?.uid,
          items: cartItems.map(i => i.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initiate order');
      }

      const order = await response.json();

      // 2. Open Razorpay Modal
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Saree Dukan",
        description: `Purchase of ${cartCount} heritage sarees`,
        order_id: order.id,
        handler: function (response: any) {
          toast({ 
            title: 'Payment Successful', 
            description: 'Your order has been placed successfully.' 
          });
          clearCart();
          router.push('/');
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city} - ${formData.zip}`
        },
        theme: {
          color: "#40000A", // Signature Maroon
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({ 
          variant: 'destructive', 
          title: 'Payment Failed', 
          description: response.error.description 
        });
      });
      rzp.open();
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Order Initialization Failed', 
        description: err.message 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartCount === 0) return null;

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-8">
          <CardTitle className="font-headline text-3xl">Shipping Details</CardTitle>
          <CardDescription className="text-primary-foreground/70">Where should we deliver your heritage piece?</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
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
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-6">
                <FormField name="city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="zip" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} className="rounded-xl h-12" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <Separator className="my-8" />

              <div className="bg-muted/30 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Total ({cartCount} items)</span>
                  <span className="text-2xl font-black text-primary">INR {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                  <ShieldCheck className="h-4 w-4" /> Secure Payment via Razorpay
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-8 text-xl font-headline bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Preparing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-6 w-6" /> Proceed to Pay
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}