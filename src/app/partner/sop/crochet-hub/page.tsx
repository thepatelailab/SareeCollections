'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flower2, Sparkles, Camera, ShieldCheck, Palette, LogIn, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CrochetHubSOP() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8 group">
        <Link href="/partner/sop">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to SOP Hub
        </Link>
      </Button>

      <div className="space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Specialized Craft Section
          </div>
          <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">4. crochet hub standards</h1>
          <p className="text-xl text-muted-foreground italic font-body">Maintaining visual integrity and artisan value in the Crochet marketplace.</p>
        </header>

        {/* Access Flow Section */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-primary/5 space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <LogIn className="h-6 w-6" />
            <h2 className="text-2xl font-headline">how to access the hub</h2>
          </div>
          <div className="grid gap-4">
            {[
              { 
                step: "1", 
                title: "Official Login", 
                desc: "Navigate to the Partner Login portal. Ensure you are using the 'Register' tab if it's your first time after approval.",
                link: "/partner/login",
                linkText: "Open Login Portal"
              },
              { 
                step: "2", 
                title: "Dashboard Entry", 
                desc: "Once authenticated, you will arrive at your 'Wholesale Center' where you can manage inventory and orders." 
              },
              { 
                step: "3", 
                title: "Select Category", 
                desc: "Click 'Upload New Arrival'. In the category dropdown, select 'Crochet Hub' to activate the lifestyle AI tools." 
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-primary/5 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  {item.link && (
                    <Button variant="link" asChild className="p-0 h-auto text-orange-600 mt-2 font-black uppercase text-[10px] tracking-widest">
                      <Link href={item.link}>{item.linkText} <ChevronRight className="h-3 w-3 ml-1" /></Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visual Integrity Section */}
        <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-primary/5 space-y-8">
          <div className="flex items-center gap-4 text-orange-600">
             <ShieldCheck className="h-8 w-8" />
             <h2 className="text-3xl font-headline">Visual Integrity Clause</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Unlike sarees, which are synthesized onto 3D models, crochet products are uploaded as <strong>Original Subjects</strong>. Our AI engine is programmed to never alter the product itself.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
             <div className="p-6 bg-muted/30 rounded-2xl">
                <p className="font-bold text-primary mb-2">What Stays Original:</p>
                <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                  <li>Stitch patterns and textures</li>
                  <li>Yarn color and sheen</li>
                  <li>Physical dimensions and shape</li>
                  <li>Handcrafted imperfections (if any)</li>
                </ul>
             </div>
             <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                <p className="font-bold text-orange-700 mb-2">What AI Changes:</p>
                <ul className="text-xs space-y-2 text-orange-900/70 list-disc pl-4">
                  <li>The background environment</li>
                  <li>Lighting and shadow depth</li>
                  <li>Atmospheric color grading</li>
                  <li>Lifestyle context (tabletops, decor)</li>
                </ul>
             </div>
          </div>
        </section>

        {/* Photography Guidelines */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="bg-primary/5 p-2 rounded-xl"><Camera className="h-6 w-6 text-primary" /></div>
             <h3 className="text-2xl font-headline text-primary">Photography Requirements</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
             {[
               { title: "Flat Lay or Drape", desc: "Photograph the item lying flat or draped naturally on a surface." },
               { title: "Neutral Base", desc: "Use a solid, neutral background (white, grey, or wood) for best extraction." },
               { title: "Clear Focus", desc: "Ensure high resolution so the AI can detect individual stitch patterns." }
             ].map((req, i) => (
               <div key={i} className="bg-white p-6 rounded-[2rem] border border-primary/5">
                  <p className="font-bold text-sm text-primary mb-2">{req.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{req.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Prompting Guide */}
        <section className="bg-primary text-primary-foreground p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 opacity-10 -translate-y-4 translate-x-4">
              <Sparkles className="h-64 w-64" />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <Palette className="h-6 w-6 text-accent" />
                 <h3 className="text-3xl font-headline lowercase">lifestyle prompting</h3>
              </div>
              <p className="leading-relaxed opacity-80 max-w-2xl">
                When uploading to the Crochet Hub, use the "AI Lifestyle Setting" field to describe where your product should live. Avoid describing the product; only describe the <strong>surroundings</strong>.
              </p>
              
              <div className="grid gap-4">
                 <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Perfect Prompt Example:</p>
                    <p className="text-sm italic">"On an antique teak table with a ceramic mug of hot tea and soft afternoon sunbeams."</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Avoid This:</p>
                    <p className="text-sm italic opacity-60">"The product is a blue crochet lace table mat on a table." (Too redundant)</p>
                 </div>
              </div>
           </div>
        </section>

        <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm"><Flower2 className="h-8 w-8 text-orange-600" /></div>
              <div>
                 <p className="font-headline text-xl text-orange-900">Ready to List Crochet Art?</p>
                 <p className="text-sm text-orange-800/70">Start uploading your handcrafted work today.</p>
              </div>
           </div>
           <Button asChild size="lg" className="rounded-xl h-14 bg-orange-600 hover:bg-orange-700 text-white px-8 shadow-xl">
             <Link href="/partner/login">Access My Hub Dashboard <ChevronRight className="ml-2 h-4 w-4" /></Link>
           </Button>
        </div>
      </div>
    </div>
  );
}
