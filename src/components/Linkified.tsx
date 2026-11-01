import { linkify } from '../lib/linkify';

export function Linkified({ text }: { text: string }) {
  return (
    <>
      {linkify(text).map((s, i) =>
        s.href ? (
          <a key={i} href={s.href} {...(s.external && { target: '_blank', rel: 'noopener' })}>
            {s.text}
          </a>
        ) : (
          s.text
        ),
      )}
    </>
  );
}
