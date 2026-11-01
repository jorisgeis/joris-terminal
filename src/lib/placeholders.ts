/** Matches a [PLACEHOLDER] such as [BASELINE, PERIOD, WHO WAS COUNTED]. */
export const PLACEHOLDER = /\[[A-Z][A-Z0-9 ,'’-]*\]/;

/**
 * Lines still holding a [PLACEHOLDER] are dropped, so visitors never see them.
 * Their labels (the text before the first colon) are listed in a closing
 * "Not written yet: …" line.
 */
export function stripPlaceholders(text: string): string {
  const missing: string[] = [];
  const kept = text.split('\n').filter((line) => {
    if (!PLACEHOLDER.test(line)) return true;
    const label = (line.split(':')[0] ?? '').trim();
    if (label && !PLACEHOLDER.test(label)) missing.push(label);
    return false;
  });
  if (missing.length) kept.push('Not written yet: ' + missing.join(', ') + '.');
  return kept.join('\n');
}
