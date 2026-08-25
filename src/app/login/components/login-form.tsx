'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useAppContext } from '@/components/providers/app-provider';

const ADMIN_EMAIL = 'bp.brpl@gmail.com';

export function LoginForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refetchUserProfile, isAdmin, isWholesaler } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  // If already logged in, show a dashboard redirect UI
  if (currentUser && !currentUser.isAnonymous) {
    return (
      <Card className="w-full max-w-sm border-none shadow-xl rounded-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl text-primary">Account Active</CardTitle>
          <CardDescription>Logged in as {currentUser.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAdmin && (
            <Button asChild className="w-full h-12 rounded-xl bg-primary">
              <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" /> Admin Settings</Link>
            </Button>
          )}
          {isWholesaler && (
            <Button asChild className="w-full h-12 rounded-xl bg-accent text-accent-foreground">
              <Link href="/partner/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Partner Dashboard</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full h-12 rounded-xl">
            <Link href="/my-account/orders">View My Orders</Link>
          </Button>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full" onClick={() => auth?.signOut()}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const syncUserProfile = async (user: User) => {
    if (!firestore) return;
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists() || !docSnap.data()?.role) {
        const role = user.email === ADMIN_EMAIL ? 'admin' : 'customer';
        await setDoc(userRef, { role }, { merge: true });
      }
      await refetchUserProfile();
    } catch (e) {
      console.warn("Profile sync delay:", e);
    }
  };

  const handleAuthAction = async (action: 'login' | 'signup') => {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      let finalUser: User;

      if (action === 'signup') {
        if (!currentUser) throw new Error("No anonymous session found.");
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(currentUser, credential);
        finalUser = userCredential.user;
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        finalUser = userCredential.user;
      }

      toast({
        title: action === 'signup' ? 'Account Created!' : 'Login Successful!',
        description: "Welcome back to SareeDukan.",
      });

      syncUserProfile(finalUser);
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card className="border-none shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Login</CardTitle>
            <CardDescription>
              Sign in to your account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleAuthAction('login')}
              className="w-full h-12 rounded-xl bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card className="border-none shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Sign Up</CardTitle>
            <CardDescription>
              Create a new account to place your order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleAuthAction('signup')}
              className="w-full h-12 rounded-xl bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}