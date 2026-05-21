/**
 * Debug: dump what Firecrawl actually returns for a single URL.
 *
 * Usage: npx tsx scripts/debug-firecrawl.ts <url>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import Firecrawl from '@mendable/firecrawl-js';

async function loadEnv() {
  try {
    const text = await fs.readFile(path.join(process.cwd(), '.env.local'), 'utf8');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* noop */
  }
}

async function main() {
  await loadEnv();
  const url = process.argv[2];
  if (!url) {
    console.error('usage: tsx scripts/debug-firecrawl.ts <url>');
    process.exit(1);
  }
  const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });
  const doc = await firecrawl.scrape(url, {
    formats: ['markdown'],
    onlyMainContent: true,
    timeout: 30000,
  });
  const md = doc.markdown ?? '';
  console.log(`URL: ${url}`);
  console.log(`Length: ${md.length} chars`);
  console.log('---');
  console.log(md.slice(0, 6000));
  console.log('--- (truncated to 6000 for stdout) ---');
  await fs.writeFile('/tmp/firecrawl-debug.md', md);
  console.log(`Full markdown written to /tmp/firecrawl-debug.md`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
