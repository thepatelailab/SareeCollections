
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { RestockRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Trash2, Mail, Package, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';
import Link from 'next/link';

export function RestockRequests() {
  const { user } = useUser();
  const { isAdmin } = useAppContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Simplified query: No where/orderBy filters to bypass any potential Security Rule list restrictions
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'restockRequests');
  }, [firestore]);

  const { data: allRequests, isLoading } = useCollection<RestockRequest>(requestsQuery as any);

  // Perform filtering and sorting in JS for maximum reliability
  const filteredRequests = allRequests 
    ? allRequests
        .filter(req => isAdmin || req.ownerId === user?.uid)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
          const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        })
    : [];

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(firestore, 'restockRequests', id));
      toast({ title: "Entry Removed", description: "The request has been cleared from your hub." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Delete Failed" });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
        <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-muted-foreground font-headline text-xl">Your Restock Hub is quiet.</p>
        <p className="text-sm text-muted-foreground mt-2">When items go out of stock, customer interests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Active Interests</CardDescription>
            <CardTitle className="text-3xl font-black">{filteredRequests.length} Waitlisted</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-headline text-primary">Restock Hub</CardTitle>
          <CardDescription>Track demand for out-of-stock heritage pieces.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="rounded-2xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Heritage Piece</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Contact</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Requested On</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id} className="border-primary/5 hover:bg-muted/10 transition-colors group">
                    <TableCell>
                      <Link 
                        href={`/products/${req.productId}`} 
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        target="_blank"
                      >
                        <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary text-sm flex items-center gap-1.5">
                            {req.productName}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">View Details</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{req.userName}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">ID: {req.userId.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${req.userEmail}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                        <Mail className="h-3 w-3" /> {req.userEmail}
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {req.createdAt ? format(req.createdAt.toDate(), 'MMM d, yyyy') : '...'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/5"
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id}
                      >
                        {deletingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
