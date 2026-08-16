
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/components/providers/app-provider';
import Link from 'next/link';

export function PartnerLoginForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refetchUserProfile } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/partner/dashboard';

  const getApprovedRequest = async (emailToCheck: string) => {
    if (!firestore) return null;
    const q = query(
      collection(firestore, 'wholesalerRequests'), 
      where('email', '==', emailToCheck.trim()),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data();
    }
    return null;
  };

  const handleAuthAction = async (action: 'login' | 'signup') => {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      let approvedRequest = null;
      if (action === 'signup') {
        approvedRequest = await getApprovedRequest(email);
        if (!approvedRequest) {
          toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'This email is not authorized. Please apply for partner approval first.',
          });
          setIsLoading(false);
          return;
        }
      }

      let finalUser;
      if (action === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        finalUser = userCredential.user;
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        finalUser = userCredential.user;
      }

      // Set the role and initial profile data
      const userRef = doc(firestore, 'users', finalUser.uid);
      const updateData: any = { role: 'wholesaler' };
      if (approvedRequest) {
        updateData.businessName = approvedRequest.name;
      }
      
      await setDoc(userRef, updateData, { merge: true });
      await refetchUserProfile();

      toast({
        title: action === 'signup' ? 'Verification Successful!' : 'Sign In Successful!',
        description: action === 'signup' ? 'Your partner account has been created.' : 'Welcome back to your dashboard.',
      });

      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 mb-8 gap-4">
          <TabsTrigger 
            value="login" 
            className="rounded-xl h-12 text-sm font-bold tracking-wider bg-[#E5E7EB]/50 data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="rounded-xl h-12 text-sm font-bold tracking-wider bg-[#E5E7EB]/50 data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm">
          <TabsContent value="login" className="m-0">
             <CardHeader className="p-8 pb-4">
              <CardTitle className="text-3xl font-headline text-primary flex items-center gap-3">
                 Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium pt-1">
                Access your partner dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-primary font-bold ml-1">Work Email</Label>
                  <Input 
                    type="email" 
                    className="bg-[#EBF1FF] border-none h-14 rounded-xl px-4 text-primary focus-visible:ring-primary/20" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold ml-1">Password</Label>
                  <Input 
                    type="password" 
                    className="bg-[#EBF1FF] border-none h-14 rounded-xl px-4 text-primary focus-visible:ring-primary/20" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleAuthAction('login')} 
                className="w-full h-16 rounded-2xl text-xl font-headline bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Sign In'}
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="signup" className="m-0">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-3xl font-headline text-[#2D1B2E] flex items-center gap-3">
                <div className="bg-green-100 p-1.5 rounded-md">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                Onboarding
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium pt-1">
                Create your account using your approved email.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-6">
              <div className="bg-[#F0FDF4] p-5 rounded-2xl border border-[#DCFCE7]">
                <p className="text-[10px] font-black tracking-widest text-[#166534] leading-relaxed uppercase">
                  Verification Required: Only approved email addresses can finalize registration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#2D1B2E] font-bold ml-1 text-sm">Approved Email</Label>
                  <Input 
                    type="email" 
                    placeholder="partner@heritage.com"
                    className="bg-[#EBF1FF] border-none h-14 rounded-xl px-4 text-[#2D1B2E] focus-visible:ring-primary/20 placeholder:text-[#2D1B2E]/30" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2D1B2E] font-bold ml-1 text-sm">Choose Password</Label>
                  <Input 
                    type="password" 
                    className="bg-[#EBF1FF] border-none h-14 rounded-xl px-4 text-[#2D1B2E] focus-visible:ring-primary/20" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleAuthAction('signup')} 
                className="w-full h-16 rounded-2xl text-xl font-headline bg-[#4CAF50] hover:bg-[#43A047] shadow-lg shadow-green-600/20 text-white transition-all transform active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Verify & Register'}
              </Button>
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
      
      <div className="text-center pt-4">
        <Link href="/" className="text-sm font-bold text-[#8D7B7B] hover:text-primary transition-colors uppercase tracking-widest border-b border-transparent hover:border-[#8D7B7B]">
          Return to Marketplace
        </Link>
      </div>
    </div>
  );
}
