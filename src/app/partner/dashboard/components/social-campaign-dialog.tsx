'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Wand2,
  Megaphone,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { generateSocialCaptions, GenerateSocialCaptionOutput } from '@/ai/flows/generate-social-caption';
import { refineGeneratedAvatar } from '@/ai/flows/refine-generated-avatar';

interface SocialCampaignDialogProps {
  product: Product;
}

export function SocialCampaignDialog({ product }: SocialCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [captions, setCaptions] = useState<GenerateSocialCaptionOutput | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isRefiningImage, setIsRefiningImage] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.modelImg);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { toast } = useToast();

  const handleGenerateCaptions = async () => {
    setIsGeneratingCaptions(true);
    try {
      const result = await generateSocialCaptions({
        productName: product.name,
        variety: product.variety,
        description: product.description,
      });
      setCaptions(result);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Storytelling Failed' });
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const handleRefineForSocial = async () => {
    setIsRefiningImage(true);
    try {
      const result = await refineGeneratedAvatar({
        initialImage: currentImage,
        refinementPrompt: 'Professional luxury fashion social media banner, model standing in a heritage royal courtyard, soft sunset lighting, ultra-high resolution, fashion catalog style.',
      });
      setCurrentImage(result.refinedImage);
      toast({ title: 'Visuals Refined!', description: 'Your product is now social-media ready.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Visual Refinement Failed' });
    } finally {
      setIsRefiningImage(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: 'Caption Copied!' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-[10px] font-black uppercase border-accent/20 text-accent-foreground hover:bg-accent/5">
          <Megaphone className="h-3 w-3 mr-2" /> Social Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] bg-[#F3F4ED] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-primary p-8 text-primary-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <Badge className="bg-white/20 text-white border-none text-[8px] font-black tracking-widest uppercase">Phase 4: Campaign Engine</Badge>
            </div>
            <DialogTitle className="text-3xl font-headline lowercase">social campaign: {product.name}</DialogTitle>
            <DialogDescription className="text-primary-foreground/60">Generate heritage storytelling and refined marketing visuals for your social channels.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Visual Side */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl border border-primary/5 bg-white">
              {isRefiningImage ? (
                <div className="h-full flex flex-col items-center justify-center bg-muted/30">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Designing Heritage Setting...</p>
                </div>
              ) : (
                <Image src={currentImage} alt="Marketing Preview" fill className="object-cover" />
              )}
            </div>
            <Button 
              onClick={handleRefineForSocial} 
              disabled={isRefiningImage}
              className="w-full h-14 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg font-headline text-lg"
            >
              <Wand2 className="mr-2 h-5 w-5" /> Refine for Social Media
            </Button>
          </div>

          {/* Copy Side */}
          <div className="space-y-6">
            {!captions ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] border border-dashed border-primary/20 space-y-4">
                <div className="p-4 bg-primary/5 rounded-full"><MessageSquare className="h-10 w-10 text-primary/40" /></div>
                <div>
                  <h4 className="font-headline text-xl text-primary">AI Heritage Storyteller</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Let AI write professional, culturally rich captions for your Instagram, WhatsApp, and Facebook campaigns.</p>
                </div>
                <Button onClick={handleGenerateCaptions} disabled={isGeneratingCaptions} className="w-full rounded-xl">
                  {isGeneratingCaptions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate AI Stories
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="instagram" className="w-full space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl p-1">
                  <TabsTrigger value="instagram" className="rounded-lg text-[10px] uppercase font-bold"><Instagram className="h-3 w-3 mr-1" /> IG</TabsTrigger>
                  <TabsTrigger value="whatsapp" className="rounded-lg text-[10px] uppercase font-bold"><MessageSquare className="h-3 w-3 mr-1" /> WA</TabsTrigger>
                  <TabsTrigger value="facebook" className="rounded-lg text-[10px] uppercase font-bold"><Facebook className="h-3 w-3 mr-1" /> FB</TabsTrigger>
                </TabsList>
                
                <TabsContent value="instagram">
                  <Card className="p-5 rounded-2xl border-primary/5 bg-white relative">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{captions.instagram}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 text-[8px] font-black uppercase"
                      onClick={() => copyToClipboard(captions.instagram, 'ig')}
                    >
                      {copiedKey === 'ig' ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="whatsapp">
                  <Card className="p-5 rounded-2xl border-primary/5 bg-white relative">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{captions.whatsapp}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 text-[8px] font-black uppercase"
                      onClick={() => copyToClipboard(captions.whatsapp, 'wa')}
                    >
                      {copiedKey === 'wa' ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="facebook">
                  <Card className="p-5 rounded-2xl border-primary/5 bg-white relative">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{captions.facebook}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 text-[8px] font-black uppercase"
                      onClick={() => copyToClipboard(captions.facebook, 'fb')}
                    >
                      {copiedKey === 'fb' ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </Card>
                </TabsContent>

                <div className="pt-4">
                  <Button variant="outline" className="w-full rounded-xl border-dashed" onClick={handleGenerateCaptions}>
                    <Sparkles className="h-4 w-4 mr-2" /> Rewrite Stories
                  </Button>
                </div>
              </Tabs>
            )}
          </div>
        </div>

        <DialogFooter className="bg-white/50 p-6 border-t border-primary/5">
          <div className="w-full flex justify-between items-center px-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <Share2 className="h-4 w-4" /> Integrated Social Reach
             </div>
             <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-headline">Done</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
