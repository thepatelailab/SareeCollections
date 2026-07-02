'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { discoverItems } from '@/ai/flows/location-saree-discovery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export function LocationDiscovery() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [discoveryType, setDiscoveryType] = useState<'countries' | 'states' | 'sarees'>('countries');
  const [discoveredItems, setDiscoveredItems] = useState<{ name: string; description?: string }[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const [savedCountries, setSavedCountries] = useState<{ id: string; name: string }[]>([]);
  const [savedStates, setSavedStates] = useState<{ id: string; name: string }[]>([]);
  const [savedSarees, setSavedSarees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (firestore) {
      fetchCountries();
    }
  }, [firestore]);

  const fetchCountries = async () => {
    if (!firestore) return;
    const snap = await getDocs(collection(firestore, 'countries'));
    const countries = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    setSavedCountries(countries);
    if (countries.length > 0 && discoveryType === 'countries') {
      setDiscoveryType('states');
    }
  };

  const fetchStates = async (countryName: string) => {
    if (!firestore) return;
    const snap = await getDocs(query(collection(firestore, 'states'), where('countryName', '==', countryName)));
    setSavedStates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
  };

  const fetchSarees = async (stateName: string) => {
    if (!firestore) return;
    const snap = await getDocs(query(collection(firestore, 'sareeVarieties'), where('stateName', '==', stateName)));
    setSavedSarees(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
  };

  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      const result = await discoverItems({
        type: discoveryType,
        parentCountry: selectedCountry,
        parentState: selectedState,
      });

      let filtered = result.items;
      if (discoveryType === 'countries') {
        const existing = new Set(savedCountries.map(c => c.name.toLowerCase()));
        filtered = result.items.filter(i => !existing.has(i.name.toLowerCase()));
      } else if (discoveryType === 'states') {
        const existing = new Set(savedStates.map(s => s.name.toLowerCase()));
        filtered = result.items.filter(i => !existing.has(i.name.toLowerCase()));
      } else if (discoveryType === 'sarees') {
        const existing = new Set(savedSarees.map(s => s.name.toLowerCase()));
        filtered = result.items.filter(i => !existing.has(i.name.toLowerCase()));
      }

      setDiscoveredItems(filtered);
      
      if (filtered.length === 0) {
        toast({ title: 'Discovery Complete', description: 'All recommended items are already in your database.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Discovery Failed' });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSaveItems = async () => {
    if (!firestore) return;
    try {
      for (const item of discoveredItems) {
        if (discoveryType === 'countries') {
          await addDoc(collection(firestore, 'countries'), { name: item.name });
        } else if (discoveryType === 'states') {
          await addDoc(collection(firestore, 'states'), { name: item.name, countryName: selectedCountry });
        } else if (discoveryType === 'sarees') {
          await addDoc(collection(firestore, 'sareeVarieties'), {
            name: item.name,
            description: item.description || '',
            stateName: selectedState,
            countryName: selectedCountry,
          });
        }
      }
      toast({ title: 'Success', description: `Saved ${discoveredItems.length} items to database.` });
      setDiscoveredItems([]);
      
      if (discoveryType === 'countries') await fetchCountries();
      if (discoveryType === 'states') await fetchStates(selectedCountry);
      if (discoveryType === 'sarees') await fetchSarees(selectedState);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    }
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" /> Systematic AI Discovery
        </CardTitle>
        <CardDescription>
          Build your textile database step-by-step: Discover Countries, then States, then specific Saree Varieties.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6">
          {/* Step 1: Country Discovery */}
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                  Countries
                </Label>
                <p className="text-xs text-muted-foreground">Identify global textile hubs.</p>
              </div>
              {savedCountries.length > 0 && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
            
            {savedCountries.length === 0 ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => { setDiscoveryType('countries'); handleDiscover(); }}
                disabled={isDiscovering}
              >
                {isDiscovering && discoveryType === 'countries' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Discover Countries
              </Button>
            ) : (
              <Select
                value={selectedCountry}
                onValueChange={(v) => {
                  setSelectedCountry(v);
                  fetchStates(v);
                  setDiscoveryType('states');
                  setDiscoveredItems([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Country" />
                </SelectTrigger>
                <SelectContent>
                  {savedCountries.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 2: State Discovery */}
          <div className={`p-4 border rounded-lg space-y-4 transition-opacity ${!selectedCountry ? 'opacity-50 pointer-events-none' : 'bg-muted/30'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                  States / Regions
                </Label>
                <p className="text-xs text-muted-foreground">Find weaving regions in {selectedCountry || '...'}.</p>
              </div>
              {savedStates.length > 0 && selectedCountry && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedState}
                onValueChange={(v) => {
                  setSelectedState(v);
                  fetchSarees(v);
                  setDiscoveryType('sarees');
                  setDiscoveredItems([]);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a State" />
                </SelectTrigger>
                <SelectContent>
                  {savedStates.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => { setDiscoveryType('states'); handleDiscover(); }}
                disabled={isDiscovering || !selectedCountry}
              >
                {isDiscovering && discoveryType === 'states' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Step 3: Saree Variety Discovery */}
          <div className={`p-4 border rounded-lg space-y-4 transition-opacity ${!selectedState ? 'opacity-50 pointer-events-none' : 'bg-muted/30'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                  Famous Sarees & Textiles
                </Label>
                <p className="text-xs text-muted-foreground">Identify heritage varieties in {selectedState || '...'}.</p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary text-primary-foreground" 
              onClick={() => { setDiscoveryType('sarees'); handleDiscover(); }}
              disabled={isDiscovering || !selectedState}
            >
              {isDiscovering && discoveryType === 'sarees' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Discover Famous Varieties
            </Button>
          </div>
        </div>

        {discoveredItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-2">
            <div className="border rounded-md p-4 space-y-2 max-h-80 overflow-y-auto bg-card shadow-inner">
              <h4 className="font-semibold text-sm mb-4 text-primary">New AI Recommendations:</h4>
              <ul className="space-y-4">
                {discoveredItems.map((item, i) => (
                  <li key={i} className="flex flex-col border-b last:border-0 pb-3">
                    <span className="font-bold text-sm">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground leading-relaxed">{item.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={handleSaveItems} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Save These Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
