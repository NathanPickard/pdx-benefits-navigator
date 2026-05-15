import { NextRequest, NextResponse } from 'next/server';
import { analyzeEligibility } from '@/lib/claude';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const intake = await req.json();
    const result = await analyzeEligibility(intake);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
