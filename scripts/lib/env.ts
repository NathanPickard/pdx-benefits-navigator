import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Loads `KEY=value` lines from `<root>/.env.local` into `process.env` without
 * overriding variables already set in the shell. Missing file is not an error:
 * scripts fall back to the shell environment.
 */
export async function loadDotEnvLocal(root: string = process.cwd()): Promise<void> {
  try {
    const text = await readFile(join(root, '.env.local'), 'utf8');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // Fall back to shell env.
  }
}
