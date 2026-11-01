import { CONFIG, EMAIL } from '../content/config';
import { FILES, PATHS, lineCount, type FilePath } from '../content/files';
import type { Theme } from './theme';
import type { Block } from './types';

export type Effect = { type: 'clear' } | { type: 'theme'; next: Theme };

export interface CommandResult {
  blocks: Block[];
  effect?: Effect;
}

export interface CommandContext {
  theme: Theme;
}

interface Command {
  help: string;
  run: (arg: string, ctx: CommandContext) => CommandResult;
}

export const HELP_FOOTER =
  '\nor ask in plain English, for example:\n  when can he start?\n  what did he build at groupera?\n  what does hosting him involve?\n  does he know python?';

const out = (text: string, cls?: 'err' | 'd'): Block => ({
  kind: 'out',
  text,
  ...(cls && { cls }),
});

function cat(path: FilePath): Block[] {
  return [
    { kind: 'tool', name: 'read_file', arg: path, result: 'read ' + lineCount(path) + ' lines' },
    out(FILES[path]),
  ];
}

const resumeLine = (label: string) =>
  CONFIG.RESUME_URL
    ? label + ': ' + CONFIG.RESUME_URL
    : 'The résumé isn’t linked yet. Email ' + EMAIL + '.';

/** Resolves "visa", "./visa.md" or "/stack" to a file; throws with the file list if none match. */
export function readFile(raw: string): { path: FilePath; content: string } {
  const path = raw.replace(/^\.?\//, '').trim();
  const hit =
    PATHS.find((p) => p === path) ?? (path ? PATHS.find((p) => p.includes(path)) : undefined);
  if (!hit) throw new Error('no such file: ' + (path || '(none)') + '. Files: ' + PATHS.join(', '));
  return { path: hit, content: FILES[hit] };
}

export const COMMANDS: Record<string, Command> = {
  '/help': {
    help: 'list commands',
    run: () => ({
      blocks: [
        {
          kind: 'help',
          rows: COMMAND_NAMES.map((cmd) => ({ cmd, desc: COMMANDS[cmd]?.help ?? '' })),
          footer: HELP_FOOTER,
        },
      ],
    }),
  },
  '/about': { help: 'who Joris is', run: () => ({ blocks: cat('README.md') }) },
  '/start': { help: 'dates, length, on-site', run: () => ({ blocks: cat('availability.md') }) },
  '/visa': { help: 'what hosting him involves', run: () => ({ blocks: cat('visa.md') }) },
  '/experience': {
    help: 'every role, newest first',
    run: () => ({
      blocks: (['arztkonsultation', 'nova-digital', 'groupera', 'buildnext'] as const).flatMap(
        (n) => cat(`experience/${n}.md`),
      ),
    }),
  },
  '/projects': {
    help: 'case studies',
    run: () => ({
      blocks: [...cat('projects/streak-system.md'), ...cat('projects/this-portfolio.md')],
    }),
  },
  '/stack': { help: 'what he builds with', run: () => ({ blocks: cat('stack.json') }) },
  '/why': { help: 'why the US', run: () => ({ blocks: cat('why-usa.md') }) },
  '/contact': { help: 'email, linkedin, github', run: () => ({ blocks: cat('contact.md') }) },
  '/resume': { help: 'the résumé', run: () => ({ blocks: [out(resumeLine('résumé'))] }) },
  '/ls': {
    help: 'list files',
    run: () => ({
      blocks: [
        { kind: 'tool', name: 'list_files', result: PATHS.length + ' files' },
        out(PATHS.join('\n')),
      ],
    }),
  },
  '/cat': {
    help: 'print a file: /cat visa.md',
    run: (arg) => {
      try {
        const f = readFile(arg);
        return {
          blocks: [
            { kind: 'tool', name: 'read_file', arg: f.path, result: 'read' },
            out(f.content),
          ],
        };
      } catch (e) {
        return { blocks: [out((e as Error).message, 'err')] };
      }
    },
  },
  '/theme': {
    help: 'switch light / dark',
    run: (_arg, ctx) => {
      const next: Theme = ctx.theme === 'dark' ? 'light' : 'dark';
      return { blocks: [out('theme: ' + next, 'd')], effect: { type: 'theme', next } };
    },
  },
  '/clear': { help: 'clear the screen', run: () => ({ blocks: [], effect: { type: 'clear' } }) },
};

export const COMMAND_NAMES = Object.keys(COMMANDS);

/** Runs a line starting with "/". Unknown commands return an error block. */
export function runCommand(text: string, ctx: CommandContext): CommandResult {
  const parts = text.trim().split(/\s+/);
  const name = (parts[0] ?? '').toLowerCase();
  const arg = parts.slice(1).join(' ');
  const cmd = COMMANDS[name];
  if (!cmd) return { blocks: [out('unknown command ' + name + '. try /help', 'err')] };
  return cmd.run(arg, ctx);
}

/** Commands whose name starts with the first word typed, for the "/" menu. */
export function matchCommands(value: string): string[] {
  const first = value.trim().toLowerCase().split(' ')[0] ?? '';
  return COMMAND_NAMES.filter((c) => c.startsWith(first));
}
