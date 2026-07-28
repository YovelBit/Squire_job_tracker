import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import * as jobsApi from '../api/jobs';

vi.mock('../api/jobs', async () => {
  const actual = await vi.importActual<typeof import('../api/jobs')>('../api/jobs');
  return {
    ...actual,
    filterJobs: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    deleteJob: vi.fn()
  };
});

const sampleJobs: jobsApi.Job[] = [
  {
    public_id: '1',
    company_display: 'Acme',
    title_display: 'Engineer',
    status: 'Interview',
    date_applied: '2026-07-25'
  },
  {
    public_id: '2',
    company_display: 'Globex',
    title_display: 'Designer',
    status: 'Rejected',
    date_applied: '2026-07-01'
  }
];

describe('DashboardPage KPI click-to-filter', () => {
  beforeEach(() => {
    vi.mocked(jobsApi.filterJobs).mockResolvedValue(sampleJobs);
  });

  it('hides Rejected jobs when Active Pipeline is clicked, and restores them on a second click', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByText('Globex')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.queryByText('Globex')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('clears an active quick filter when Clear Filters is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Active Pipeline/i }));
    expect(screen.queryByText('Globex')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });
});
