'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const getCartKey = useCallback(() => {
    if (isUserLoading) return null;
    const userId = user && !user.isAnonymous ? user.uid : 'anonymous';
    return `saree-avatar-cart-${userId}`;
  }, [user, isUserLoading]);

  // Effect to load cart from localStorage when user or loading state changes
  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey) {
      const storedCart = localStorage.getItem(cartKey);
      setCartItems(storedCart ? JSON.parse(storedCart) : []);
    } else {
      // While user is loading, keep cart empty
      setCartItems([]);
    }
  }, [getCartKey]);

  // Effect to save cart to localStorage when items change
  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey && cartItems.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } else if (cartKey) {
      // If cart becomes empty, remove it from storage
      localStorage.removeItem(cartKey);
    }
  }, [cartItems, getCartKey]);


  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    const cartKey = getCartKey();
    if (cartKey) {
      localStorage.removeItem(cartKey);
    }
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [cartItems, cartCount, cartTotal, getCartKey]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
