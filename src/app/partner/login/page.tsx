'use client';

import { Suspense } from 'react';
import { PartnerLoginForm } from './components/partner-login-form';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageSkeleton() {
    return <Skeleton className="w-full max-w-md h-[600px] rounded-[2rem]" />;
}

export default function PartnerLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F4ED] p-4">
      <Suspense fallback={<LoginPageSkeleton />}>
        <div className="w-full max-w-md">
          <PartnerLoginForm />
        </div>
      </Suspense>
    </div>
  );
}
