import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EMAIL } from '../content/config';
import { lineCount } from '../content/files';
import { runCommand } from '../lib/commands';
import { route, type Routed } from '../lib/route';
import { applyTheme, currentTheme } from '../lib/theme';
import { track } from '../lib/track';
import type { Block, TurnData } from '../lib/types';

class Cancelled extends Error {}

export function useTerminal() {
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [busy, setBusyState] = useState(false);
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sel, setSel] = useState(0);

  const busyRef = useRef(false);
  const ctlRef = useRef<AbortController | null>(null);
  const history = useRef<string[]>([]);
  const historyIdx = useRef(-1);
  const nextId = useRef(1);
  const interacted = useRef(false);
  const logRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useLayoutEffect(() => {
    const log = logRef.current;
    if (interacted.current && log) log.scrollTop = log.scrollHeight;
  }, [turns]);

  useEffect(() => () => ctlRef.current?.abort(), []);

  // Lets the stylesheet move a classic scrollbar into the page margin (see .log in global.css).
  useLayoutEffect(() => {
    const log = logRef.current;
    if (log) log.style.setProperty('--sbw', log.offsetWidth - log.clientWidth + 'px');
  }, []);

  const setBusy = (b: boolean) => {
    busyRef.current = b;
    setBusyState(b);
    if (!b) ctlRef.current = null;
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSel(0);
  }, []);

  const wait = useCallback(
    (ms: number, signal: AbortSignal) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new Cancelled());
        const t = setTimeout(resolve, reduce ? 0 : ms);
        signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new Cancelled());
        });
      }),
    [reduce],
  );

  const play = useCallback(
    async (id: number, hit: Routed, signal: AbortSignal) => {
      const update = (fn: (blocks: Block[]) => Block[]) =>
        setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, blocks: fn(t.blocks) } : t)));
      const patch = (index: number, changes: Partial<Block>) =>
        update((bs) => bs.map((b, i) => (i === index ? ({ ...b, ...changes } as Block) : b)));

      track('answer', { topic: hit.topic });
      if (hit.topic === 'fallback_unmatched') track('fallback_unmatched');

      try {
        await wait(150, signal);
        for (const [i, path] of hit.files.entries()) {
          update((bs) => [...bs, { kind: 'tool', name: 'read_file', arg: path, result: '' }]);
          await wait(220, signal);
          patch(i, { result: 'read ' + lineCount(path) + ' lines' });
        }
      } catch {
        update((bs) => [...bs, { kind: 'out', text: 'stopped.', cls: 'd' }]);
        return;
      }

      const full = hit.answer;
      const at = hit.files.length;
      update((bs) => [...bs, { kind: 'ans', text: full, shown: reduce ? full.length : 0 }]);
      if (reduce) return;
      await new Promise<void>((resolve) => {
        let n = 0;
        const t = setInterval(() => {
          n += 4;
          if (signal.aborted || n >= full.length) {
            clearInterval(t);
            patch(at, { shown: full.length });
            return resolve();
          }
          patch(at, { shown: n });
        }, 12);
      });
    },
    [reduce, wait],
  );

  const run = useCallback(
    (raw: string) => {
      const text = String(raw || '').trim();
      if (!text || busyRef.current) return;
      track('question_submitted', { command: text.startsWith('/') });
      history.current.push(text);
      historyIdx.current = -1;
      setValue('');
      closeMenu();
      interacted.current = true;
      const id = nextId.current++;
      const add = (blocks: Block[]) => setTurns((ts) => [...ts, { id, input: text, blocks }]);

      if (text.startsWith('/')) {
        const res = runCommand(text, { theme: currentTheme() });
        if (res.effect?.type === 'clear') return setTurns([]);
        if (res.effect?.type === 'theme') applyTheme(res.effect.next);
        return add(res.blocks);
      }
      if (/^sudo\s+hire\s+joris/i.test(text)) {
        return add([
          { kind: 'out', text: '[sudo] password for recruiter: ********', cls: 'd' },
          { kind: 'out', text: 'access granted. next step: ' + EMAIL },
        ]);
      }

      add([]);
      const ctl = new AbortController();
      ctlRef.current = ctl;
      setBusy(true);
      void play(id, route(text), ctl.signal).then(() => {
        setBusy(false);
        inputRef.current?.focus({ preventScroll: true });
      });
    },
    [closeMenu, play],
  );

  /** Stops a running answer. Returns false if nothing was running. */
  const stop = useCallback(() => {
    if (!ctlRef.current) return false;
    ctlRef.current.abort();
    return true;
  }, []);

  /** Moves through past inputs; returns false when there is nothing to move to. */
  const historyStep = useCallback((dir: 'up' | 'down') => {
    const past = history.current;
    if (dir === 'up') {
      if (!past.length) return false;
      historyIdx.current =
        historyIdx.current < 0 ? past.length - 1 : Math.max(0, historyIdx.current - 1);
      setValue(past[historyIdx.current] ?? '');
      return true;
    }
    if (historyIdx.current < 0) return false;
    historyIdx.current += 1;
    if (historyIdx.current >= past.length) {
      historyIdx.current = -1;
      setValue('');
    } else setValue(past[historyIdx.current] ?? '');
    return true;
  }, []);

  return {
    turns,
    busy,
    value,
    setValue,
    menuOpen,
    setMenuOpen,
    sel,
    setSel,
    closeMenu,
    run,
    stop,
    historyStep,
    logRef,
    inputRef,
  };
}

export type TerminalState = ReturnType<typeof useTerminal>;
