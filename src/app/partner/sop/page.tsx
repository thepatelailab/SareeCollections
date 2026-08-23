'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, LayoutDashboard, Package, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function PartnerSOPHub() {
  const steps = [
    {
      title: "How to Apply",
      description: "Learn about the partnership requirements and the curation process.",
      icon: Handshake,
      href: "/partner/sop/how-to-apply",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Your Dashboard",
      description: "How to register your account and navigate your Wholesale Center.",
      icon: LayoutDashboard,
      href: "/partner/sop/accessing-dashboard",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Uploading Products",
      description: "Master the AI tools to create heritage model previews and lifestyle shots.",
      icon: Package,
      href: "/partner/sop/uploading-products",
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Partner Resource Center</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-headline text-primary">Standard Operating Procedures</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
          Your guide to scaling your heritage business with the SareeDukan.Com digital ecosystem.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <Card key={idx} className="rounded-[2.5rem] border-primary/5 shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
            <CardHeader className="p-8">
              <div className={`p-4 rounded-2xl w-fit mb-6 ${step.color} transition-transform group-hover:scale-110`}>
                <step.icon className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-2xl lowercase">{step.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed pt-2">{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Button asChild variant="outline" className="w-full rounded-xl h-12 border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                <Link href={step.href}>
                  Read Guide <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-20 p-10 bg-accent/5 rounded-[3rem] border border-accent/20 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg">
          <Sparkles className="h-12 w-12 text-accent-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-headline text-2xl text-primary lowercase">the ai advantage</h3>
          <p className="text-muted-foreground leading-relaxed">
            SareeDukan uses cutting-edge Generative AI to ensure your products look their best. Our SOP includes specific tips on how to prompt the AI to match your brand's unique lighting and aesthetic.
          </p>
        </div>
      </div>
    </div>
  );
}
