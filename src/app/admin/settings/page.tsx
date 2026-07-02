'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroSettings } from './components/hero-settings';
import { LocationDiscovery } from './components/location-discovery';
import { Image as ImageIcon, Sparkles, Settings, Handshake, Check, X, UserCheck } from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { WholesalerRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAppContext();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'wholesalerRequests'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading: isRequestsLoading } = useCollection<WholesalerRequest>(requestsQuery as any);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const handleUpdateRequest = async (request: WholesalerRequest, status: 'approved' | 'rejected') => {
    if (!firestore || !request.id) return;
    try {
      const docRef = doc(firestore, 'wholesalerRequests', request.id);
      await updateDoc(docRef, { status });
      
      toast({ 
        title: `Partner ${status}`, 
        description: status === 'approved' 
          ? `Application approved. Wholesaler can now sign up using ${request.email}.`
          : `Application has been rejected.`
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-headline text-primary">Admin Control Center</h1>
          <p className="text-muted-foreground">Manage store appearance, partners, and AI data.</p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs">
            <ImageIcon className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-2 text-xs">
            <Sparkles className="h-4 w-4" /> Discovery
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2 text-xs">
            <Handshake className="h-4 w-4" /> Partner Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <HeroSettings />
        </TabsContent>

        <TabsContent value="discovery" className="space-y-6">
          <LocationDiscovery />
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wholesaler Applications</CardTitle>
                <CardDescription>Review and approve manufacturing looms and regional partners.</CardDescription>
              </CardHeader>
              <CardContent>
                {isRequestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : !requests || requests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Handshake className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <p>No partnership applications found.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requests.map((req) => (
                      <div key={req.id} className="p-6 border rounded-2xl flex flex-col md:flex-row justify-between gap-6 transition-all hover:border-primary/20">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-headline text-xl text-primary">{req.name}</h3>
                            <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[9px] uppercase font-black">
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{req.address}</p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> {req.email}</span>
                            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> {req.phone}</span>
                            {req.isManufacturer && <Badge className="bg-accent text-accent-foreground text-[8px]">MANUFACTURER</Badge>}
                          </div>
                          <div className="pt-2">
                            <p className="text-xs font-medium"><span className="text-muted-foreground">Saree Types:</span> {req.sareeTypes}</p>
                          </div>
                        </div>
                        
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 self-start">
                            <Button size="sm" onClick={() => handleUpdateRequest(req, 'approved')} className="bg-green-600 hover:bg-green-700">
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateRequest(req, 'rejected')} className="text-destructive border-destructive/20 hover:bg-destructive/5">
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                        
                        {req.status === 'approved' && (
                          <div className="flex flex-col items-end gap-2 self-start">
                            <div className="flex items-center text-green-600 text-[10px] font-black uppercase gap-1">
                               <UserCheck className="h-4 w-4" /> Ready for Onboarding
                            </div>
                            <p className="text-[8px] text-muted-foreground italic max-w-[150px] text-right">
                              Partner can now register at /partner/login using this email.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
