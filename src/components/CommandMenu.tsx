export interface MenuItem {
  label: string;
  hint: string;
}

interface Props {
  label: string;
  items: MenuItem[];
  sel: number;
  onPick: (label: string) => void;
}

/** The pop-up list above the prompt: slash commands, or files after "/cat ". */
export function CommandMenu({ label, items, sel, onPick }: Props) {
  return (
    <div
      id="menu"
      className={'menu' + (items.length ? ' on' : '')}
      role="listbox"
      aria-label={label}
    >
      {items.map((item, i) => (
        <button
          key={item.label}
          type="button"
          role="option"
          className={i === sel ? 'sel' : ''}
          aria-selected={i === sel}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(item.label)}
        >
          <span className="c">{item.label}</span>
          <span className="h">{item.hint}</span>
        </button>
      ))}
    </div>
  );
}
