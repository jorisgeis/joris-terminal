import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../content/config';
import { SummaryCard } from './SummaryCard';

describe('SummaryCard', () => {
  it('shows the start date', () => {
    render(<SummaryCard />);
    expect(screen.getByText('as soon as possible')).toBeInTheDocument();
    expect(screen.getByText('start')).toBeInTheDocument();
  });

  it('hides the fee line and the Code button while those values are empty', () => {
    expect(CONFIG.FEE).toBe('');
    expect(CONFIG.ARTIFACT_URL).toBe('');
    render(<SummaryCard />);
    expect(screen.queryByTestId('fee')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Code' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3 + 4); // hosting details + jobs
  });

  it('links the Résumé button to the CONFIG URL in a new tab', () => {
    render(<SummaryCard />);
    const resume = screen.getByRole('link', { name: 'Résumé' });
    expect(resume).toHaveAttribute('href', CONFIG.RESUME_URL);
    expect(resume).toHaveAttribute('target', '_blank');
    expect(resume).toHaveAttribute('rel', 'noopener');
  });

  it('shows the fee and Code button once they are filled in', () => {
    render(
      <SummaryCard
        config={{ ...CONFIG, FEE: 'I cover the sponsor fee.', ARTIFACT_URL: 'https://x.test/r' }}
      />,
    );
    expect(screen.getByTestId('fee')).toHaveTextContent('I cover the sponsor fee.');
    expect(screen.getByRole('link', { name: 'Code' })).toHaveAttribute('href', 'https://x.test/r');
  });

  it('hides the start row and graduation year when empty', () => {
    render(<SummaryCard config={{ ...CONFIG, START: '', GRAD: '' }} />);
    expect(screen.queryByText('start')).not.toBeInTheDocument();
    expect(screen.queryByText(/graduating/)).not.toBeInTheDocument();
  });

  it('keeps "What else hosting involves" collapsed', () => {
    const { container } = render(<SummaryCard />);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
    expect(screen.getByText('What else hosting involves').tagName).toBe('SUMMARY');
  });
});
