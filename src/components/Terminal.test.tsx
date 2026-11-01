import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';

// With motion allowed, answers wait and type out, so Escape has something to stop.
describe('Terminal with animation', () => {
  let original: typeof window.matchMedia;
  beforeEach(() => {
    original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: false,
    })) as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  it('shows busy state, then stops on Escape', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const input = screen.getByLabelText('Ask a question or type a command');
    await user.type(input, 'the streak system{Enter}');
    expect(screen.getByRole('button', { name: '…' })).toBeDisabled();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(container.querySelector('.turn .out.d')).toHaveTextContent('stopped.'),
    );
    expect(container.querySelector('.turn .ans')).toBeNull();
    expect(screen.getByRole('button', { name: 'ask' })).toBeEnabled();
  });

  it('types the answer out and links it when done', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.type(
      screen.getByLabelText('Ask a question or type a command'),
      'how do I contact him?{Enter}',
    );
    await waitFor(
      () =>
        expect(container.querySelector('.turn .ans a')).toHaveTextContent('geis.joris@gmail.com'),
      { timeout: 3000 },
    );
    expect(container.querySelector('.turn .ans')).toHaveTextContent(/^Email is fastest/);
  });
});
