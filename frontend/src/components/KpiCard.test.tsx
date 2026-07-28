import { fireEvent, render, screen } from '@testing-library/react';
import KpiCard from './KpiCard';

describe('KpiCard', () => {
  it('renders title, value, and subtitle', () => {
    render(<KpiCard title="Weekly Momentum" value={3} subtitle="12 in the last 30 days" />);
    expect(screen.getByText('Weekly Momentum')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12 in the last 30 days')).toBeInTheDocument();
  });

  it('omits the subtitle element when none is given', () => {
    render(<KpiCard title="Response Rate" value="42%" />);
    expect(screen.queryByText(/in the last/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked, and is keyboard-activatable', () => {
    const onClick = vi.fn();
    render(<KpiCard title="Active Pipeline" value={5} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /Active Pipeline/i });
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('is not a button role when onClick is not provided', () => {
    render(<KpiCard title="Weekly Momentum" value={3} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the active class when isActive is true', () => {
    render(<KpiCard title="Active Pipeline" value={5} isActive onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('active');
  });

  it('applies the warning class when isWarning is true', () => {
    render(<KpiCard title="Action Items" value={2} isWarning onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('warning');
  });
});
