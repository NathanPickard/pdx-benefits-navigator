import { NextRequest } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';

import { Packet } from '@/lib/packet';
import programsData from '@/data/programs.json';
import type { AnalysisOutput, IntakeData, MatchResult, Program } from '@/types/program';

export const maxDuration = 60;

const PROGRAMS = programsData as Program[];
const PROGRAM_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

export async function POST(req: NextRequest) {
  try {
    const { intake, analysis } = (await req.json()) as {
      intake: IntakeData;
      analysis: AnalysisOutput;
    };
    if (!intake || !analysis) {
      return Response.json(
        { error: 'Missing required fields: intake, analysis' },
        { status: 400 }
      );
    }

    const eligible: { match: MatchResult; program: Program }[] = analysis.matches
      .filter((m) => m.eligible)
      .map((m) => ({ match: m, program: PROGRAM_BY_ID.get(m.program_id) }))
      .filter(
        (row): row is { match: MatchResult; program: Program } => row.program !== undefined
      )
      .sort((a, b) => {
        if (a.program.hidden_gem !== b.program.hidden_gem) return a.program.hidden_gem ? -1 : 1;
        return b.match.estimated_annual_value - a.match.estimated_annual_value;
      });

    const qrCodes: Record<string, string> = {};
    await Promise.all(
      eligible.map(async ({ match, program }) => {
        qrCodes[match.program_id] = await QRCode.toDataURL(program.application_url, {
          width: 180,
          margin: 1,
          color: { dark: '#18181b', light: '#ffffff' },
        });
      })
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
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
