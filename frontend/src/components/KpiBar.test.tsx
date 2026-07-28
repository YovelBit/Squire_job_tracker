import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Job } from '../api/jobs';
import KpiBar from './KpiBar';

const job = (overrides: Partial<Job>): Job => ({
  public_id: overrides.public_id ?? Math.random().toString(),
  company_display: 'Acme',
  title_display: 'Engineer',
  status: 'Applied',
  ...overrides
});

const jobs: Job[] = [
  job({ public_id: '1', status: 'Interview', date_applied: '2026-07-27' }),
  job({ public_id: '2', status: 'Offer', date_applied: '2026-07-27' }),
  job({ public_id: '3', status: 'Rejected', date_applied: '2026-07-01' }),
  job({ public_id: '4', status: 'Applied', next_action: '2020-01-01' })
];

describe('KpiBar', () => {
  it('renders all four KPI cards with computed values', () => {
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByText('Weekly Momentum')).toBeInTheDocument();
    expect(screen.getByText('Response Rate')).toBeInTheDocument();
    expect(screen.getByText('Active Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Action Items')).toBeInTheDocument();
    // Active Pipeline excludes the Rejected job -> 3 active
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders 0% response rate for an empty jobs array without throwing', () => {
    render(<KpiBar jobs={[]} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('toggles activePipeline filter on when its card is clicked', async () => {
    const onFilterToggle = vi.fn();
    const user = userEvent.setup();
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={onFilterToggle} />);
    await user.click(screen.getByText('Active Pipeline'));
    expect(onFilterToggle).toHaveBeenCalledWith('activePipeline');
  });

  it('toggles activePipeline filter off when its card is already active', async () => {
    const onFilterToggle = vi.fn();
    const user = userEvent.setup();
    render(<KpiBar jobs={jobs} activeFilter="activePipeline" onFilterToggle={onFilterToggle} />);
    await user.click(screen.getByText('Active Pipeline'));
    expect(onFilterToggle).toHaveBeenCalledWith(null);
  });

  it('marks the Action Items card as warning when its count is greater than zero', () => {
    render(<KpiBar jobs={jobs} activeFilter={null} onFilterToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /Action Items/i })).toHaveClass('warning');
  });
});
