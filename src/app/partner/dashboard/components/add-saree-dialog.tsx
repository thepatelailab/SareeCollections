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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, PlusCircle, Sparkles, Wand2, Package, Camera, Shirt, Info, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';
import { generateSareeAvatar } from '@/ai/flows/generate-saree-avatar';
import { refineGeneratedAvatar } from '@/ai/flows/refine-generated-avatar';
import { generateCrochetLifestyle } from '@/ai/flows/generate-crochet-lifestyle';
import { ProductCategory } from '@/lib/types';

export function WholesalerAddSareeDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory>('saree');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [variety, setVariety] = useState('');
  const [backgroundDescription, setBackgroundDescription] = useState('on a minimalist marble surface with soft natural sunlight and deep shadows');

  // Multi-input states
  const [sareeImageFile, setSareeImageFile] = useState<File | null>(null);
  const [sareeImageDataUrl, setSareeImageDataUrl] = useState<string | null>(null);
  const [blouseImageDataUrl, setBlouseImageDataUrl] = useState<string | null>(null);
  const [detailsImageDataUrl, setDetailsImageDataUrl] = useState<string | null>(null);

  const [aiGeneratedImageDataUrl, setAiGeneratedImageDataUrl] = useState<string | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const { addProduct, sareeVarieties } = useAppContext();

  const handleSareeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSareeImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSareeImageDataUrl(reader.result as string);
        setAiGeneratedImageDataUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlouseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setBlouseImageDataUrl(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDetailsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setDetailsImageDataUrl(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!sareeImageDataUrl) return;
    setIsGenerating(true);
    try {
      if (category === 'saree') {
        const result = await generateSareeAvatar({ 
          sareePhotoDataUri: sareeImageDataUrl,
          blousePhotoDataUri: blouseImageDataUrl || undefined,
          detailsPhotoDataUri: detailsImageDataUrl || undefined
        });
        setAiGeneratedImageDataUrl(result.modelWearingSareeDataUri);
      } else if (category === 'crochet') {
        const result = await generateCrochetLifestyle({
          productPhotoDataUri: sareeImageDataUrl,
          backgroundDescription: backgroundDescription
        });
        setAiGeneratedImageDataUrl(result.lifestyleImageDataUri);
      } else {
        // Fallback for Lehenga or others
        setAiGeneratedImageDataUrl(sareeImageDataUrl);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Generation Failed', description: 'Please try again with a clearer photo.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!aiGeneratedImageDataUrl || !refinementPrompt) return;
    setIsRefining(true);
    try {
      const result = await refineGeneratedAvatar({ initialImage: aiGeneratedImageDataUrl, refinementPrompt: refinementPrompt });
      setAiGeneratedImageDataUrl(result.refinedImage);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddToStore = async () => {
    if (!name || !price || !wholesalePrice || !description || !sareeImageFile || !aiGeneratedImageDataUrl) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill all fields and generate an AI preview.' });
      return;
    }
    setIsUploading(true);
    try {
      await addProduct({
        name,
        price: parseFloat(price),
        wholesalePrice: parseFloat(wholesalePrice),
        stock: parseInt(stock),
        description,
        variety: variety || undefined,
        category,
        sareeImageFile,
        modelImageDataUrl: aiGeneratedImageDataUrl,
        sareeImgHint: variety || category
      });
      toast({ title: 'New Arrival Added!', description: `The ${category} is now live in your boutique.` });
      resetForm();
      setOpen(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setCategory('saree');
    setName('');
    setPrice('');
    setWholesalePrice('');
    setStock('10');
    setDescription('');
    setVariety('');
    setSareeImageFile(null);
    setSareeImageDataUrl(null);
    setBlouseImageDataUrl(null);
    setDetailsImageDataUrl(null);
    setAiGeneratedImageDataUrl(null);
    setRefinementPrompt('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground h-10 md:h-12 rounded-xl md:rounded-2xl shadow-lg">
          <PlusCircle className="mr-2 h-4 md:h-5 w-4 md:w-5" /> Upload New Arrival
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[950px] max-h-[90vh] overflow-y-auto bg-[#F3F4ED] border-none shadow-[0_32px_64px_rgba(0,0,0,0.1)] rounded-[1.5rem] md:rounded-[2.5rem] p-0">
        <div className="p-6 md:p-10">
          <DialogHeader className="mb-6 md:mb-8">
            <DialogTitle className="font-headline text-2xl md:text-3xl text-primary">Add Heritage Collection</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-xs md:text-sm">
              List your latest artisan work and use AI to create {category === 'saree' ? 'model previews' : 'lifestyle catalog photos'}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Form Side */}
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-primary ml-1">Collection Category</Label>
                <Select onValueChange={(v: ProductCategory) => { setCategory(v); setAiGeneratedImageDataUrl(null); }} value={category}>
                  <SelectTrigger className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saree">Heritage Saree</SelectItem>
                    <SelectItem value="crochet">Crochet Hub</SelectItem>
                    <SelectItem value="lehenga">Lehenga Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-primary ml-1">Product Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm" placeholder={category === 'crochet' ? 'e.g. Hand-knitted Ivory Table Runner' : 'e.g. Royal Blue Jamdani'} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-bold text-primary ml-1">Variety / Style</Label>
                  <Select onValueChange={setVariety} value={variety}>
                    <SelectTrigger className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {category === 'saree' ? sareeVarieties.map((v) => (
                        <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                      )) : (
                        <>
                          <SelectItem value="handcrafted">Handcrafted</SelectItem>
                          <SelectItem value="limited-edition">Limited Edition</SelectItem>
                          <SelectItem value="vintage">Vintage Inspired</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-bold text-primary ml-1">Stock Count</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-bold text-primary ml-1">Retail (INR)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-bold text-primary ml-1">Wholesale (INR)</Label>
                  <Input type="number" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} className="bg-white border-none h-12 md:h-14 rounded-xl md:rounded-2xl shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-bold text-primary ml-1">Product Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-none min-h-[80px] md:min-h-[100px] rounded-xl md:rounded-2xl shadow-sm" />
              </div>

              {category === 'crochet' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">AI Lifestyle Setting</Label>
                  <Textarea 
                    value={backgroundDescription} 
                    onChange={(e) => setBackgroundDescription(e.target.value)} 
                    placeholder="Describe the luxury setting for the product photo..."
                    className="bg-white border-none min-h-[60px] rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Photo Inputs */}
              <div className="pt-2 md:pt-4 space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Fabric & Product Uploads</Label>
                <div className={`grid ${category === 'saree' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 md:gap-4`}>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[8px] font-bold text-primary uppercase text-center truncate">{category === 'saree' ? 'Main Fabric' : 'Original Product'}</Label>
                    <div className="relative group">
                      <Input type="file" accept="image/*" onChange={handleSareeFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      <div className={`h-16 md:h-20 rounded-xl md:rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${sareeImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                        <Camera className={`h-5 md:h-6 w-5 md:w-6 ${sareeImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                      </div>
                    </div>
                  </div>
                  {category === 'saree' && (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label className="text-[8px] font-bold text-primary uppercase text-center truncate">Blouse Piece</Label>
                        <div className="relative group">
                          <Input type="file" accept="image/*" onChange={handleBlouseFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                          <div className={`h-16 md:h-20 rounded-xl md:rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${blouseImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                            <Shirt className={`h-5 md:h-6 w-5 md:w-6 ${blouseImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-[8px] font-bold text-primary uppercase text-center truncate">Pattern Close-up</Label>
                        <div className="relative group">
                          <Input type="file" accept="image/*" onChange={handleDetailsFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                          <div className={`h-16 md:h-20 rounded-xl md:rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${detailsImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                            <Info className={`h-5 md:h-6 w-5 md:w-6 ${detailsImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 h-auto lg:h-[450px]">
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-xl overflow-hidden relative border border-primary/5 aspect-square lg:aspect-auto">
                  {sareeImageDataUrl ? (
                    <Image src={sareeImageDataUrl} alt="Original" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-6 gap-2">
                      <div className="p-3 md:p-4 rounded-full bg-primary/5"><Camera className="h-6 md:h-8 w-6 md:w-8 text-primary/20" /></div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Original Upload</p>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-xl overflow-hidden relative border border-primary/5 aspect-square lg:aspect-auto">
                  {isGenerating || isRefining ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-6">
                      <Loader2 className="h-8 md:h-10 w-8 md:w-10 animate-spin text-primary mb-4" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">AI {category === 'saree' ? 'Tailoring' : 'Rendering'}...</p>
                    </div>
                  ) : aiGeneratedImageDataUrl ? (
                    <Image src={aiGeneratedImageDataUrl} alt="AI Result" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-6 gap-2">
                      <div className="p-3 md:p-4 rounded-full bg-primary/5"><Sparkles className="h-6 md:h-8 w-6 md:w-8 text-primary/20" /></div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">AI {category === 'saree' ? 'Model' : 'Lifestyle'} Preview</p>
                    </div>
                  )}
                </div>
              </div>

              {!aiGeneratedImageDataUrl ? (
                <Button 
                  onClick={handleGenerate} 
                  disabled={!sareeImageDataUrl || isGenerating} 
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-[2rem] bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl shadow-accent/20 text-lg md:text-xl font-headline"
                >
                  {isGenerating ? <Loader2 className="mr-3 h-5 md:h-6 w-5 md:w-6 animate-spin" /> : <Sparkles className="mr-3 h-5 md:h-6 w-5 md:w-6" />}
                  {category === 'saree' ? 'Synthesize Model Preview' : 'Generate Lifestyle Preview'}
                </Button>
              ) : (
                <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-[2rem] shadow-lg border border-primary/5 space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="h-3 md:h-4 w-3 md:w-4 text-primary" />
                    <Label className="text-[9px] md:text-xs font-black uppercase tracking-widest text-primary">Refine Visual Identity</Label>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <Input placeholder="e.g. adjust lighting, change background..." value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} className="bg-muted/30 border-none h-12 md:h-14 rounded-lg md:rounded-2xl" />
                    <Button onClick={handleRefine} disabled={isRefining} variant="outline" className="h-12 md:h-14 w-12 md:w-14 rounded-lg md:rounded-2xl shrink-0"><Wand2 className="h-5 md:h-6 w-5 md:w-6" /></Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-white/50 p-6 md:p-8 border-t border-primary/5 sticky bottom-0 z-30">
          <Button 
            onClick={handleAddToStore} 
            disabled={!aiGeneratedImageDataUrl || isUploading} 
            className="w-full h-16 md:h-20 rounded-xl md:rounded-[2.5rem] text-xl md:text-2xl font-headline bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20"
          >
            {isUploading ? <Loader2 className="mr-3 h-6 md:h-8 w-6 md:w-8 animate-spin" /> : <><Package className="mr-3 h-6 md:h-8 w-6 md:w-8" /> List in {category.toUpperCase()}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

