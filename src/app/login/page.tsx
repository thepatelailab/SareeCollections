'use client';

import { Suspense } from 'react';
import { LoginForm } from './components/login-form';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageSkeleton() {
    return <Skeleton className="w-full max-w-sm h-[480px]" />;
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Suspense fallback={<LoginPageSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
