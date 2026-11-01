import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from './track';

describe('track', () => {
  afterEach(() => {
    delete window.plausible;
  });

  it('does nothing without Plausible', () => {
    expect(() => track('page_view')).not.toThrow();
  });

  it('forwards to window.plausible with props', () => {
    const plausible = vi.fn();
    window.plausible = plausible;
    track('answer', { topic: 'visa' });
    expect(plausible).toHaveBeenCalledWith('answer', { props: { topic: 'visa' } });
  });

  it('swallows analytics errors', () => {
    window.plausible = () => {
      throw new Error('blocked');
    };
    expect(() => track('page_view')).not.toThrow();
  });
});
