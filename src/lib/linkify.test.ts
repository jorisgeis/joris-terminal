import { describe, expect, it } from 'vitest';
import { linkify } from './linkify';

describe('linkify', () => {
  it('links email, profiles and URLs', () => {
    expect(
      linkify('Email geis.joris@gmail.com or linkedin.com/in/jorisgeis, see https://x.test/a'),
    ).toEqual([
      { text: 'Email ' },
      { text: 'geis.joris@gmail.com', href: 'mailto:geis.joris@gmail.com', external: false },
      { text: ' or ' },
      {
        text: 'linkedin.com/in/jorisgeis',
        href: 'https://linkedin.com/in/jorisgeis',
        external: true,
      },
      { text: ', see ' },
      { text: 'https://x.test/a', href: 'https://x.test/a', external: true },
    ]);
  });

  it('returns plain text untouched', () => {
    expect(linkify('no links here')).toEqual([{ text: 'no links here' }]);
  });
});
