const FONT: Record<string, string[]> = {
  J: ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
  O: [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
  R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
  I: ['███', ' █ ', ' █ ', ' █ ', '███'],
  S: [' ████', '█    ', ' ███ ', '    █', '████ '],
  G: [' ████', '█    ', '█  ██', '█   █', ' ███ '],
  E: ['█████', '█    ', '████ ', '█    ', '█████'],
  ' ': ['   ', '   ', '   ', '   ', '   '],
};

function render(word: string): string {
  const lines = ['', '', '', '', ''];
  for (const ch of word) FONT[ch]?.forEach((row, r) => (lines[r] += row + ' '));
  return lines.join('\n');
}

const TEXT = render('JORIS GEIS');

/** ASCII name banner; hidden below 600px by the stylesheet. */
export function Banner() {
  return (
    <pre id="banner" className="banner" role="img" aria-label="Joris Geis">
      {TEXT}
    </pre>
  );
}
