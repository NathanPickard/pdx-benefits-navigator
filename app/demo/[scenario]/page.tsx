'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { scenarios } from '@/lib/scenarios';

const SLUG_MAP: Record<string, keyof typeof scenarios> = {
  maria: 'maria',
  james: 'james',
  rose: 'rose',
};

export default function DemoPage() {
  const params = useParams<{ scenario: string }>();
  const router = useRouter();

  useEffect(() => {
    const key = SLUG_MAP[params.scenario];
    if (!key) {
      router.replace('/intake');
      return;
    }
    sessionStorage.setItem('pdx_intake', JSON.stringify(scenarios[key]));
    router.replace('/results');
  }, [params.scenario, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading demo scenario…</p>
      </div>
    </main>
  );
}
