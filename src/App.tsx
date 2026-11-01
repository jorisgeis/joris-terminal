import { useEffect } from 'react';
import { CONFIG } from './content/config';
import { Banner } from './components/Banner';
import { Suggestions } from './components/Suggestions';
import { SummaryCard } from './components/SummaryCard';
import { Terminal } from './components/Terminal';
import { Turn } from './components/Turn';
import { useTerminal } from './hooks/useTerminal';
import { track } from './lib/track';

/** Link clicks are tracked by kind only; never by what anyone typed. */
function trackClick(e: MouseEvent) {
  const a = e.target instanceof Element ? e.target.closest('a') : null;
  if (!a) return;
  const h = a.getAttribute('href') ?? '';
  const k = a.getAttribute('data-href');
  if (h.startsWith('mailto:')) track('cta_email_click');
  else if (k) track(k + '_click');
  else if (h.includes('linkedin')) track('linkedin_click');
  else if (h.includes('github')) track('github_click');
}

export function App() {
  const t = useTerminal();

  useEffect(() => {
    document.addEventListener('click', trackClick);
    track('page_view', { ref: location.hash.replace('#', '') || 'none' });
    return () => document.removeEventListener('click', trackClick);
  }, []);

  return (
    <div className="app">
      <header className="top">
        <span className="status">updated Nov 2026</span>
        <nav aria-label="Links">
          <a href="mailto:geis.joris@gmail.com">email</a>
          <a href="https://linkedin.com/in/jorisgeis">linkedin</a>
          <a href="https://github.com/jorisgeis">github</a>
          {CONFIG.RESUME_URL && (
            <a data-href="resume" href={CONFIG.RESUME_URL} target="_blank" rel="noopener">
              résumé
            </a>
          )}
          <button id="themeBtn" type="button" onClick={() => t.run('/theme')}>
            theme
          </button>
        </nav>
      </header>
      <main id="log" className="log" aria-live="polite" aria-label="Conversation" ref={t.logRef}>
        <Banner />
        <SummaryCard />
        <p className="meta">
          Ask about my work below, or type <span style={{ color: 'var(--accent-ink)' }}>/</span>{' '}
          for commands. Every answer is one I wrote.
        </p>
        <Suggestions onPick={t.run} />
        {t.turns.map((turn) => (
          <Turn key={turn.id} turn={turn} />
        ))}
      </main>
      <Terminal t={t} />
    </div>
  );
}
