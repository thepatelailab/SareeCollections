'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '@/components/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function CartView() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
  } = useCartContext();

  if (cartCount === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-headline">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map(item => (
          <Card key={item.id} className="flex items-center p-4">
            <div className="relative h-24 w-24 rounded-md overflow-hidden mr-4">
              <Image
                src={item.sareeImg}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-headline">{item.name}</h3>
              <p className="text-muted-foreground text-sm">
                Unit Price: INR {item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e =>
                  updateQuantity(item.id, parseInt(e.target.value, 10))
                }
                className="w-20"
                aria-label={`Quantity for ${item.name}`}
              />
              <p className="w-24 text-right font-semibold">
                INR {(item.price * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <h2 className="text-xl font-headline">Order Summary</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({cartCount} items)</span>
              <span>INR {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>INR {cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
