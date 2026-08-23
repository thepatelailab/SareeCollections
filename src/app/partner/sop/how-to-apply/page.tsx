'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Handshake, ShieldCheck } from 'lucide-react';

export default function HowToApplySOP() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 group">
        <Link href="/partner/sop">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to SOP Hub
        </Link>
      </Button>

      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">1. how to apply for partnership</h1>
          <p className="text-xl text-muted-foreground italic font-body">Joining the SareeDukan ecosystem as an authorized wholesaler or manufacturer.</p>
        </header>

        <section className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-primary/5">
          <div className="space-y-6">
            <h3 className="text-2xl font-headline text-primary">the application process</h3>
            <div className="grid gap-6">
              {[
                { title: "Fill the Form", text: "Navigate to the 'Become a Partner' page and provide your registered business name, authorized email, and full warehouse address." },
                { title: "Identify Your Craft", text: "Clearly list the textile varieties you specialize in (e.g., Banarasi, Sambalpuri, Artisan Crochet). This helps us categorize your boutique." },
                { title: "Manufacturer Verification", text: "If you own your looms or workshops, check the 'Manufacturer' box. This grants you a special verification badge on your public boutique." },
                { title: "The Curation Audit", text: "Our team reviews your application within 2-3 business days. We check for authenticity and quality standards." }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-bold text-primary">{step.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-4">
             <ShieldCheck className="h-6 w-6 text-green-600 mt-1" />
             <div>
               <h4 className="font-bold text-green-900">Email Authorization</h4>
               <p className="text-sm text-green-700">Crucial: Registration is only possible using the exact email address you used in your application. Ensure this email is accessible by your business administrator.</p>
             </div>
          </div>
        </section>

        <div className="text-center">
          <Button asChild size="lg" className="h-16 rounded-2xl px-12 bg-primary font-headline text-xl">
            <Link href="/become-a-partner">Start Application <Handshake className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
