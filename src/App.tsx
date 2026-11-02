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
          <button
            className="theme-switch"
            type="button"
            role="switch"
            aria-label="Dark theme"
            aria-checked={t.theme === 'dark'}
            title={t.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={t.toggleTheme}
          >
            <span className="theme-switch-thumb" aria-hidden="true" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
            </svg>
          </button>
        </nav>
      </header>
      <main id="log" className="log" aria-live="polite" aria-label="Conversation" ref={t.logRef}>
        <Banner />
        <SummaryCard />
        <p className="meta">
          Ask about my work below, or type <span style={{ color: 'var(--accent-ink)' }}>/</span> for
          commands.
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
