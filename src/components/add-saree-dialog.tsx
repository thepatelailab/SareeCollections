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
import { Loader2, PlusCircle, Sparkles, Wand2, Shirt, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from './providers/app-provider';
import { generateSareeAvatar } from '@/ai/flows/generate-saree-avatar';
import { refineGeneratedAvatar } from '@/ai/flows/refine-generated-avatar';

export function AddSareeDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [variety, setVariety] = useState('');
  
  // Multiple Image States
  const [sareeImageFile, setSareeImageFile] = useState<File | null>(null);
  const [sareeImageDataUrl, setSareeImageDataUrl] = useState<string | null>(null);
  const [blouseImageDataUrl, setBlouseImageDataUrl] = useState<string | null>(null);
  const [detailsImageDataUrl, setDetailsImageDataUrl] = useState<string | null>(null);
  
  const [modelImageDataUrl, setModelImageDataUrl] = useState<string | null>(null);
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
        setModelImageDataUrl(null);
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
      const result = await generateSareeAvatar({ 
        sareePhotoDataUri: sareeImageDataUrl,
        blousePhotoDataUri: blouseImageDataUrl || undefined,
        detailsPhotoDataUri: detailsImageDataUrl || undefined
      });
      setModelImageDataUrl(result.modelWearingSareeDataUri);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!modelImageDataUrl || !refinementPrompt) return;
    setIsRefining(true);
    try {
      const result = await refineGeneratedAvatar({ initialImage: modelImageDataUrl, refinementPrompt: refinementPrompt });
      setModelImageDataUrl(result.refinedImage);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddToStore = async () => {
    if (!name || !price || !description || !sareeImageFile || !modelImageDataUrl) {
      toast({ variant: 'destructive', title: 'Missing Info' });
      return;
    }
    setIsUploading(true);
    try {
      await addProduct({
        name,
        price: parseFloat(price),
        description,
        variety: variety || undefined,
        sareeImageFile,
        modelImageDataUrl,
        sareeImgHint: variety || 'custom saree'
      });
      toast({ title: 'Success!', description: 'Product added.' });
      resetForm();
      setOpen(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setVariety('');
    setSareeImageFile(null);
    setSareeImageDataUrl(null);
    setBlouseImageDataUrl(null);
    setDetailsImageDataUrl(null);
    setModelImageDataUrl(null);
    setRefinementPrompt('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Saree</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-[#F5F5DC] border-none shadow-2xl rounded-[1.5rem] p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-headline text-3xl text-[#2D1B2E]">Add a New Saree</DialogTitle>
            <DialogDescription className="text-[#8D7B7B]">Fill details and use AI to generate a combined model preview.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Saree Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Variety</Label>
                <Select onValueChange={setVariety} value={variety}>
                  <SelectTrigger className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl"><SelectValue placeholder="Select variety" /></SelectTrigger>
                  <SelectContent>
                    {sareeVarieties.map((v) => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Price (INR)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-[#FFFFFF]/50 border-none h-12 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#2D1B2E]">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#FFFFFF]/50 border-none min-h-[100px] rounded-xl" />
              </div>

              {/* Multiple Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Saree Main</Label>
                  <div className="relative group">
                    <Input type="file" accept="image/*" onChange={handleSareeFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="h-16 border-2 border-dashed border-[#8D7B7B]/30 rounded-xl flex items-center justify-center bg-[#FFFFFF]/30 group-hover:bg-[#FFFFFF]/50 transition-all">
                      {sareeImageDataUrl ? <Camera className="h-5 w-5 text-green-600" /> : <Camera className="h-5 w-5 text-[#8D7B7B]" />}
                    </div>
                  </div>
                </div>

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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Pallu/Detail</Label>
                  <div className="relative group">
                    <Input type="file" accept="image/*" onChange={handleDetailsFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="h-16 border-2 border-dashed border-[#8D7B7B]/30 rounded-xl flex items-center justify-center bg-[#FFFFFF]/30 group-hover:bg-[#FFFFFF]/50 transition-all">
                      {detailsImageDataUrl ? <PlusCircle className="h-5 w-5 text-green-600" /> : <PlusCircle className="h-5 w-5 text-[#8D7B7B]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 h-[350px]">
                <div className="border border-[#8D7B7B]/20 rounded-[2rem] bg-[#E8E8D0] flex items-center justify-center relative overflow-hidden shadow-inner">
                  {sareeImageDataUrl ? (
                    <Image src={sareeImageDataUrl} alt="Saree" fill className="object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B] opacity-40">Saree Preview</p>
                    </div>
                  )}
                </div>
                <div className="border border-[#8D7B7B]/20 rounded-[2rem] bg-[#E8E8D0] flex items-center justify-center relative overflow-hidden shadow-inner">
                  {isGenerating || isRefining ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">Designing...</p>
                    </div>
                  ) : modelImageDataUrl ? (
                    <Image src={modelImageDataUrl} alt="Model" fill className="object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B] opacity-40">Model Preview</p>
                    </div>
                  )}
                </div>
              </div>

              {!modelImageDataUrl ? (
                <Button 
                  onClick={handleGenerate} 
                  disabled={!sareeImageDataUrl || isGenerating} 
                  className="w-full h-14 rounded-2xl bg-[#FFE14D] hover:bg-[#F7D400] text-[#2D1B2E] font-headline text-lg shadow-xl shadow-[#F7D400]/20"
                >
                  {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Avatar
                </Button>
              ) : (
                <div className="space-y-3 p-5 bg-[#FFFFFF]/40 rounded-3xl border border-[#8D7B7B]/10">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#8D7B7B]">Refine Model Appearance</Label>
                  <div className="flex gap-3">
                    <Input placeholder="e.g. at a vintage palace balcony..." value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} className="bg-[#FFFFFF]/60 border-none h-12 rounded-xl" />
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
            disabled={!modelImageDataUrl || isUploading} 
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#A17E7E] hover:bg-[#8D7B7B] text-white font-headline text-lg"
          >
            {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Add to Store'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
