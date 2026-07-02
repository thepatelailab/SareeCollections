'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/components/providers/app-provider';

const ADMIN_EMAIL = 'bp.brpl@gmail.com';

export function LoginForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refetchUserProfile } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleAuthAction = async (action: 'login' | 'signup') => {
    if (!auth || !user || !firestore) return;
    setIsLoading(true);

    try {
      let finalUser;

      if (action === 'signup') {
        // For sign-up, we link the anonymous account to a new email/password credential.
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(user, credential);
        finalUser = userCredential.user;
      } else {
        // For login, we sign in directly. This will trigger onAuthStateChanged and update the user object.
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        finalUser = userCredential.user;
      }

      // CRITICAL: Await the creation of the user profile document.
      // This ensures the role is set in Firestore before proceeding.
      const userRef = doc(firestore, 'users', finalUser.uid);
      const role = finalUser.email === ADMIN_EMAIL ? 'admin' : 'customer';
      await setDoc(userRef, { role }, { merge: true });

      // After setting the document, force a refetch of the user profile in the AppContext
      await refetchUserProfile();

      toast({
        title: action === 'signup' ? 'Account Created!' : 'Login Successful!',
        description: "You've been successfully authenticated.",
      });

      router.push(redirectUrl);
    } catch (error: any) {
      console.error(`${action} failed:`, error);
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
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Login</CardTitle>
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
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleAuthAction('login')}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sign Up</CardTitle>
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
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleAuthAction('signup')}
              className="w-full"
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
