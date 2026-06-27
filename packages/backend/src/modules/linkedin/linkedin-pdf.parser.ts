/**
 * Parse the text of a LinkedIn "Save to PDF" export into its real sections plus
 * the member's name and headline.
 *
 * LinkedIn's PDF lays out a sidebar (Contact, Top Skills, Languages,
 * Certifications, Honors) and a main column (Name, Headline, Location, Summary,
 * Experience, Education). When flattened to text the section headers survive as
 * standalone lines, which lets us split on them and pull per-section content
 * instead of guessing from one big blob.
 */

export interface ParsedLinkedinProfile {
  name: string;
  headline: string;
  /** Lower-cased section key → that section's text. */
  sections: Record<string, string>;
}

const HEADERS: { key: string; pattern: RegExp }[] = [
  { key: 'contact', pattern: /^contact$/i },
  { key: 'skills', pattern: /^(top skills|skills)$/i },
  { key: 'languages', pattern: /^languages?$/i },
  {
    key: 'certifications',
    pattern: /^(licen[cs]es?\s*(&|and)\s*certifications?|certifications?)$/i,
  },
  {
    key: 'honors',
    pattern: /^(honors?[-\s]?awards?|honors?\s*(&|and)\s*awards?)$/i,
  },
  { key: 'summary', pattern: /^(summary|about)$/i },
  { key: 'experience', pattern: /^experience$/i },
  { key: 'education', pattern: /^education$/i },
  { key: 'recommendations', pattern: /^recommendations?$/i },
  { key: 'featured', pattern: /^featured$/i },
  { key: 'publications', pattern: /^publications?$/i },
  { key: 'projects', pattern: /^projects?$/i },
  { key: 'volunteering', pattern: /^(volunteering|volunteer experience)$/i },
];

const MAIN_ANCHORS = ['summary', 'experience', 'education'];

/** 2–4 Title-case words (no all-caps acronyms, no commas) — a plausible name. */
const NAME_RE = /^[A-Z][a-zà-ÿ'’.-]+(?:\s+[A-Z][a-zà-ÿ'’.-]+){1,3}$/;

export function parseLinkedinProfile(text: string): ParsedLinkedinProfile {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Split into sections by recognised headers (tracking line indices).
  const buckets: Record<string, number[]> = { __preamble__: [] };
  let current = '__preamble__';
  const headerIndex: Record<string, number> = {};

  lines.forEach((line, i) => {
    const header = HEADERS.find((h) => h.pattern.test(line));
    if (header) {
      current = header.key;
      if (!buckets[current]) buckets[current] = [];
      if (!(current in headerIndex)) headerIndex[current] = i;
    } else {
      buckets[current].push(i);
    }
  });

  const anchor = MAIN_ANCHORS.map((k) => headerIndex[k]).find(
    (i) => typeof i === 'number',
  );
  const { name, headline, identityStart } = extractIdentity(lines, anchor);

  // The identity block (name/headline/location) sits between its start and the
  // first main section; exclude it from whichever bucket absorbed it.
  const identityRange = new Set<number>();
  if (identityStart >= 0 && typeof anchor === 'number') {
    for (let i = identityStart; i < anchor; i++) identityRange.add(i);
  }

  const sections: Record<string, string> = {};
  for (const [key, idxs] of Object.entries(buckets)) {
    if (key === '__preamble__') continue;
    sections[key] = idxs
      .filter((i) => !identityRange.has(i))
      .map((i) => lines[i])
      .join('\n')
      .trim();
  }

  return { name, headline, sections };
}

function extractIdentity(
  lines: string[],
  anchor: number | undefined,
): { name: string; headline: string; identityStart: number } {
  const start = typeof anchor === 'number' ? Math.max(0, anchor - 5) : 0;
  const end = typeof anchor === 'number' ? anchor : Math.min(lines.length, 8);

  for (let i = start; i < end; i++) {
    if (NAME_RE.test(lines[i]) && !lines[i].includes('@')) {
      const next = lines[i + 1];
      const headline = next && i + 1 < end && next.length <= 120 ? next : '';
      return {
        name: lines[i],
        headline: headline || 'your target role',
        identityStart: i,
      };
    }
  }

  // Fallback: first name-like line anywhere (skips emails/links).
  const idx = lines.findIndex((l) => NAME_RE.test(l) && !l.includes('@'));
  return {
    name: idx >= 0 ? lines[idx] : 'Your LinkedIn Profile',
    headline: 'your target role',
    identityStart: idx,
  };
}
