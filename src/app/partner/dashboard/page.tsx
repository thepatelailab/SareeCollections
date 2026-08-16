'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerInventory } from './components/partner-inventory';
import { PartnerOrders } from './components/partner-orders';
import { WholesalerAddSareeDialog } from './components/add-saree-dialog';
import { LayoutDashboard, Store, Package, TrendingUp, Handshake, LogOut, Truck, Share2, Copy, CheckCircle2, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signOut } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where } from 'firebase/firestore';
import { Product, Order } from '@/lib/types';

export default function PartnerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { isWholesaler } = useAppContext();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
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

  // Competition Metrics Fetching
  const myProductsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'SareeCollection'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: products } = useCollection<Product>(myProductsQuery as any);

  const totalHearts = useMemo(() => {
    if (!products) return 0;
    return products.reduce((acc, p) => acc + (p.likes || 0) + (p.shares || 0), 0);
  }, [products]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'orders'), where('status', 'in', ['paid', 'shipped', 'delivered']));
  }, [firestore, user?.uid]);

  const { data: allOrders } = useCollection<Order>(ordersQuery as any);
  
  const totalRevenue = useMemo(() => {
    if (!allOrders || !user?.uid) return 0;
    const myOrders = allOrders.filter(o => o.items?.some(i => i.ownerId === user.uid));
    return myOrders.reduce((acc, o) => acc + (o.amount_paise / 100), 0);
  }, [allOrders, user?.uid]);

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
            <p className="text-muted-foreground font-medium italic">Partner Account: {user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <WholesalerAddSareeDialog />
          <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full h-12 w-12 border-primary/10">
            <LogOut className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Heritage Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Total Revenue" 
          value={`INR ${totalRevenue.toLocaleString()}`} 
          color="text-green-600" 
        />
        <StatCard 
          icon={Heart} 
          label="Heritage Hearts" 
          value={totalHearts.toString()} 
          color="text-red-500" 
        />
        <StatCard 
          icon={Package} 
          label="Active Inventory" 
          value={products?.length.toString() || '0'} 
          color="text-blue-600" 
        />
        <Card className="rounded-[2rem] border-primary/5 shadow-md flex flex-col justify-center items-center text-center p-6 bg-accent text-accent-foreground">
           <Award className="h-8 w-8 mb-2" />
           <h3 className="text-xl font-black uppercase tracking-widest">Elite Tier</h3>
           <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Based on Engagement</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Campaign Toolcard */}
        <Card className="md:col-span-2 rounded-[2.5rem] border-primary/10 bg-muted/20 overflow-hidden relative shadow-inner">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
            <Share2 className="h-32 w-32 text-primary" />
          </div>
          <CardHeader className="p-10">
            <CardTitle className="font-headline text-3xl text-primary">Grow Your Boutique</CardTitle>
            <CardDescription className="text-lg">Share your verified boutique profile to attract global retail buyers and increase your heritage score.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-4 p-5 bg-white rounded-3xl border border-primary/5 shadow-xl">
               <div className="flex-1 truncate text-xs font-mono text-muted-foreground bg-muted/30 p-4 rounded-xl w-full">
                 {typeof window !== 'undefined' ? `${window.location.origin}/partners/${user?.uid}` : '...'}
               </div>
               <Button onClick={copyBoutiqueLink} variant={copied ? "default" : "secondary"} className="rounded-2xl px-10 h-14 w-full md:w-auto text-lg font-headline">
                 {copied ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6 mr-2" />}
                 {copied ? "Copied" : "Copy Link"}
               </Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em]">
                 Instagram & WhatsApp Optimized
               </Badge>
               <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em]">
                 Direct Order Tracking
               </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Competition Banner */}
        <div className="bg-primary rounded-[2.5rem] p-10 text-primary-foreground flex flex-col justify-between shadow-2xl">
           <div className="space-y-4">
             <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center"><TrendingUp className="h-6 w-6" /></div>
             <h3 className="text-3xl font-headline">Heritage Leaderboard</h3>
             <p className="text-sm opacity-70 leading-relaxed">Top performing partners are featured in our monthly "Weaver of the Month" global social campaign.</p>
           </div>
           <Button variant="outline" className="mt-8 h-14 rounded-2xl bg-transparent border-white/20 hover:bg-white/10 text-white font-headline">
             View Competition Rules
           </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-[500px] h-14 bg-muted/40 p-1.5 rounded-2xl border">
          <TabsTrigger value="inventory" className="flex items-center gap-2 rounded-xl font-headline text-lg">
            <Store className="h-5 w-5" /> My Boutique
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 rounded-xl font-headline text-lg">
            <Truck className="h-5 w-5" /> Active Orders
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
