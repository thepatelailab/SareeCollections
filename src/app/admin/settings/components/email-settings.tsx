'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function EmailSettings() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchEmail() {
      if (!firestore) return;
      try {
        const docRef = doc(firestore, 'settings', 'email');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEmail(snap.data().verifiedEmail || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmail();
  }, [firestore]);

  const handleSave = async () => {
    if (!firestore || !email) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'settings', 'email'), { 
        verifiedEmail: email,
        updatedAt: new Date()
      }, { merge: true });
      toast({ title: 'Settings Saved', description: 'Sender email updated for notifications.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto" />;

  return (
    <Card className="border-primary/10 shadow-lg rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Mail className="h-5 w-5" /> Email Notifications (Resend)
        </CardTitle>
        <CardDescription>
          Configure the official sender address for buyer receipts and partner alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="verified-email">Verified Sender Email</Label>
          <Input 
            id="verified-email" 
            placeholder="onboarding@resend.dev" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl h-12"
          />
          <p className="text-[10px] text-muted-foreground italic">
            This email must be verified in your Resend dashboard.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-green-900">Automation Active</h4>
            <p className="text-xs text-green-700">Orders will now trigger automated emails to both buyers and weavers using Resend.</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 rounded-xl">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Email Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
