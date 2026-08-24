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
import { Loader2, PlusCircle, Sparkles, Wand2, Shirt, Camera, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from './providers/app-provider';
import { generateSareeAvatar } from '@/ai/flows/generate-saree-avatar';
import { refineGeneratedAvatar } from '@/ai/flows/refine-generated-avatar';
import { generateCrochetLifestyle } from '@/ai/flows/generate-crochet-lifestyle';
import { ProductCategory } from '@/lib/types';

export function AddSareeDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory>('saree');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [variety, setVariety] = useState('');
  const [backgroundDescription, setBackgroundDescription] = useState('in a professional heritage museum setting with soft spotlights');
  
  // Multiple Image States
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
        setAiGeneratedImageDataUrl(sareeImageDataUrl);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'AI was unable to process this image.' });
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
    if (!name || !price || !description || !sareeImageFile || !aiGeneratedImageDataUrl) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill all details and generate an AI preview.' });
      return;
    }
    setIsUploading(true);
    try {
      await addProduct({
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        variety: variety || undefined,
        category,
        sareeImageFile,
        modelImageDataUrl: aiGeneratedImageDataUrl,
        sareeImgHint: variety || category
      });
      toast({ title: 'Success!', description: 'Product added to the collection.' });
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
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-[#F5F5DC] border-none shadow-2xl rounded-[1.5rem] p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-headline text-3xl text-[#2D1B2E]">Marketplace Curator</DialogTitle>
            <DialogDescription className="text-[#8D7B7B]">Add new products and generate AI visual identity based on category.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Category</Label>
                <Select onValueChange={(v: ProductCategory) => { setCategory(v); setAiGeneratedImageDataUrl(null); }} value={category}>
                  <SelectTrigger className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saree">Saree</SelectItem>
                    <SelectItem value="crochet">Crochet</SelectItem>
                    <SelectItem value="lehenga">Lehenga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Product Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#2D1B2E]">Price (INR)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#2D1B2E]">Stock Count</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Variety / Style</Label>
                <Select onValueChange={setVariety} value={variety}>
                  <SelectTrigger className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl"><SelectValue placeholder="Select variety" /></SelectTrigger>
                  <SelectContent>
                    {category === 'saree' ? sareeVarieties.map((v) => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    )) : (
                      <>
                        <SelectItem value="classic">Classic Heritage</SelectItem>
                        <SelectItem value="modern">Modern Minimalist</SelectItem>
                        <SelectItem value="bespoke">Bespoke Artisan</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#FFFFFF]/50 border-none min-h-[80px] rounded-xl" />
              </div>

              {category === 'crochet' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">AI Lifestyle Setting</Label>
                  <Input 
                    value={backgroundDescription} 
                    onChange={(e) => setBackgroundDescription(e.target.value)} 
                    placeholder="Describe the lifestyle setting..."
                    className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl"
                  />
                </div>
              )}

              {/* Upload Sections */}
              <div className={`grid ${category === 'saree' ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Main Product Photo</Label>
                  <div className="relative group">
                    <Input type="file" accept="image/*" onChange={handleSareeFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="h-16 border-2 border-dashed border-[#8D7B7B]/30 rounded-xl flex items-center justify-center bg-[#FFFFFF]/30 group-hover:bg-[#FFFFFF]/50 transition-all">
                      {sareeImageDataUrl ? <Camera className="h-5 w-5 text-green-600" /> : <Camera className="h-5 w-5 text-[#8D7B7B]" />}
                    </div>
                  </div>
                </div>

                {category === 'saree' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Blouse Piece</Label>
                      <div className="relative group">
                        <Input type="file" accept="image/*" onChange={handleBlouseFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="h-16 border-2 border-dashed border-[#8D7B7B]/30 rounded-xl flex items-center justify-center bg-[#FFFFFF]/30 group-hover:bg-[#FFFFFF]/50 transition-all">
                          {blouseImageDataUrl ? <Shirt className="h-5 w-5 text-green-600" /> : <Shirt className="h-5 w-5 text-[#8D7B7B]" />}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Pattern Detail</Label>
                      <div className="relative group">
                        <Input type="file" accept="image/*" onChange={handleDetailsFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="h-16 border-2 border-dashed border-[#8D7B7B]/30 rounded-xl flex items-center justify-center bg-[#FFFFFF]/30 group-hover:bg-[#FFFFFF]/50 transition-all">
                          {detailsImageDataUrl ? <Info className="h-5 w-5 text-green-600" /> : <Info className="h-5 w-5 text-[#8D7B7B]" />}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 h-[350px]">
                <div className="border border-[#8D7B7B]/20 rounded-[2rem] bg-[#E8E8D0] flex items-center justify-center relative overflow-hidden shadow-inner">
                  {sareeImageDataUrl ? (
                    <Image src={sareeImageDataUrl} alt="Original" fill className="object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B] opacity-40">Original Photo</p>
                    </div>
                  )}
                </div>
                <div className="border border-[#8D7B7B]/20 rounded-[2rem] bg-[#E8E8D0] flex items-center justify-center relative overflow-hidden shadow-inner">
                  {isGenerating || isRefining ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">AI Processing...</p>
                    </div>
                  ) : aiGeneratedImageDataUrl ? (
                    <Image src={aiGeneratedImageDataUrl} alt="AI Preview" fill className="object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B] opacity-40">AI Result</p>
                    </div>
                  )}
                </div>
              </div>

              {!aiGeneratedImageDataUrl ? (
                <Button 
                  onClick={handleGenerate} 
                  disabled={!sareeImageDataUrl || isGenerating} 
                  className="w-full h-14 rounded-2xl bg-[#FFE14D] hover:bg-[#F7D400] text-[#2D1B2E] font-headline text-lg shadow-xl shadow-[#F7D400]/20"
                >
                  {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate AI Preview
                </Button>
              ) : (
                <div className="space-y-3 p-5 bg-[#FFFFFF]/40 rounded-3xl border border-[#8D7B7B]/10">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Refine Result</Label>
                  <div className="flex gap-3">
                    <Input placeholder="e.g. make background warmer..." value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} className="bg-[#FFFFFF]/60 border-none h-12 rounded-xl" />
                    <Button onClick={handleRefine} disabled={isRefining} variant="outline" className="h-12 w-12 rounded-xl shrink-0"><Wand2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-[#FFFFFF]/50 p-6">
          <Button 
            onClick={handleAddToStore} 
            disabled={!aiGeneratedImageDataUrl || isUploading} 
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#A17E7E] hover:bg-[#8D7B7B] text-white font-headline text-lg"
          >
            {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'List Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
