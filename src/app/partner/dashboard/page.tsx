'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, useStorage } from '@/firebase';
import { useAppContext } from '@/components/providers/app-provider';
import { PartnerInventory } from './components/partner-inventory';
import { WholesalerAddSareeDialog } from './components/add-saree-dialog';
import { LayoutDashboard, Store, LogOut, Copy, CheckCircle2, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signOut } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { UserProfile } from '@/lib/types';
import Image from 'next/image';

export default function PartnerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const { firestore, auth } = useFirebase();
  const storage = useStorage();
  const { isWholesaler, refetchUserProfile } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  
  const [copied, setCopied] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isUserLoading && !isWholesaler) {
      router.push('/');
    }
  }, [user, isUserLoading, isWholesaler, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!firestore || !user?.uid) return;
      try {
        const snap = await getDoc(doc(firestore, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setBusinessName(data.businessName || '');
          setBannerPreview(data.bannerUrl || null);
        }
      } catch (err) {}
    }
    loadProfile();
  }, [firestore, user?.uid]);

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
      toast({ title: 'Boutique Link Copied!' });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleUpdateBoutique = async () => {
    if (!firestore || !user?.uid || !storage) return;

    setIsUpdatingProfile(true);
    try {
      let bannerUrl = bannerPreview;
      if (bannerFile) {
        const bannerRef = ref(storage, `users/${user.uid}/banner.jpg`);
        const uploadSnapshot = await uploadBytes(bannerRef, bannerFile);
        bannerUrl = await getDownloadURL(uploadSnapshot.ref);
      }

      await setDoc(doc(firestore, 'users', user.uid), {
        businessName: businessName.trim(),
        bannerUrl,
        role: 'wholesaler',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await refetchUserProfile();
      toast({ title: 'Boutique Updated' });
      setBannerFile(null);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isUserLoading || !isWholesaler) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl text-white shadow-xl">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline text-primary">{businessName || 'Wholesale Center'}</h1>
            <p className="text-muted-foreground font-medium italic text-xs">Partner ID: {user?.uid.slice(-6)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <Button onClick={copyBoutiqueLink} variant={copied ? "default" : "secondary"} className="rounded-xl h-12">
             {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy URL
           </Button>
           <WholesalerAddSareeDialog />
           <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-full h-12 w-12 text-destructive">
             <LogOut className="h-5 w-5" />
           </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-14 bg-muted/40 p-1.5 rounded-2xl border">
          <TabsTrigger value="inventory" className="flex items-center gap-2 rounded-xl font-headline text-lg">
            <Store className="h-5 w-5" /> Boutique
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 rounded-xl font-headline text-lg">
            <Settings className="h-5 w-5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <PartnerInventory />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] shadow-xl border-primary/5 overflow-hidden">
              <CardHeader className="p-8 bg-primary text-primary-foreground">
                <CardTitle className="font-headline text-2xl">Boutique Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="business-name" className="text-sm font-bold text-primary">Business Name</Label>
                  <Input 
                    id="business-name" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-12 rounded-xl border-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-primary">Banner Image</Label>
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border bg-muted mb-4">
                    {bannerPreview && <Image src={bannerPreview} alt="Banner" fill className="object-cover" />}
                    <Input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <Button onClick={handleUpdateBoutique} disabled={isUpdatingProfile} className="w-full h-14 rounded-2xl">
                    {isUpdatingProfile ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Boutique Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}