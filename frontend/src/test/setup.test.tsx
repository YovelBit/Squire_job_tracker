import { render, screen } from '@testing-library/react';

describe('test infrastructure smoke test', () => {
  it('renders into jsdom and jest-dom matchers work', () => {
    render(<div>hello kpi bar</div>);
    expect(screen.getByText('hello kpi bar')).toBeInTheDocument();
  });
});
