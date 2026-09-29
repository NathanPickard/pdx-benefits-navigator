/**
 * Rewrites the persona numbers in README.md from the baked fixtures so the
 * docs can never drift from what /demo actually shows. Run after `npm run bake`.
 *
 * Run: npm run sync:readme
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const README = path.join(ROOT, 'README.md');

type Fixture = {
  total_estimated_annual_value: number;
  federal_only_value: number;
  matches: { eligible: boolean }[];
};
const load = (slug: string): Fixture =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'scenarios', `${slug}.json`), 'utf8'));

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
const eligible = (f: Fixture) => f.matches.filter((m) => m.eligible).length;

const maria = load('maria');
const james = load('james');
const rose = load('rose');

const personas: Array<[string, string, Fixture]> = [
  ['María & family', 'Household of 4 with 2 kids, part-time at Fred Meyer, renter in Cully, Spanish-speaking, 12% rent increase', maria],
  ['James', 'Single, disabled veteran, unemployed, owns home in St. Johns', james],
  ['Rose', 'Senior widow, Social Security only, owns home in Lents, Vietnamese-speaking', rose],
];

// The markers wrap the WHOLE table (header included). An HTML comment between
// the header separator and the body rows terminates the table in GitHub's
// Markdown renderer, so the header must live inside the synced region.
const TABLE_HEADER =
  '| Family | Situation | Federal & state programs | PDX Benefits Navigator (full local layer) |\n' +
  '|---|---|---|---|';

const tableRows =
  TABLE_HEADER +
  '\n' +
  personas
    .map(([name, situation, f]) =>
      `| **${name}** | ${situation} | ${usd(f.federal_only_value)}/yr | **${usd(f.total_estimated_annual_value)}/yr** across ${eligible(f)} programs |`,
    )
    .join('\n');

const mDelta = maria.total_estimated_annual_value - maria.federal_only_value;
const hook =
  `> Federal and Oregon programs alone come to **${usd(maria.federal_only_value)}/yr** for María's family.\n` +
  `> Adding Multnomah County and City of Portland programs brings the estimate to **${usd(maria.total_estimated_annual_value)}/yr**: **${usd(mDelta)} more** that federal-and-state screeners don't check.`;

function replaceRegion(text: string, name: string, body: string): string {
  const re = new RegExp(`(<!-- README:${name}:START -->\\n)[\\s\\S]*?(\\n<!-- README:${name}:END -->)`);
  if (!re.test(text)) throw new Error(`Missing README markers for ${name}`);
  return text.replace(re, (_match, start: string, end: string) => start + body + end);
}

let text = fs.readFileSync(README, 'utf8');
text = replaceRegion(text, 'HOOK', hook);
text = replaceRegion(text, 'TABLE', tableRows);
fs.writeFileSync(README, text);
console.log('✓ Synced README persona numbers from fixtures.');
