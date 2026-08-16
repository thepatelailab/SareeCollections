
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
import { ActivityTracker } from './components/activity-tracker';
import { Image as ImageIcon, Sparkles, Settings, Handshake, Check, X, Mail, BarChart3 } from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { WholesalerRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
          <p className="text-muted-foreground">Manage store operations, analytics, and automation.</p>
        </div>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[900px]">
          <TabsTrigger value="activity" className="flex items-center gap-2 text-xs">
            <BarChart3 className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs">
            <ImageIcon className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-2 text-xs">
            <Sparkles className="h-4 w-4" /> Discovery
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2 text-xs">
            <Handshake className="h-4 w-4" /> Partners
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 text-xs">
            <Mail className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <ActivityTracker />
        </TabsContent>

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
          <Card>
            <CardHeader>
              <CardTitle>Wholesaler Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {isRequestsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !requests || requests.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No partnership applications.</p>
              ) : (
                <div className="space-y-6">
                  {requests.map((req) => (
                    <div key={req.id} className="p-6 border rounded-2xl flex justify-between gap-6">
                      <div className="space-y-2">
                        <h3 className="font-headline text-xl text-primary">{req.name}</h3>
                        <p className="text-sm text-muted-foreground">{req.address}</p>
                        <Badge variant={req.status === 'approved' ? 'default' : 'secondary'}>{req.status}</Badge>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleUpdateRequest(req, 'approved')} className="bg-green-600">
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateRequest(req, 'rejected')}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
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
