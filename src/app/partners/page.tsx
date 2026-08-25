
'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PartnersDirectoryPage() {
  const firestore = useFirestore();

  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', 'in', ['wholesaler', 'admin']), limit(100));
  }, [firestore]);

  const { data: partners, isLoading } = useCollection<UserProfile>(partnersQuery as any);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <title>Our Artisan Partners | SareeDukan.Com Directory</title>
      <meta name="description" content="Meet the master weavers and wholesalers behind our heritage collection. Explore individual boutiques from across the globe." />
      
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-headline text-primary lowercase leading-tight">artisan partners</h1>
        <p className="text-xl text-muted-foreground italic font-body max-w-2xl mx-auto">
          Connecting you directly to the source of heritage textiles. Explore our verified partner boutiques.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners?.map((partner) => (
            <Card key={partner.id} className="rounded-[2rem] border-primary/5 shadow-lg hover:shadow-2xl transition-all group overflow-hidden">
              <CardHeader className="p-8">
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-primary/5 p-3 rounded-2xl text-primary"><Store className="h-6 w-6" /></div>
                   <div className="bg-accent/20 text-accent-foreground text-[8px] font-black uppercase px-3 py-1 rounded-full"><Award className="h-3 w-3 inline mr-1" /> Verified</div>
                </div>
                <CardTitle className="font-headline text-2xl text-primary lowercase truncate">
                  {partner.businessName || 'Heritage Boutique'}
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-black opacity-40 mt-2">
                  Partner ID: {partner.id.slice(-6)}
                </CardDescription>
                <div className="pt-6">
                  <Button asChild variant="outline" className="w-full rounded-xl border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Link href={`/partners/${partner.id}`}>
                      Visit Boutique <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
