'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Archive, ExternalLink, Package, IndianRupee, Eye, RefreshCw, Loader2, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialCampaignDialog } from './social-campaign-dialog';
import { useState } from 'react';
import { useAppContext } from '@/components/providers/app-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PartnerInventory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { archiveProduct, deleteProductPermanently } = useAppContext();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

  const myProductsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'SareeCollection'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: products, isLoading } = useCollection<Product>(myProductsQuery as any);

  const handleArchiveToggle = async (productId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const action = !currentStatus ? 'archive' : 'restore';
    
    setUpdatingId(productId);
    try {
      await archiveProduct(productId, !currentStatus);
      toast({ title: `Item ${!currentStatus ? 'Archived' : 'Restored'}`, description: `The product visibility has been updated.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update archive status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePermanently = async (productId: string) => {
    setUpdatingId(productId);
    try {
      await deleteProductPermanently(productId);
      toast({ title: 'Permanently Deleted', description: 'Record and images removed from storage.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Deletion Failed' });
    } finally {
      setUpdatingId(null);
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

  const handleUpdatePrice = async (productId: string) => {
    if (!firestore) return;
    const newPrice = parseFloat(priceInputs[productId]);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ variant: 'destructive', title: 'Invalid Price', description: 'Please enter a valid price.' });
      return;
    }

    setUpdatingId(productId);
    try {
      const docRef = doc(firestore, 'SareeCollection', productId);
      await updateDoc(docRef, { price: newPrice });
      toast({ title: 'Price Updated', description: 'New retail price is now live.' });
      setPriceInputs(prev => ({ ...prev, [productId]: '' }));
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

  // Sort: Archived items at the bottom
  const sortedProducts = [...products].sort((a, b) => {
    if (a.isArchived === b.isArchived) return 0;
    return a.isArchived ? 1 : -1;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedProducts.map((product) => (
        <Card key={product.id} className={`group overflow-hidden rounded-[2.5rem] border-primary/5 shadow-lg transition-all hover:shadow-2xl flex flex-col ${product.isArchived ? 'bg-muted/30 opacity-70' : ''}`}>
          <div className={`aspect-[4/5] relative overflow-hidden ${product.isArchived ? 'grayscale-[0.8]' : ''}`}>
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
              {product.isArchived && (
                <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase flex items-center gap-1">
                  <Archive className="h-2 w-2" /> Archived
                </Badge>
              )}
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-xl text-primary">{product.name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">
                  {product.isArchived ? 'Hidden from Store' : 'Wholesale Listed'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
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
              {!product.isArchived && (
                <div className="p-3 bg-primary/5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <RefreshCw className="h-2.5 w-2.5" /> Quick Restock
                    </Label>
                    <span className="text-[9px] font-bold opacity-50">Current: {product.stock || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="New qty" 
                      className="h-8 rounded-lg border-none shadow-sm text-[10px]"
                      value={stockInputs[product.id] || ''}
                      onChange={(e) => setStockInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                    />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 rounded-lg px-2 text-[10px] font-bold"
                      onClick={() => handleUpdateStock(product.id)}
                      disabled={updatingId === product.id}
                    >
                      {updatingId === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Price Update Section */}
              {!product.isArchived && (
                <div className="p-3 bg-accent/5 rounded-2xl space-y-2 border border-accent/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-accent-foreground flex items-center gap-1.5">
                      <DollarSign className="h-2.5 w-2.5" /> Update Price
                    </Label>
                    <span className="text-[9px] font-bold opacity-50">INR {product.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="New price" 
                      className="h-8 rounded-lg border-none shadow-sm text-[10px]"
                      value={priceInputs[product.id] || ''}
                      onChange={(e) => setPriceInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                    />
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="h-8 rounded-lg px-2 text-[10px] font-bold bg-accent text-accent-foreground hover:bg-accent/80"
                      onClick={() => handleUpdatePrice(product.id)}
                      disabled={updatingId === product.id}
                    >
                      {updatingId === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Update'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-full text-[10px] font-black uppercase" asChild disabled={product.isArchived}>
                  <Link href={`/products/${product.id}`} target="_blank">
                    <Eye className="h-3 w-3 mr-2" /> View Live
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-full ${product.isArchived ? 'text-green-600 border-green-200' : 'text-primary border-primary/20 hover:bg-primary/5'}`}
                  onClick={() => handleArchiveToggle(product.id, product.isArchived || false)}
                  disabled={updatingId === product.id}
                >
                  {updatingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : product.isArchived ? <RefreshCw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </Button>

                {/* Permanent Delete Action - Only for Archived Items to Save Cost */}
                {product.isArchived && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full text-destructive border-destructive/20 hover:bg-destructive/5" disabled={updatingId === product.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-2xl flex items-center gap-2">
                           <AlertTriangle className="text-destructive h-6 w-6" /> Permanent Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base leading-relaxed">
                          This action is irreversible. We will remove the product record and <strong>permanently delete all images from our storage servers</strong> to reduce costs.
                          <br/><br/>
                          Note: Order history for customers who already bought this item might show missing images.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl h-12">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePermanently(product.id)} className="rounded-xl h-12 bg-destructive text-white hover:bg-destructive/90">
                           Confirm & Clear Storage
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {!product.isArchived && <SocialCampaignDialog product={product} />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
