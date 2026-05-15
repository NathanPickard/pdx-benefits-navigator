import { NextRequest } from 'next/server';
import { analyzeEligibilityStream } from '@/lib/claude';
import type { IntakeData } from '@/types/program';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let intake: IntakeData;
  try {
    intake = (await req.json()) as IntakeData;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of analyzeEligibilityStream(intake)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
