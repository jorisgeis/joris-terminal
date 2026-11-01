import { describe, expect, it } from 'vitest';
import { COMMAND_NAMES, matchCommands, readFile, runCommand } from './commands';
import type { Block } from './types';

const ctx = { theme: 'light' as const };
const text = (blocks: Block[]) =>
  blocks.flatMap((b) => (b.kind === 'out' ? [b.text] : [])).join('\n');

describe('slash commands', () => {
  it('has every command from the brief', () => {
    expect(COMMAND_NAMES).toEqual([
      '/help',
      '/about',
      '/start',
      '/visa',
      '/experience',
      '/projects',
      '/stack',
      '/why',
      '/contact',
      '/resume',
      '/ls',
      '/cat',
      '/theme',
      '/clear',
    ]);
  });

  it('/help lists every command', () => {
    const [help] = runCommand('/help', ctx).blocks;
    expect(help?.kind).toBe('help');
    if (help?.kind !== 'help') return;
    expect(help.rows.map((r) => r.cmd)).toEqual(COMMAND_NAMES);
    expect(help.rows.every((r) => r.desc.length > 0)).toBe(true);
  });

  it('/cat nope shows an error', () => {
    const { blocks } = runCommand('/cat nope', ctx);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: 'out', cls: 'err' });
    expect(text(blocks)).toMatch(/^no such file: nope\. Files: README\.md, /);
  });

  it('/cat visa resolves to visa.md', () => {
    const { blocks } = runCommand('/cat visa', ctx);
    expect(blocks[0]).toMatchObject({ kind: 'tool', name: 'read_file', arg: 'visa.md' });
    expect(text(blocks)).toMatch(/^J-1 Intern visa: what hosting involves/);
    expect(readFile('./visa').path).toBe('visa.md');
  });

  it('/cat with no file shows an error', () => {
    expect(text(runCommand('/cat', ctx).blocks)).toMatch(/^no such file: \(none\)\./);
  });

  it('is case-insensitive and rejects unknown commands', () => {
    expect(runCommand('/HELP', ctx).blocks[0]?.kind).toBe('help');
    expect(runCommand('/nope', ctx).blocks[0]).toEqual({
      kind: 'out',
      text: 'unknown command /nope. try /help',
      cls: 'err',
    });
  });

  it('/experience prints every role, newest first', () => {
    const tools = runCommand('/experience', ctx).blocks.flatMap((b) =>
      b.kind === 'tool' ? [b.arg] : [],
    );
    expect(tools).toEqual([
      'experience/arztkonsultation.md',
      'experience/nova-digital.md',
      'experience/groupera.md',
      'experience/buildnext.md',
    ]);
  });

  it('/theme flips the theme and /clear clears', () => {
    expect(runCommand('/theme', { theme: 'dark' }).effect).toEqual({
      type: 'theme',
      next: 'light',
    });
    expect(runCommand('/theme', ctx).effect).toEqual({ type: 'theme', next: 'dark' });
    expect(runCommand('/clear', ctx).effect).toEqual({ type: 'clear' });
  });

  it('matches commands by prefix for the menu', () => {
    expect(matchCommands('/c')).toEqual(['/contact', '/cat', '/clear']);
    expect(matchCommands('/')).toEqual(COMMAND_NAMES);
  });
});
