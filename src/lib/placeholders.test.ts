import { describe, expect, it } from 'vitest';
import { ANSWERS, buildAnswers } from '../content/answers';
import { CONFIG } from '../content/config';
import { FILES, buildFiles } from '../content/files';
import { stripPlaceholders } from './placeholders';

const BRACKET_CAPS = /\[[A-Z]/;

describe('stripPlaceholders', () => {
  it('drops placeholder lines and lists their labels', () => {
    expect(stripPlaceholders('a\nCost: [AMOUNT]\nWhy: [REASON, SHORT]')).toBe(
      'a\nNot written yet: Cost, Why.',
    );
  });

  it('leaves text without placeholders alone', () => {
    expect(stripPlaceholders('a\n[sudo] lowercase is fine')).toBe('a\n[sudo] lowercase is fine');
  });
});

describe('rendered content', () => {
  it.each(Object.entries(FILES))('%s has no [CAPS] placeholder', (_path, text) => {
    expect(text).not.toMatch(BRACKET_CAPS);
  });

  it.each(ANSWERS.map((r) => [r.topic, r.answer]))('%s answer has no placeholder', (_t, a) => {
    expect(a).not.toMatch(BRACKET_CAPS);
  });

  it('ends the streak file with what is not written yet', () => {
    expect(FILES['projects/streak-system.md'].split('\n').at(-1)).toBe(
      'Not written yet: How the 10% was measured, What I would do differently.',
    );
  });

  it('says "not written yet" for empty config values', () => {
    const empty = { ...CONFIG, START: '', GRAD: '', FEE: '' };
    const files = buildFiles(empty);
    expect(files['availability.md']).toContain('- Start: not written yet.');
    expect(files['visa.md']).toContain('- Sponsor fee: not written yet; it varies by sponsor.');
    const hosting = buildAnswers(empty).find((r) => r.topic === 'hosting');
    expect(hosting?.answer).toMatch(/Sponsor fee: not written yet; it varies by sponsor\.$/);
  });
});
