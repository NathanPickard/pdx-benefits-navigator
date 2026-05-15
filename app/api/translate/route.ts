import { NextRequest, NextResponse } from 'next/server';
import { translatePayload } from '@/lib/claude';

export const maxDuration = 60;

const ALLOWED = new Set(['es', 'vi', 'ru', 'zh']);

export async function POST(req: NextRequest) {
  try {
    const { payload, language } = (await req.json()) as {
      payload: unknown;
      language: string;
    };
    if (!payload || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: payload, language' },
        { status: 400 }
      );
    }
    if (!ALLOWED.has(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }
    const translated = await translatePayload(payload, language as 'es' | 'vi' | 'ru' | 'zh');
    return NextResponse.json({ translated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
