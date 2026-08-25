'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export function PartnerOrders() {
  return (
    <Card className="border-dashed py-20 flex flex-col items-center text-center rounded-[2rem]">
      <Truck className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-xl font-headline text-primary">Logistics Portal</h3>
      <p className="text-muted-foreground mt-2 max-w-xs">The partner orders interface is undergoing maintenance. Please use the artisan email support for fulfillment details.</p>
    </Card>
  );
}
