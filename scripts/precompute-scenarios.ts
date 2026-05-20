import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scenarios } from '../lib/scenarios';
import type { AnalysisOutput } from '../types/program';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'data', 'scenarios');

async function runOne(slug: keyof typeof scenarios): Promise<void> {
  const intake = scenarios[slug];
  console.log(`\n→ ${slug}: posting intake to ${BASE}/api/analyze`);

  const res = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intake),
  });

  if (!res.ok || !res.body) {
    throw new Error(`${slug}: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let output: AnalysisOutput | null = null;
  let progressCount = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data: '));
      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.slice(6)) as {
        type: string;
        programId?: string;
        output?: AnalysisOutput;
        message?: string;
      };
      if (payload.type === 'progress' && payload.programId) {
        progressCount++;
        process.stdout.write('.');
      } else if (payload.type === 'complete' && payload.output) {
        output = payload.output;
      } else if (payload.type === 'error') {
        throw new Error(`${slug}: ${payload.message}`);
      }
    }
  }

  if (!output) throw new Error(`${slug}: no complete event received`);

  const eligibleCount = output.matches.filter((m) => m.eligible).length;
  console.log(
    `\n✓ ${slug}: $${output.total_estimated_annual_value.toLocaleString()} across ${eligibleCount} eligible programs (${progressCount} programs evaluated)`
  );

  const path = join(OUT_DIR, `${slug}.json`);
  writeFileSync(path, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`  wrote ${path}`);
}

async function main() {
  for (const slug of Object.keys(scenarios) as (keyof typeof scenarios)[]) {
    await runOne(slug);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
