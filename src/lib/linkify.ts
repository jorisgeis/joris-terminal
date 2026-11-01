export interface Segment {
  text: string;
  href?: string;
  external?: boolean;
}

const LINK =
  /(https?:\/\/[^\s]+|geis\.joris@gmail\.com|(?:www\.)?(?:linkedin\.com\/in\/jorisgeis|github\.com\/jorisgeis))/g;

/** Splits text into plain and link segments (URLs, Joris's email, LinkedIn and GitHub). */
export function linkify(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const found = m[0];
    const at = m.index;
    if (at > last) out.push({ text: text.slice(last, at) });
    const href = found.includes('@')
      ? 'mailto:' + found
      : found.startsWith('http')
        ? found
        : 'https://' + found;
    out.push({ text: found, href, external: href.startsWith('http') });
    last = at + found.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
