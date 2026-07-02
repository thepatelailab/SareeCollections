'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { useAppContext } from '@/components/providers/app-provider';
import { generateHeroImage } from '@/ai/flows/generate-hero-image';

export function HeroSettings() {
  const { heroImageUrl, updateHeroImage, isHeroImageLoading } = useAppContext();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (heroImageUrl) {
      setPreviewUrl(heroImageUrl);
    }
  }, [heroImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAiImage = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const result = await generateHeroImage({ prompt: aiPrompt });
      setPreviewUrl(result.imageDataUri);
      setImageFile(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateImage = async () => {
    let imageToUpload: File | Blob;
    if (imageFile) {
      imageToUpload = imageFile;
    } else if (previewUrl && previewUrl.startsWith('data:')) {
      const response = await fetch(previewUrl);
      imageToUpload = await response.blob();
    } else {
      return;
    }

    setIsUploading(true);
    try {
      await updateHeroImage(imageToUpload);
      toast({ title: 'Success!', description: 'Hero image updated.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero Image</CardTitle>
          <CardDescription>Upload a new image or generate one with AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hero-image">Upload New Image</Label>
            <Input id="hero-image" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Generate with AI</Label>
            <Textarea
              id="ai-prompt"
              placeholder="A festive banner showing elegant sarees in a traditional setting..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button onClick={handleGenerateAiImage} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate AI Image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Preview</CardTitle>
          <CardDescription>Current live banner on your site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted">
            {isHeroImageLoading || isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : previewUrl ? (
              <Image src={previewUrl} alt="Hero" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-sm text-muted-foreground">No image set</span>
              </div>
            )}
          </div>
          <Button onClick={handleUpdateImage} disabled={!previewUrl || isUploading} className="w-full">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Banner'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
