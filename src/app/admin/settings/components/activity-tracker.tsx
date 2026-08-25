'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function ActivityTracker() {
  return (
    <div className="space-y-8">
      <Card className="rounded-[2.5rem] shadow-xl border-primary/5">
        <CardHeader className="p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary lowercase">
            <BarChart3 className="h-6 w-6" /> insights hub
          </CardTitle>
          <CardDescription>Advanced analytics and real-time logs are currently being upgraded.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-20 flex flex-col items-center justify-center opacity-40">
           <BarChart3 className="h-16 w-16 mb-4" />
           <p className="text-sm font-bold uppercase tracking-widest">Analytics Offline</p>
        </CardContent>
      </Card>
    </div>
  );
}
