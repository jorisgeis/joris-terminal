import { useEffect, type KeyboardEvent } from 'react';
import { lineCount, type FilePath } from '../content/files';
import type { TerminalState } from '../hooks/useTerminal';
import { COMMANDS, completeFile, fileCandidates, matchCommands } from '../lib/commands';
import { CommandMenu, type MenuItem } from './CommandMenu';

const CAT = /^\/cat\s+(\S*)$/i;

/** The input dock: "/" command menu, file completion, prompt, history and stop-on-Escape. */
export function Terminal({ t }: { t: TerminalState }) {
  const { value, setValue, menuOpen, setMenuOpen, sel, setSel, closeMenu, run, inputRef } = t;

  const cat = CAT.exec(value);
  const partial = cat?.[1] ?? '';
  const files: FilePath[] = menuOpen && cat ? fileCandidates(partial) : [];
  const commands =
    menuOpen && value.startsWith('/') && !value.includes(' ') ? matchCommands(value) : [];
  const items: MenuItem[] = cat
    ? files.map((p) => ({ label: p, hint: lineCount(p) + ' lines' }))
    : commands.map((c) => ({ label: c, hint: COMMANDS[c]?.help ?? '' }));
  const menuOn = items.length > 0;
  const selIdx = Math.min(sel, items.length - 1);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [inputRef]);

  const openCat = (path = '') => {
    setValue('/cat ' + path);
    setSel(0);
    setMenuOpen(true);
  };

  const pick = (label: string) => {
    if (cat) run('/cat ' + label);
    else if (label === '/cat') {
      openCat();
      inputRef.current?.focus();
    } else run(label);
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
    if (e.key === 'Tab' && cat) {
      // Like a shell: complete as far as the matches agree, then take the highlighted file.
      const done = completeFile(partial);
      if (done && done !== partial) openCat(done);
      else if (menuOn && items[selIdx]) openCat(items[selIdx].label);
      else setMenuOpen(true);
      e.preventDefault();
      return;
    }
    if (menuOn && e.key === 'Tab') {
      const m = items[selIdx]?.label;
      if (m === '/cat') openCat();
      else if (m) setValue(m);
      e.preventDefault();
      return;
    }
    if (menuOn && e.key === 'Enter') {
      const c = items[selIdx]?.label;
      if (cat && c && c !== partial) {
        e.preventDefault();
        run('/cat ' + c);
        return;
      }
      if (!cat && c === '/cat') {
        e.preventDefault();
        openCat();
        return;
      }
      if (!cat && c && value.trim() !== c) {
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
      <CommandMenu label={cat ? 'Files' : 'Commands'} items={items} sel={selIdx} onPick={pick} />
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
        <span>
          / commands<span className="wide"> · tab completes</span> · ↑ history · esc stops
        </span>
      </div>
    </div>
  );
}
