'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroSettings } from './components/hero-settings';
import { LocationDiscovery } from './components/location-discovery';
import { EmailSettings } from './components/email-settings';
import { ImageIcon, Sparkles, Settings, Handshake, Check, X, Mail, MapPin } from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { WholesalerRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export default function AdminSettingsPage() {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAppLoading } = useAppContext();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'wholesalerRequests'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: requests, isLoading: isRequestsLoading } = useCollection<WholesalerRequest>(requestsQuery as any);

  useEffect(() => {
    if (!isUserLoading && !isAppLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, isAppLoading, isAdmin, router]);

  const handleUpdateRequest = async (request: WholesalerRequest, status: 'approved' | 'rejected') => {
    if (!firestore || !request.id) return;
    try {
      const docRef = doc(firestore, 'wholesalerRequests', request.id);
      await updateDoc(docRef, { status });
      toast({ title: `Partner ${status}` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  if (isUserLoading || isAppLoading || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-headline text-primary">Master Control Center</h1>
          <p className="text-muted-foreground">Manage store operations and configuration.</p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[700px] bg-muted/40 p-1 rounded-2xl h-14 border">
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-white">
            <ImageIcon className="h-4 w-4" /> Style
          </TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-white">
            <Sparkles className="h-4 w-4" /> Discovery
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-white">
            <Handshake className="h-4 w-4" /> Partners
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-white">
            <Mail className="h-4 w-4" /> Emails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <HeroSettings />
        </TabsContent>

        <TabsContent value="discovery">
          <LocationDiscovery />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="partners">
          <Card className="rounded-[2.5rem] shadow-xl border-primary/5">
            <CardHeader className="p-8">
              <CardTitle className="text-3xl font-headline text-primary">Wholesaler Applications</CardTitle>
              <CardDescription>Review and approve new partnership requests.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {isRequestsLoading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : !requests || requests.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-[2rem] bg-muted/20">
                   <Handshake className="h-16 w-16 text-muted-foreground mx-auto opacity-20 mb-4" />
                   <p className="text-muted-foreground font-medium">No applications pending.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((req) => (
                    <div 
                      key={req.id} 
                      className="p-6 border rounded-[2rem] bg-card hover:shadow-lg transition-all border-primary/5 flex flex-col justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline text-2xl text-primary leading-tight">{req.name}</h3>
                          <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'} className="uppercase font-black text-[9px] tracking-widest">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> {req.address.split(',')[0]}...
                        </p>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full rounded-xl h-12">Review Application</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
                          <div className="bg-primary p-10 text-primary-foreground">
                             <DialogHeader>
                                <DialogTitle className="text-4xl font-headline">{req.name}</DialogTitle>
                             </DialogHeader>
                          </div>
                          
                          <div className="p-10 space-y-8 bg-background">
                            <div className="grid grid-cols-2 gap-8">
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Representative</h4>
                                 <p className="font-bold text-primary">{req.name}</p>
                                 <p className="text-sm text-muted-foreground">{req.email}</p>
                               </div>
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</h4>
                                 <p className="font-bold text-primary">{req.phone}</p>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Address</h4>
                               <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-2xl">
                                 {req.address}
                               </p>
                            </div>

                            {req.status === 'pending' && (
                              <DialogFooter className="pt-6 border-t border-primary/5 flex gap-3">
                                <Button 
                                  onClick={() => handleUpdateRequest(req, 'approved')} 
                                  className="flex-1 h-14 rounded-2xl bg-primary text-white"
                                >
                                  <Check className="h-5 w-5 mr-2" /> Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleUpdateRequest(req, 'rejected')}
                                  className="flex-1 h-14 rounded-2xl text-destructive"
                                >
                                  <X className="h-5 w-5 mr-2" /> Reject
                                </Button>
                              </DialogFooter>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}