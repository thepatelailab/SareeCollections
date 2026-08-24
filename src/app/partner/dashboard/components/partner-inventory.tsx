'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ExternalLink, Package, IndianRupee, Eye, RefreshCw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialCampaignDialog } from './social-campaign-dialog';
import { useState } from 'react';

export function PartnerInventory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  const myProductsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'SareeCollection'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: products, isLoading } = useCollection<Product>(myProductsQuery as any);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm('Are you sure you want to remove this piece from your boutique?')) return;
    
    try {
      await deleteDoc(doc(firestore, 'SareeCollection', id));
      toast({ title: 'Item Removed', description: 'Product has been deleted from your inventory.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
    }
  };

  const handleUpdateStock = async (productId: string) => {
    if (!firestore) return;
    const newStock = parseInt(stockInputs[productId]);
    if (isNaN(newStock) || newStock < 0) {
      toast({ variant: 'destructive', title: 'Invalid Stock', description: 'Please enter a valid non-negative number.' });
      return;
    }

    setUpdatingId(productId);
    try {
      const docRef = doc(firestore, 'SareeCollection', productId);
      await updateDoc(docRef, { stock: newStock });
      toast({ title: 'Inventory Updated', description: 'Stock levels have been synced.' });
      setStockInputs(prev => ({ ...prev, [productId]: '' }));
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />)}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="border-dashed py-20 flex flex-col items-center text-center">
        <Package className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-xl font-headline text-primary">No Arrivals Yet</h3>
        <p className="text-muted-foreground mt-2 max-w-xs">Start building your catalog by clicking the 'Upload New Arrival' button above.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-primary/5 shadow-lg transition-all hover:shadow-2xl flex flex-col">
          <div className="aspect-[4/5] relative overflow-hidden">
            <Image 
              src={product.sareeImg} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[10px] font-black tracking-widest uppercase">
                {product.variety}
              </Badge>
              <Badge className={`${(product.stock || 0) > 0 ? 'bg-accent text-accent-foreground' : 'bg-destructive text-white'} border-none text-[9px] font-black uppercase`}>
                {(product.stock || 0) > 0 ? `Stock: ${product.stock}` : 'Sold Out'}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-xl text-primary">{product.name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">
                  Wholesale Listed
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Wholesale</span>
                  <span className="font-bold text-primary flex items-center"><IndianRupee className="h-3 w-3" /> {product.wholesalePrice || product.price}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Retail</span>
                  <span className="font-bold text-muted-foreground flex items-center justify-end"><IndianRupee className="h-3 w-3" /> {product.price}</span>
                </div>
              </div>

              {/* Quick Restock Section */}
              <div className="p-4 bg-primary/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                     <RefreshCw className="h-3 w-3" /> Quick Restock
                   </Label>
                   <span className="text-[10px] font-bold opacity-50">Current: {product.stock || 0}</span>
                </div>
                <div className="flex gap-2">
                   <Input 
                    type="number" 
                    placeholder="Set new qty" 
                    className="h-9 rounded-xl border-none shadow-sm text-xs"
                    value={stockInputs[product.id] || ''}
                    onChange={(e) => setStockInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                   />
                   <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-9 rounded-xl px-3"
                    onClick={() => handleUpdateStock(product.id)}
                    disabled={updatingId === product.id}
                   >
                     {updatingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync'}
                   </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-full text-[10px] font-black uppercase" asChild>
                  <Link href={`/products/${product.id}`} target="_blank">
                    <Eye className="h-3 w-3 mr-2" /> View Live
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <SocialCampaignDialog product={product} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
