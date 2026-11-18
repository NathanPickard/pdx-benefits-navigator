import { NextRequest } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { z } from 'zod';

import { AnalysisOutputSchema } from '@/lib/eligibilitySchema';
import { IntakeSchema } from '@/lib/intakeSchema';
import { Packet } from '@/lib/packet';
import { PROGRAM_BY_ID, compareGemThenValue } from '@/lib/programs';
import type { AnalysisOutput, IntakeData, MatchResult, Program } from '@/types/program';

export const maxDuration = 60;

const PacketRequestSchema = z.object({
  intake: IntakeSchema,
  analysis: AnalysisOutputSchema,
});

const QR_OPTIONS = {
  width: 180,
  margin: 1,
  color: { dark: '#18181b', light: '#ffffff' },
} as const;

async function readJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const parsed = PacketRequestSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const intake: IntakeData = parsed.data.intake;
  const analysis: AnalysisOutput = parsed.data.analysis;

  try {
    const eligible: { match: MatchResult; program: Program }[] = analysis.matches
      .filter((m) => m.eligible)
      .map((m) => ({ match: m, program: PROGRAM_BY_ID.get(m.program_id) }))
      .filter(
        (row): row is { match: MatchResult; program: Program } => row.program !== undefined
      )
      .sort(compareGemThenValue);

    const qrCodes: Record<string, string> = Object.fromEntries(
      await Promise.all(
        eligible.map(
          async ({ match, program }) =>
            [match.program_id, await QRCode.toDataURL(program.application_url, QR_OPTIONS)] as const
        )
      )
    );

    const element = createElement(Packet, {
      intake,
      analysis,
      eligible,
      qrCodes,
    }) as unknown as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pdx-benefits-packet.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    // Log only the error name and message; never the request body (intake answers).
    const detail = e instanceof Error ? `${e.name}: ${e.message}` : 'Unknown error';
    console.error(`[api/packet] PDF render failed: ${detail}`);
    return Response.json({ error: 'Failed to generate packet' }, { status: 500 });
  }
}
