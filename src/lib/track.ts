type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (name: string, options: { props: Props }) => void;
  }
}

/**
 * Analytics hook: only does something if you self-host and load Plausible.
 * Never send what visitors type through it.
 */
export function track(name: string, props?: Props): void {
  try {
    if (typeof window.plausible === 'function') window.plausible(name, { props: props ?? {} });
  } catch {
    // analytics must never break the page
  }
}
