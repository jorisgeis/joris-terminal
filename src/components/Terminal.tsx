import { useEffect, type KeyboardEvent } from 'react';
import type { TerminalState } from '../hooks/useTerminal';
import { matchCommands } from '../lib/commands';
import { CommandMenu } from './CommandMenu';

/** The input dock: "/" command menu, prompt, history and stop-on-Escape. */
export function Terminal({ t }: { t: TerminalState }) {
  const { value, setValue, menuOpen, setMenuOpen, sel, setSel, closeMenu, run, inputRef } = t;

  const items =
    menuOpen && value.startsWith('/') && !value.includes(' ') ? matchCommands(value) : [];
  const menuOn = items.length > 0;
  const selIdx = Math.min(sel, items.length - 1);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [inputRef]);

  const pick = (c: string) => {
    if (c === '/cat') {
      setValue('/cat ');
      closeMenu();
      inputRef.current?.focus();
    } else run(c);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (!t.stop()) {
        if (menuOn) closeMenu();
        else setValue('');
      }
      e.preventDefault();
      return;
    }
    if (menuOn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const n = items.length;
      setSel((selIdx + (e.key === 'ArrowDown' ? 1 : n - 1)) % n);
      e.preventDefault();
      return;
    }
    if (menuOn && e.key === 'Tab') {
      const m = items[selIdx];
      if (m) setValue(m + (m === '/cat' ? ' ' : ''));
      e.preventDefault();
      return;
    }
    if (menuOn && e.key === 'Enter') {
      const c = items[selIdx];
      if (c && value.trim() !== c && c !== '/cat') {
        e.preventDefault();
        run(c);
        return;
      }
    }
    if (!menuOn && e.key === 'ArrowUp' && t.historyStep('up')) e.preventDefault();
    else if (!menuOn && e.key === 'ArrowDown' && t.historyStep('down')) e.preventDefault();
  };

  return (
    <div className="dock">
      <CommandMenu items={items} sel={selIdx} onPick={pick} />
      <form
        id="form"
        className="box"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
        }}
      >
        <span className="p" aria-hidden="true">
          ›
        </span>
        <label htmlFor="q" className="sr">
          Ask a question or type a command
        </label>
        <input
          id="q"
          ref={inputRef}
          type="text"
          placeholder="what did joris build at groupera?"
          maxLength={400}
          spellCheck={false}
          autoCapitalize="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSel(0);
            setMenuOpen(true);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(closeMenu, 120)}
        />
        <button id="go" type="submit" disabled={t.busy}>
          {t.busy ? '…' : 'ask'}
        </button>
      </form>
      <div className="hints">
        <span>/ commands · ↑ history · esc stops</span>
      </div>
    </div>
  );
}
