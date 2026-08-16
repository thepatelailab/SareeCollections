'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAppContext } from '@/components/providers/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerInventory } from './components/partner-inventory';
import { PartnerOrders } from './components/partner-orders';
import { WholesalerAddSareeDialog } from './components/add-saree-dialog';
import { LayoutDashboard, Store, Package, TrendingUp, Handshake, LogOut, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PartnerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { isWholesaler } = useAppContext();
  const router = useRouter();
  const auth = useAuth();

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Active Listings" value="12" color="text-blue-600" />
        <StatCard icon={TrendingUp} label="Wholesale Sales" value="INR 45,200" color="text-green-600" />
        <StatCard icon={Store} label="Store Views" value="842" color="text-orange-600" />
        <StatCard icon={Handshake} label="Active Orders" value="3" color="text-purple-600" />
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
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-headline text-primary">Your Collection</h2>
          </div>
          <PartnerInventory />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-headline text-primary">Order Fulfilment</h2>
          </div>
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
