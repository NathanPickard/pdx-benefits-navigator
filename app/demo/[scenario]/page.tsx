import { redirect } from 'next/navigation';

import { DemoLoader } from '@/components/demo/DemoLoader';
import { DEMO_FIXTURES, DEMO_SLUGS, isDemoSlug } from '@/lib/demoFixtures';
import { scenarios } from '@/lib/scenarios';

export function generateStaticParams() {
  return DEMO_SLUGS.map((scenario) => ({ scenario }));
}

/**
 * Server-rendered so only the chosen persona's fixture reaches the client,
 * as props to DemoLoader, instead of bundling all three.
 */
export default async function DemoPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  if (!isDemoSlug(scenario)) redirect('/intake');

  return (
    <DemoLoader intake={scenarios[scenario]} analysis={DEMO_FIXTURES[scenario]} />
  );
}
