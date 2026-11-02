import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { COMMAND_NAMES } from './lib/commands';

const setup = () => {
  const user = userEvent.setup();
  render(<App />);
  const input = screen.getByLabelText('Ask a question or type a command');
  const log = screen.getByRole('main', { name: 'Conversation' });
  return { user, input, log };
};

const lastTurn = (log: HTMLElement) => {
  const turns = log.querySelectorAll('.turn');
  return turns[turns.length - 1] as HTMLElement;
};

describe('App', () => {
  afterEach(() => {
    delete window.plausible;
  });

  it('focuses the input on load', () => {
    const { input } = setup();
    expect(input).toHaveFocus();
  });

  it('answers a typed question after reading its file', async () => {
    const { user, input, log } = setup();
    await user.type(input, 'when can he start?{Enter}');
    const turn = lastTurn(log);
    expect(within(turn).getByText('when can he start?')).toBeInTheDocument();
    await waitFor(() =>
      expect(turn.querySelector('.ans')).toHaveTextContent(/^He can start as soon as possible/),
    );
    expect(turn.querySelector('.tool')).toHaveTextContent(
      '▸ read_file availability.md└ read 6 lines',
    );
    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: 'ask' })).toBeEnabled();
  });

  it('links the email in answers', async () => {
    const { user, input, log } = setup();
    await user.type(input, 'what is his salary?{Enter}');
    await waitFor(() =>
      expect(
        within(lastTurn(log)).getByRole('link', { name: 'geis.joris@gmail.com' }),
      ).toHaveAttribute('href', 'mailto:geis.joris@gmail.com'),
    );
  });

  it('runs suggestion chips', async () => {
    const { user, log } = setup();
    await user.click(screen.getByRole('button', { name: '/help' }));
    const out = lastTurn(log).querySelector('.out');
    for (const c of COMMAND_NAMES) expect(out).toHaveTextContent(c);
  });

  it('opens the / menu and runs the selected command with Enter', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/c');
    const menu = screen.getByRole('listbox', { name: 'Commands' });
    expect(
      within(menu)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual([
      '/contactemail, linkedin, github',
      '/catprint a file: /cat visa.md',
      '/clearclear the screen',
    ]);
    await user.keyboard('{Enter}');
    expect(lastTurn(log)).toHaveTextContent('/contact');
    expect(lastTurn(log)).toHaveTextContent('▸ read_file contact.md');
    expect(menu).not.toHaveClass('on');
  });

  it('completes /cat with Tab and prints a file', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/ca');
    await user.keyboard('{Tab}');
    expect(input).toHaveValue('/cat ');
    expect(screen.getByRole('listbox', { name: 'Files' })).toHaveTextContent('visa.md');
    await user.type(input, 'vi');
    await user.keyboard('{Tab}');
    expect(input).toHaveValue('/cat visa.md');
    await user.keyboard('{Enter}');
    expect(lastTurn(log)).toHaveTextContent('read_file visa.md');
    expect(lastTurn(log)).toHaveTextContent('J-1 Intern visa: what hosting involves');
  });

  it('completes shared folders first, then the highlighted file', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/cat exp');
    await user.keyboard('{Tab}');
    expect(input).toHaveValue('/cat experience/');
    const files = within(screen.getByRole('listbox', { name: 'Files' })).getAllByRole('option');
    expect(files.map((o) => o.querySelector('.c')?.textContent)).toEqual([
      'experience/arztkonsultation.md',
      'experience/nova-digital.md',
      'experience/groupera.md',
      'experience/buildnext.md',
    ]);
    await user.keyboard('{ArrowDown}{ArrowDown}{Tab}');
    expect(input).toHaveValue('/cat experience/groupera.md');
    await user.keyboard('{Enter}');
    expect(lastTurn(log)).toHaveTextContent('read_file experience/groupera.md');
  });

  it('opens a file by clicking it in the menu', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/cat st');
    await user.click(screen.getByRole('option', { name: /stack\.json/ }));
    expect(lastTurn(log)).toHaveTextContent('read_file stack.json');
  });

  it('shows an error for a missing file', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/cat nope{Enter}');
    expect(lastTurn(log).querySelector('.out.err')).toHaveTextContent(/^no such file: nope\./);
  });

  it('recalls history with the arrow keys', async () => {
    const { user, input } = setup();
    await user.type(input, '/ls{Enter}');
    await user.type(input, '/why{Enter}');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('/why');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('/ls');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveValue('');
  });

  it('clears the input with Escape', async () => {
    const { user, input } = setup();
    await user.type(input, 'hello');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
  });

  it('switches themes without changing a draft or adding a conversation turn', async () => {
    const { user, input, log } = setup();
    const toggle = screen.getByRole('switch', { name: 'Dark theme' });
    await user.type(input, 'my unfinished question');
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('jg-theme')).toBe('dark');
    expect(input).toHaveValue('my unfinished question');
    expect(log.querySelector('.turn')).toBeNull();
    expect(toggle).toHaveFocus();
    await user.keyboard(' ');
    expect(toggle).not.toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('jg-theme')).toBe('light');
  });

  it('keeps the switch in sync with /theme commands', async () => {
    const { user, input, log } = setup();
    const toggle = screen.getByRole('switch', { name: 'Dark theme' });
    await user.type(input, '/theme{Enter}');
    expect(toggle).toBeChecked();
    expect(lastTurn(log)).toHaveTextContent('theme: dark');
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    await user.type(input, '/theme{Enter}');
    expect(toggle).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('/clear removes every turn', async () => {
    const { user, input, log } = setup();
    await user.type(input, '/ls{Enter}');
    await user.type(input, '/clear{Enter}');
    expect(log.querySelectorAll('.turn')).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Joris Geis' })).toBeInTheDocument();
  });

  it('never sends typed text to analytics', async () => {
    const plausible = vi.fn();
    window.plausible = plausible;
    const { user, input, log } = setup();
    await user.type(input, 'my secret question about visa{Enter}');
    await waitFor(() => expect(lastTurn(log).querySelector('.ans')).not.toBeNull());
    expect(JSON.stringify(plausible.mock.calls)).not.toContain('secret');
    expect(plausible).toHaveBeenCalledWith('answer', { props: { topic: 'visa' } });
    expect(plausible).toHaveBeenCalledWith('question_submitted', { props: { command: false } });
  });
});
