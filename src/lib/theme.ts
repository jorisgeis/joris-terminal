export type Theme = 'light' | 'dark';

export const THEME_KEY = 'jg-theme';

export function currentTheme(): Theme {
  const set = document.documentElement.getAttribute('data-theme');
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage can be blocked; the theme still applies for this visit
  }
}
