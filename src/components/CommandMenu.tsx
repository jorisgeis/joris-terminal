import { COMMANDS } from '../lib/commands';

interface Props {
  items: string[];
  sel: number;
  onPick: (cmd: string) => void;
}

export function CommandMenu({ items, sel, onPick }: Props) {
  return (
    <div
      id="menu"
      className={'menu' + (items.length ? ' on' : '')}
      role="listbox"
      aria-label="Commands"
    >
      {items.map((c, i) => (
        <button
          key={c}
          type="button"
          role="option"
          className={i === sel ? 'sel' : ''}
          aria-selected={i === sel}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(c)}
        >
          <span className="c">{c}</span>
          <span className="h">{COMMANDS[c]?.help}</span>
        </button>
      ))}
    </div>
  );
}
