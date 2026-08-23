'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, Key, LogIn, Store } from 'lucide-react';

export default function AccessingDashboardSOP() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 group">
        <Link href="/partner/sop">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to SOP Hub
        </Link>
      </Button>

      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">2. accessing your dashboard</h1>
          <p className="text-xl text-muted-foreground italic font-body">Setting up your credentials and managing your heritage boutique.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5">
            <div className="flex items-center gap-3 text-purple-600">
               <Key className="h-6 w-6" />
               <h3 className="text-xl font-headline">First-Time Setup</h3>
            </div>
            <ul className="space-y-4">
              <li className="text-sm text-muted-foreground flex gap-3">
                <span className="font-bold text-primary">1.</span> Select the "Register" tab on the Partner Login page.
              </li>
              <li className="text-sm text-muted-foreground flex gap-3">
                <span className="font-bold text-primary">2.</span> Enter your <span className="font-bold underline">Approved Business Email</span>.
              </li>
              <li className="text-sm text-muted-foreground flex gap-3">
                <span className="font-bold text-primary">3.</span> Create a strong password (minimum 8 characters).
              </li>
              <li className="text-sm text-muted-foreground flex gap-3">
                <span className="font-bold text-primary">4.</span> Your account will automatically link to your business profile.
              </li>
            </ul>
          </section>

          <section className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5">
            <div className="flex items-center gap-3 text-blue-600">
               <Store className="h-6 w-6" />
               <h3 className="text-xl font-headline">Boutique Identity</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once logged in, navigate to the <span className="font-bold">Settings</span> tab to upload your Boutique Banner. This banner appears on your public storefront and defines your brand aesthetic for customers.
            </p>
            <div className="p-4 bg-muted/30 rounded-xl italic text-[11px]">
              Tip: Use a high-resolution photo of your workshop or weaving cluster to build customer trust.
            </div>
          </section>
        </div>

        <section className="bg-primary text-primary-foreground p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 rotate-12 -translate-y-4">
            <LayoutDashboard className="h-64 w-64" />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-headline lowercase">managing sales</h3>
            <p className="leading-relaxed opacity-80">
              The "Orders" tab is your logistics portal. When a customer acquires a piece, you will see their shipping details here. You are responsible for selecting the courier (BlueDart, DHL, etc.) and providing the tracking ID within 48 hours of payment.
            </p>
            <Button asChild variant="secondary" className="rounded-xl h-12">
              <Link href="/partner/login">Go to Login <LogIn className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
