'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerInventory } from './components/partner-inventory';
import { PartnerOrders } from './components/partner-orders';
import { WholesalerAddSareeDialog } from './components/add-saree-dialog';
import { LayoutDashboard, Store, Package, TrendingUp, LogOut, Truck, Copy, CheckCircle2, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { signOut } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where } from 'firebase/firestore';
import { Product, Order } from '@/lib/types';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-4 w-4 fill-current">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.43 0 225.36 0C152.3 0 104.33 44.38 104.33 124.72v70.62H22.89V288h81.44v224h100.12V288z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-4 w-4 fill-current">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 445.5c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 365.7l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

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

  const getBoutiqueLink = () => {
    if (typeof window !== 'undefined' && user?.uid) {
      return `${window.location.origin}/partners/${user.uid}`;
    }
    return '';
  };

  const copyBoutiqueLink = () => {
    const link = getBoutiqueLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: 'Boutique Link Copied!', description: 'Share this link on your social media bios.' });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'facebook') => {
    const link = getBoutiqueLink();
    if (!link) return;
    
    const text = `Explore my exclusive heritage collection on SareeDukan!`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
    }
  };

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
      {/* Header with Quick Share */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl text-white shadow-xl">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline text-primary">Wholesale Center</h1>
            <p className="text-muted-foreground font-medium italic text-xs">Partner Account: {user?.email}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Compact Share Controls */}
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-primary/5 shadow-sm">
             <Button 
              variant="outline" 
              className="h-10 w-10 rounded-xl border-primary/5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 p-0"
              onClick={() => handleSocialShare('whatsapp')}
             >
               <WhatsAppIcon />
             </Button>
             <Button 
              variant="outline" 
              className="h-10 w-10 rounded-xl border-primary/5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 p-0"
              onClick={() => handleSocialShare('facebook')}
             >
               <FacebookIcon />
             </Button>
             <Button 
              onClick={copyBoutiqueLink} 
              variant={copied ? "default" : "secondary"} 
              className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
               {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
               {copied ? "Copied" : "Copy URL"}
             </Button>
          </div>

          <div className="h-10 w-px bg-primary/10 mx-1 hidden lg:block" />

          <div className="flex gap-2">
            <WholesalerAddSareeDialog />
            <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full h-12 w-12 border-primary/10 hover:bg-destructive/5 hover:border-destructive/20">
              <LogOut className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {/* Heritage Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
        <Card className="rounded-[2rem] border-primary/5 shadow-md flex flex-col justify-center items-center text-center p-6 bg-primary text-primary-foreground">
           <Award className="h-8 w-8 mb-2 text-accent" />
           <h3 className="text-xl font-black uppercase tracking-widest">Elite Tier</h3>
           <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Verified Partner</p>
        </Card>
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
    <Card className="rounded-[2rem] border-primary/5 shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
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
