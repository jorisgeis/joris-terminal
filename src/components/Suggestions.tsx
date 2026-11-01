import { track } from '../lib/track';

export const SUGGESTIONS = ['How does hosting work?', 'The streak system', 'Tech stack', '/help'];

export function Suggestions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div id="suggest" className="suggest">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            track('chip_click', { chip: s });
            onPick(s);
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
