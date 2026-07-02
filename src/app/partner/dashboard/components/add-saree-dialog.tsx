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
import { Loader2, PlusCircle, Sparkles, Wand2, Package, Camera, Shirt, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/components/providers/app-provider';
import { generateSareeAvatar } from '@/ai/flows/generate-saree-avatar';
import { refineGeneratedAvatar } from '@/ai/flows/refine-generated-avatar';

export function WholesalerAddSareeDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [variety, setVariety] = useState('');

  // Multiple Textile Input States
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
    if (!name || !price || !wholesalePrice || !description || !sareeImageFile || !modelImageDataUrl) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill all fields including main image.' });
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
        sareeImageFile,
        modelImageDataUrl,
        sareeImgHint: variety || 'handloom saree'
      });
      toast({ title: 'New Arrival Added!', description: 'Your saree is now live for approval/sale.' });
      resetForm();
      setOpen(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
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
    setModelImageDataUrl(null);
    setRefinementPrompt('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground h-12 rounded-2xl shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Upload New Arrival
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px] bg-[#F3F4ED] border-none shadow-[0_32px_64px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="font-headline text-3xl text-primary">Add Wholesale Inventory</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">List your latest collection and generate composite AI model previews using multiple fabric parts.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Side */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-primary ml-1">Product Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-none h-14 rounded-2xl shadow-sm focus-visible:ring-primary/20" placeholder="e.g. Royal Blue Jamdani" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-primary ml-1">Variety</Label>
                  <Select onValueChange={setVariety} value={variety}>
                    <SelectTrigger className="bg-white border-none h-14 rounded-2xl shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {sareeVarieties.map((v) => (
                        <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-primary ml-1">Stock Count</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-white border-none h-14 rounded-2xl shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-primary ml-1">Retail (INR)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-white border-none h-14 rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-primary ml-1">Wholesale (INR)</Label>
                  <Input type="number" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} className="bg-white border-none h-14 rounded-2xl shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-primary ml-1">Fabric Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-none min-h-[120px] rounded-2xl shadow-sm" />
              </div>

              {/* Multi-Photo Inputs */}
              <div className="pt-4 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Textile Component Uploads</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative group">
                    <Label className="absolute -top-6 left-0 text-[8px] font-bold text-primary uppercase">Main Saree</Label>
                    <Input type="file" accept="image/*" onChange={handleSareeFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                    <div className={`h-16 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${sareeImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                      <Camera className={`h-6 w-6 ${sareeImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                    </div>
                  </div>
                  <div className="relative group">
                    <Label className="absolute -top-6 left-0 text-[8px] font-bold text-primary uppercase">Blouse Piece</Label>
                    <Input type="file" accept="image/*" onChange={handleBlouseFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                    <div className={`h-16 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${blouseImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                      <Shirt className={`h-6 w-6 ${blouseImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                    </div>
                  </div>
                  <div className="relative group">
                    <Label className="absolute -top-6 left-0 text-[8px] font-bold text-primary uppercase">Close-up</Label>
                    <Input type="file" accept="image/*" onChange={handleDetailsFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                    <div className={`h-16 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${detailsImageDataUrl ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-white group-hover:bg-primary/5'}`}>
                      <Info className={`h-6 w-6 ${detailsImageDataUrl ? 'text-green-600' : 'text-primary/40'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6 h-[400px]">
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden relative border border-primary/5">
                  {sareeImageDataUrl ? (
                    <Image src={sareeImageDataUrl} alt="Saree" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                      <div className="p-4 rounded-full bg-primary/5"><Camera className="h-8 w-8 text-primary/20" /></div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Primary Fabric</p>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden relative border border-primary/5">
                  {isGenerating || isRefining ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">AI Tailoring...</p>
                    </div>
                  ) : modelImageDataUrl ? (
                    <Image src={modelImageDataUrl} alt="Model" fill className="object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                      <div className="p-4 rounded-full bg-primary/5"><Sparkles className="h-8 w-8 text-primary/20" /></div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Model Preview</p>
                    </div>
                  )}
                </div>
              </div>

              {!modelImageDataUrl ? (
                <Button 
                  onClick={handleGenerate} 
                  disabled={!sareeImageDataUrl || isGenerating} 
                  className="w-full h-16 rounded-[2rem] bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl shadow-accent/20 text-xl font-headline"
                >
                  {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}
                  Generate AI Model Preview
                </Button>
              ) : (
                <div className="p-6 bg-white rounded-[2rem] shadow-lg border border-primary/5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-black uppercase tracking-widest text-primary">Refine Model Preview</Label>
                  </div>
                  <div className="flex gap-3">
                    <Input placeholder="e.g. changing background to a luxury garden..." value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} className="bg-muted/30 border-none h-14 rounded-2xl" />
                    <Button onClick={handleRefine} disabled={isRefining} variant="outline" className="h-14 w-14 rounded-2xl shrink-0"><Wand2 className="h-6 w-6" /></Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-white/50 p-8 border-t border-primary/5">
          <Button 
            onClick={handleAddToStore} 
            disabled={!modelImageDataUrl || isUploading} 
            className="w-full h-20 rounded-[2.5rem] text-2xl font-headline bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20"
          >
            {isUploading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <><Package className="mr-3 h-8 w-8" /> Add to Wholesale Collection</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
