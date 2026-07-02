'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Handshake, CheckCircle2, Factory, LogIn } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, "Company/Wholesaler name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Full business address is required"),
  isManufacturer: z.boolean().default(false),
  sareeTypes: z.string().min(5, "Please list the types of sarees you supply"),
});

export default function BecomeAPartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      isManufacturer: false,
      sareeTypes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'wholesalerRequests'), {
        ...values,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
      toast({
        title: "Application Sent!",
        description: "Our team will review your request and get back to you shortly.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-headline text-primary mb-4">Application Successful!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your interest in SareeDukan Partner Program. We have received your request and our curation team will contact you via email within 2-3 business days.
        </p>
        <Button asChild size="lg">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
            <Handshake className="h-4 w-4" /> Partner Program
          </div>
          <h1 className="text-4xl md:text-6xl font-headline text-primary leading-tight">
            Grow Your Business With SareeDukan.Com
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            Connect your heritage looms and wholesale collections with thousands of customers globally. Join our exclusive network of trusted partners.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 border rounded-2xl bg-card">
              <h3 className="font-headline text-xl mb-2 text-primary">Global Reach</h3>
              <p className="text-sm text-muted-foreground">Sell to a curated audience looking for authentic textiles.</p>
            </div>
            <div className="p-6 border rounded-2xl bg-card">
              <h3 className="font-headline text-xl mb-2 text-primary">AI Powered</h3>
              <p className="text-sm text-muted-foreground">Automatic model previews generated for your wholesale catalog.</p>
            </div>
          </div>

          <div className="pt-8 border-t border-primary/5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Already an approved partner?</p>
            <Button variant="default" className="rounded-xl h-12 px-8 bg-primary text-white" asChild>
              <Link href="/partner/login">
                <LogIn className="mr-2 h-4 w-4" /> Wholesaler Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl border-primary/10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8 md:p-10">
            <CardTitle className="text-3xl font-headline">Wholesaler Application</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Provide your details and our team will investigate and approve for sign up.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business / Wholesaler Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Traditional Silk House" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ID</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@business.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full registered address..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isManufacturer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Factory className="h-4 w-4 text-primary" /> Own Manufacturing Unit?
                        </FormLabel>
                        <FormDescription>
                          Check this if you weave or manufacture your own sarees.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sareeTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Types of Sarees Available</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kanchipuram, Banarasi, Cotton..." {...field} />
                      </FormControl>
                      <FormDescription>List the primary varieties in your collection.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full py-8 text-lg font-headline bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    "Submit Partnership Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
