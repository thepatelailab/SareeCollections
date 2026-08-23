'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Shirt, Flower2, Layers, IndianRupee } from 'lucide-react';

export default function UploadingProductsSOP() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 group">
        <Link href="/partner/sop">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to SOP Hub
        </Link>
      </Button>

      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">3. uploading heritage arrivals</h1>
          <p className="text-xl text-muted-foreground italic font-body">Leveraging AI to create world-class catalogs for your handmade crafts.</p>
        </header>

        {/* Saree Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="bg-accent/20 p-2 rounded-xl"><Shirt className="h-6 w-6 text-primary" /></div>
             <h2 className="text-3xl font-headline text-primary">Saree Cataloging (AI Synthesis)</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5 space-y-6">
            <p className="text-muted-foreground">For Sarees, the AI creates a model preview so customers can see how the fabric drapes.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-2xl space-y-2">
                <p className="font-bold text-xs uppercase tracking-widest text-primary">1. main fabric</p>
                <p className="text-xs text-muted-foreground">Upload the base saree fabric showing pattern and texture.</p>
              </div>
              <div className="p-4 border rounded-2xl space-y-2">
                <p className="font-bold text-xs uppercase tracking-widest text-primary">2. blouse piece</p>
                <p className="text-xs text-muted-foreground">Optional: Upload the unstitched blouse design for a tailored look.</p>
              </div>
              <div className="p-4 border rounded-2xl space-y-2">
                <p className="font-bold text-xs uppercase tracking-widest text-primary">3. detail shot</p>
                <p className="text-xs text-muted-foreground">Optional: A close-up of the border or Pallu motifs.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-accent-foreground font-bold text-sm">
              <Sparkles className="h-4 w-4" /> Click "Synthesize Model Preview" to generate the 3D drape.
            </div>
          </div>
        </section>

        {/* Crochet Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="bg-accent/20 p-2 rounded-xl"><Flower2 className="h-6 w-6 text-primary" /></div>
             <h2 className="text-3xl font-headline text-primary">Crochet Hub (AI Contextualization)</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5 space-y-6">
            <p className="text-muted-foreground">Crochet items are uploaded as-is, with AI only enhancing the lifestyle environment.</p>
            <div className="space-y-4">
              <div className="flex gap-4">
                 <Layers className="h-5 w-5 text-primary shrink-0 mt-1" />
                 <p className="text-sm">Upload a clear photo of the original product against any neutral background.</p>
              </div>
              <div className="flex gap-4">
                 <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                 <div>
                    <p className="text-sm font-bold">Lifestyle Prompting:</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">Example: "on a rustic wooden table with scattered cotton yarn and warm morning sunlight."</p>
                 </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/30 p-4 rounded-xl">Note: The AI will strictly preserve the shape, color, and stitch pattern of your original crochet work.</p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="bg-accent/20 p-2 rounded-xl"><IndianRupee className="h-6 w-6 text-primary" /></div>
             <h2 className="text-3xl font-headline text-primary">Strategic Pricing</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5 grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="font-bold text-primary">Retail Price (INR)</p>
              <p className="text-sm text-muted-foreground">The price customers pay for a single unit. This should include your margin and shipping costs.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-accent-foreground">Wholesale Price (INR)</p>
              <p className="text-sm text-muted-foreground">Visible to Admin only. This helps us manage bulk export inquiries and corporate gifting leads.</p>
            </div>
          </div>
        </section>

        <div className="p-8 border-2 border-dashed rounded-[2.5rem] text-center space-y-4">
           <h3 className="font-headline text-2xl lowercase">ready to expand your reach?</h3>
           <p className="text-muted-foreground max-w-lg mx-auto">Upload your first arrival and let our AI engine create a professional marketing catalog for you instantly.</p>
           <Button asChild size="lg" className="rounded-2xl h-14 bg-primary px-10">
             <Link href="/partner/dashboard">Open My Dashboard</Link>
           </Button>
        </div>
      </div>
    </div>
  );
}
