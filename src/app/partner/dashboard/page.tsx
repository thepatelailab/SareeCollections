'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerInventory } from './components/partner-inventory';
import { PartnerOrders } from './components/partner-orders';
import { WholesalerAddSareeDialog } from './components/add-saree-dialog';
import { LayoutDashboard, Store, Package, TrendingUp, Handshake, LogOut, Truck, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signOut } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function PartnerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { isWholesaler } = useAppContext();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !isWholesaler) {
      router.push('/');
    }
  }, [user, isUserLoading, isWholesaler, router]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
      router.push('/');
    }
  };

  const copyBoutiqueLink = () => {
    if (typeof window !== 'undefined' && user?.uid) {
      const link = `${window.location.origin}/partners/${user.uid}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: 'Boutique Link Copied!', description: 'Share this link on your WhatsApp or Instagram bio.' });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (isUserLoading || !isWholesaler) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl text-white shadow-xl">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline text-primary">Wholesale Center</h1>
            <p className="text-muted-foreground font-medium italic">Partner: {user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <WholesalerAddSareeDialog />
          <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full h-12 w-12 border-primary/10">
            <LogOut className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Campaign Toolcard */}
        <Card className="md:col-span-2 rounded-[2rem] border-primary/10 bg-accent/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Share2 className="h-24 w-24 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Heritage Social Campaign</CardTitle>
            <CardDescription>Share your unique boutique profile with global buyers to drive direct wholesale orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-primary/5 shadow-inner">
               <div className="flex-1 truncate text-xs font-mono text-muted-foreground">
                 {typeof window !== 'undefined' ? `${window.location.origin}/partners/${user?.uid}` : '...'}
               </div>
               <Button onClick={copyBoutiqueLink} variant={copied ? "default" : "secondary"} className="rounded-xl px-6 h-12">
                 {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5 mr-2" />}
                 {copied ? "Copied" : "Copy Link"}
               </Button>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="px-3 py-1.5 border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary/60">
                Instagram Bio Ready
              </Badge>
               <Badge variant="outline" className="px-3 py-1.5 border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary/60">
                WhatsApp Status Ready
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-primary/5 shadow-md flex flex-col justify-center items-center text-center p-8 bg-primary text-primary-foreground">
           <TrendingUp className="h-12 w-12 mb-4 text-accent" />
           <h3 className="text-4xl font-black mb-1">INR 45,200</h3>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Wholesale Sales</p>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Store className="h-4 w-4" /> My Catalog
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Shipments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <PartnerInventory />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <PartnerOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <Card className="rounded-[2rem] border-primary/5 shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-xl bg-muted/50 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-primary tracking-tight">{value}</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
